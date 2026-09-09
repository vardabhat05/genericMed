import { Request, Response, NextFunction } from 'express';
import { pharmacyService } from '../services/pharmacy.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class PharmacyController {
  public async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const stock = await pharmacyService.getStockLedger(search);
      successResponse(res, stock, 'Dispensary inventory ledger retrieved', HTTP_STATUS.OK, {
        totalSkus: stock.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async scanStockBarcode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { barcode, quantity } = req.body;
      const qty = quantity ? parseInt(quantity, 10) : 50;
      const result = await pharmacyService.scanStockBarcode(barcode, qty);
      successResponse(res, result, result.message, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  public async getTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const telemetry = await pharmacyService.getNodeTelemetry();
      successResponse(res, telemetry, 'Node telemetry retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const pharmacyController = new PharmacyController();
