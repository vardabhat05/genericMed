import { PharmacyStockItem } from '../types';
import { pharmacyRepository, PharmacyRepository, DispensaryTelemetry } from '../repositories/pharmacy.repository';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export class PharmacyService {
  constructor(private repo: PharmacyRepository = pharmacyRepository) {}

  public async getStockLedger(search?: string): Promise<PharmacyStockItem[]> {
    return this.repo.findStock(search);
  }

  public async scanStockBarcode(
    barcode: string,
    quantityToAdd: number = 50
  ): Promise<{ message: string; item: PharmacyStockItem; addedUnits: number }> {
    if (!barcode || !barcode.trim()) {
      throw new AppError(
        'Barcode string must not be empty.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const result = await this.repo.incrementStockByBarcode(barcode, quantityToAdd);
    if (!result) {
      throw new AppError(
        `Barcode '${barcode}' is not mapped to any active SKU or batch in this dispensary node.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    return {
      message: `Verified & Stocked +${result.added} units for ${result.item.name} (${result.item.batchNumber})`,
      item: result.item,
      addedUnits: result.added,
    };
  }

  public async getNodeTelemetry(): Promise<DispensaryTelemetry> {
    return this.repo.getTelemetry();
  }
}

export const pharmacyService = new PharmacyService();
