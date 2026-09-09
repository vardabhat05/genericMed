import { Request, Response, NextFunction } from 'express';
import { telemetryService } from '../services/telemetry.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class TelemetryController {
  public streamEvents(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    telemetryService.registerClient(res);
  }

  public async simulateExcursion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { temperature, nodeId } = req.body;
      const temp = temperature ? parseFloat(temperature) : 9.4;
      const result = await telemetryService.simulateColdChainExcursion(temp, nodeId || 'STORE-NODE-004');
      successResponse(res, result.alertPacket, result.message, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  public getStats(req: Request, res: Response): void {
    successResponse(res, {
      activeSubscribers: telemetryService.getActiveClientCount(),
      protocol: 'Server-Sent Events (SSE)',
      monitoredNodes: 142,
    });
  }
}

export const telemetryController = new TelemetryController();
