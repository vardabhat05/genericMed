import { Request, Response, NextFunction } from 'express';
import { fhirService } from '../services/fhir.service';

export class FhirController {
  public async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const capability = fhirService.getCapabilityStatement();
      res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8');
      res.status(200).json(capability);
    } catch (err) {
      next(err);
    }
  }

  public async getMedicationRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bundle = await fhirService.getMedicationRequests();
      res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8');
      res.status(200).json(bundle);
    } catch (err) {
      next(err);
    }
  }

  public async getMedicationRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await fhirService.getMedicationRequestById(id);
      res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8');
      res.status(200).json(resource);
    } catch (err) {
      next(err);
    }
  }

  public async getMedicationDispenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bundle = await fhirService.getMedicationDispenses();
      res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8');
      res.status(200).json(bundle);
    } catch (err) {
      next(err);
    }
  }
}

export const fhirController = new FhirController();
