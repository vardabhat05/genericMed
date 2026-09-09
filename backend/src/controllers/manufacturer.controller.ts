import { Request, Response, NextFunction } from 'express';
import { manufacturerService } from '../services/manufacturer.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class ManufacturerController {
  public async getDossiers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dossiers = await manufacturerService.getAllDossiers();
      successResponse(res, dossiers, 'Regulatory dossiers retrieved', HTTP_STATUS.OK, {
        total: dossiers.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getDossierById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dossier = await manufacturerService.getDossierById(id);
      successResponse(res, dossier);
    } catch (err) {
      next(err);
    }
  }

  public async getRfqs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfqs = await manufacturerService.getAllRfqs();
      successResponse(res, rfqs, 'Volume RFQs retrieved', HTTP_STATUS.OK, {
        total: rfqs.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async placeBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { bidPrice, manufacturerName } = req.body;
      const price = parseFloat(bidPrice);

      const result = await manufacturerService.placeBid(id, price, manufacturerName);
      successResponse(res, result.rfq, result.message, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const manufacturerController = new ManufacturerController();
