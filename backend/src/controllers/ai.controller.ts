import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class AiController {
  public async extractPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image, mimeType } = req.body;
      const result = await aiService.extractPrescription(image, mimeType);
      successResponse(
        res,
        result,
        `Prescription extracted successfully with ${Math.round(result.confidenceScore * 100)}% confidence.`,
        HTTP_STATUS.OK
      );
    } catch (err) {
      next(err);
    }
  }

  public async normalizeSalt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.body;
      const result = await aiService.normalizeSalt(query);
      successResponse(
        res,
        result,
        `Salt query "${query}" resolved to canonical INN name.`
      );
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AiController();
