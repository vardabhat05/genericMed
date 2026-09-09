import { PharmacyStockItem } from '../../src/types';
import { PHARMACY_STOCK } from '../../src/data/mockData';

export interface DispensaryTelemetry {
  nodeId: string;
  nodeName: string;
  deaLicense: string;
  coldChainTempCelsius: number;
  humidityPct: number;
  status: 'nominal' | 'warning' | 'critical';
  activeBatchesManaged: number;
  lastSyncTimestamp: string;
}

export class PharmacyRepository {
  private stock: PharmacyStockItem[];
  private telemetry: DispensaryTelemetry;

  constructor() {
    this.stock = JSON.parse(JSON.stringify(PHARMACY_STOCK));
    this.telemetry = {
      nodeId: 'STORE-NODE-004',
      nodeName: 'Apollo Pharmacy — Austin Downtown Hub',
      deaLicense: 'TX-9042-FD',
      coldChainTempCelsius: 3.4,
      humidityPct: 42.1,
      status: 'nominal',
      activeBatchesManaged: this.stock.length,
      lastSyncTimestamp: new Date().toISOString(),
    };
  }

  public async findStock(query?: string): Promise<PharmacyStockItem[]> {
    if (!query || !query.trim()) {
      return [...this.stock];
    }
    const q = query.toLowerCase().trim();
    return this.stock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q) ||
        s.activeSalt.toLowerCase().includes(q) ||
        s.shelfLocation.toLowerCase().includes(q) ||
        s.batchNumber.toLowerCase().includes(q)
    );
  }

  public async incrementStockByBarcode(
    barcode: string,
    quantityToAdd: number = 50
  ): Promise<{ item: PharmacyStockItem; added: number } | null> {
    const b = barcode.toLowerCase().trim();
    const normalizedBarcode = b.replace(/^sku-?/i, '');
    const index = this.stock.findIndex(
      (s) =>
        s.sku.toLowerCase() === b ||
        s.sku.toLowerCase() === normalizedBarcode ||
        s.batchNumber.toLowerCase() === b ||
        s.batchNumber.toLowerCase().includes(b) ||
        b.includes(s.sku.toLowerCase())
    );

    if (index === -1) return null;

    this.stock[index].stockQty += quantityToAdd;
    return {
      item: { ...this.stock[index] },
      added: quantityToAdd,
    };
  }

  public async getTelemetry(): Promise<DispensaryTelemetry> {
    return {
      ...this.telemetry,
      lastSyncTimestamp: new Date().toISOString(),
      activeBatchesManaged: this.stock.length,
    };
  }
}

export const pharmacyRepository = new PharmacyRepository();
