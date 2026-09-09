import { Request, Response, NextFunction } from 'express';
import { operationsService } from '../services/operations.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class OperationsController {
  public async getExceptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const exceptions = await operationsService.getExceptions(status);
      successResponse(res, exceptions, 'Operational exceptions retrieved', HTTP_STATUS.OK, {
        total: exceptions.length,
        unresolved: exceptions.filter((e) => e.status !== 'resolved').length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async resolveException(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await operationsService.resolveException(id);
      successResponse(res, result.exception, result.message);
    } catch (err) {
      next(err);
    }
  }

  public async getCanonicalMappings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const mappings = await operationsService.getCanonicalMappings(status);
      successResponse(res, mappings, 'Canonical mappings retrieved', HTTP_STATUS.OK, {
        total: mappings.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateMappingDecision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { decision } = req.body;
      const result = await operationsService.updateMappingDecision(id, decision);
      successResponse(res, result.mapping, result.message);
    } catch (err) {
      next(err);
    }
  }

  public async addCanonicalSalt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rawSearchTerm, casNumber, strength } = req.body;
      const result = await operationsService.addCanonicalSalt(rawSearchTerm, casNumber, strength);
      successResponse(res, result.mapping, result.message, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }
}

export const operationsController = new OperationsController();
