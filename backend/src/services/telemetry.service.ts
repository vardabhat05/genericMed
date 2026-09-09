import { Response } from 'express';
import { operationsRepository } from '../repositories/operations.repository';
import { auditService } from './audit.service';

export interface TelemetryPacket {
  event: 'cold_chain_reading' | 'cold_chain_excursion' | 'courier_gps' | 'order_update';
  nodeId: string;
  timestamp: string;
  data: Record<string, any>;
}

export class TelemetryService {
  private activeClients: Set<Response> = new Set();
  private intervalTimer: NodeJS.Timeout | null = null;
  private currentTemp: number = 3.4;

  constructor() {
    this.startHeartbeat();
  }

  public registerClient(res: Response): void {
    this.activeClients.add(res);

    // Send initial handshake packet
    this.sendToClient(res, {
      event: 'cold_chain_reading',
      nodeId: 'STORE-NODE-004',
      timestamp: new Date().toISOString(),
      data: {
        nodeName: 'Apollo Pharmacy - Downtown Hub',
        temperatureCelsius: this.currentTemp,
        humidityPct: 42.1,
        status: 'nominal',
        activeBatchesTracked: 142,
      },
    });

    res.on('close', () => {
      this.activeClients.delete(res);
    });
  }

  public getActiveClientCount(): number {
    return this.activeClients.size;
  }

  public broadcast(packet: TelemetryPacket): void {
    const message = `event: ${packet.event}\ndata: ${JSON.stringify(packet)}\n\n`;
    for (const client of this.activeClients) {
      try {
        client.write(message);
      } catch {
        this.activeClients.delete(client);
      }
    }
  }

  public async simulateColdChainExcursion(
    tempCelsius: number = 9.4,
    nodeId: string = 'STORE-NODE-004'
  ): Promise<{ message: string; alertPacket: TelemetryPacket }> {
    this.currentTemp = tempCelsius;

    const alertPacket: TelemetryPacket = {
      event: 'cold_chain_excursion',
      nodeId,
      timestamp: new Date().toISOString(),
      data: {
        alert: 'CRITICAL_TEMPERATURE_EXCURSION',
        temperatureCelsius: tempCelsius,
        thresholdMaxCelsius: 8.0,
        severity: 'critical',
        actionRequired: 'Automated batch quarantine protocol initiated',
      },
    };

    // Broadcast immediately to all connected clients
    this.broadcast(alertPacket);

    // Automatically create an operational exception
    const excId = `exc-${Date.now().toString().slice(-4)}`;
    await operationsRepository.createMapping({
      rawSearchTerm: `Cold-Chain Excursion [${nodeId}]`,
      suggestedCanonicalSalt: `Node ${nodeId} Excursion (${tempCelsius}°C)`,
      strength: 'Critical Alert',
      confidenceScore: 1.0,
      sourceFeed: 'IoT Telemetry Gateway',
      status: 'pending',
    });

    // Log clinical audit trail
    auditService.logEvent({
      tenantId: nodeId,
      userId: 'system-iot-sensor',
      userRole: 'pharmacy',
      action: 'COLD_CHAIN_EXCURSION_ALERT',
      resource: 'pharmacy_inventory',
      resourceId: nodeId,
      details: {
        temperatureCelsius: tempCelsius,
        thresholdMax: 8.0,
        severity: 'critical',
        exceptionCode: excId,
      },
    });

    return {
      message: `Critical cold-chain excursion (${tempCelsius}°C) broadcast to telemetry stream & exception logged.`,
      alertPacket,
    };
  }

  private sendToClient(res: Response, packet: TelemetryPacket): void {
    try {
      res.write(`event: ${packet.event}\ndata: ${JSON.stringify(packet)}\n\n`);
    } catch {
      this.activeClients.delete(res);
    }
  }

  private startHeartbeat(): void {
    if (this.intervalTimer) return;

    this.intervalTimer = setInterval(() => {
      if (this.activeClients.size === 0) return;

      // Small jitter between 3.2 and 3.6
      const jitter = (Math.random() - 0.5) * 0.2;
      const reading = parseFloat((3.4 + jitter).toFixed(1));

      this.broadcast({
        event: 'cold_chain_reading',
        nodeId: 'STORE-NODE-004',
        timestamp: new Date().toISOString(),
        data: {
          temperatureCelsius: reading,
          humidityPct: parseFloat((42.0 + Math.random()).toFixed(1)),
          status: 'nominal',
        },
      });
    }, 5000);
  }

  public stopHeartbeat(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}

export const telemetryService = new TelemetryService();
