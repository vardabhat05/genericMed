import { Request, Response, NextFunction } from 'express';
import { medicineService } from '../services/medicine.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class MedicineController {
  public async getMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const medicines = await medicineService.getAllMedicines(search);
      successResponse(res, medicines, 'Medicines retrieved successfully', HTTP_STATUS.OK, {
        total: medicines.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getMedicineById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const medicine = await medicineService.getMedicineById(id);
      successResponse(res, medicine);
    } catch (err) {
      next(err);
    }
  }

  public async searchBioequivalent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, query_brand, dosage_filter, max_results } = req.body;
      const brandOrSalt = query_brand || query || '';
      const dosage = dosage_filter as string | undefined;
      const max = max_results ? parseInt(max_results, 10) : 5;

      const results = await medicineService.searchBioequivalentGenerics(brandOrSalt, dosage, max);
      successResponse(res, results, 'Bioequivalent generic search completed');
    } catch (err) {
      next(err);
    }
  }
}

export const medicineController = new MedicineController();
