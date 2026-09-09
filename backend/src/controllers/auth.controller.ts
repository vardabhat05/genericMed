import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      successResponse(res, result, `Welcome back, ${result.user.name}! Authenticated as [${result.user.role}].`);
    } catch (err) {
      next(err);
    }
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      successResponse(
        res,
        result,
        `Account created successfully for ${result.user.name}.`,
        HTTP_STATUS.CREATED
      );
    } catch (err) {
      next(err);
    }
  }

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!.sub);
      successResponse(res, profile, 'Authenticated user profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  public async switchRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      const result = await authService.switchPersona(req.user!.sub, role);
      successResponse(res, result, `Switched persona to [${role}]`);
    } catch (err) {
      next(err);
    }
  }

  public async getDemoPersonas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const personas = [
        {
          role: 'customer',
          label: 'Patient (Sarah Jenkins)',
          email: 'patient@genericmed.io',
          password: 'Patient123!',
        },
        {
          role: 'pharmacy',
          label: 'Dispensary Pharmacist (Dr. Pendelton - Node #4)',
          email: 'pharmacist@apollopharmacy.com',
          password: 'Pharmacy123!',
        },
        {
          role: 'manufacturer',
          label: 'Regulatory Dossier Lead (Zydus Lifesciences)',
          email: 'regulatory@zyduslife.com',
          password: 'Manufacturer123!',
        },
        {
          role: 'operations',
          label: 'Marketplace Operations Tower',
          email: 'ops@genericmed.io',
          password: 'Operations123!',
        },
        {
          role: 'developer',
          label: 'Third-Party EHR Integrator (DocPulse)',
          email: 'developer@docpulse.ehr.io',
          password: 'Developer123!',
        },
      ];
      successResponse(res, personas, 'Demo clinical persona credentials retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
