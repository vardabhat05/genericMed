import { userRepository, UserRepository } from '../repositories/user.repository';
import { User, SafeUser, sanitizeUser } from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { signJwt, JwtPayload } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';
import { PortalRole } from '../types';

export interface AuthResult {
  token: string;
  user: SafeUser;
}

export class AuthService {
  constructor(private repo: UserRepository = userRepository) {}

  public async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new AppError('Email and password are required.', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      nodeId: user.nodeId,
      name: user.name,
    };

    const token = signJwt(payload);

    return {
      token,
      user: sanitizeUser(user),
    };
  }

  public async register(data: {
    email: string;
    password: string;
    name: string;
    role?: PortalRole;
    organization?: string;
    licenseNumber?: string;
    nodeId?: string;
  }): Promise<AuthResult> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    const role = data.role || 'customer';
    const passwordHash = await hashPassword(data.password);
    const userId = `usr-${Date.now().toString().slice(-6)}`;
    const tenantId = data.nodeId ? `node-${data.nodeId.toLowerCase()}` : `tenant-${role}-${userId.slice(-4)}`;

    const newUser: User = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name,
      role,
      tenantId,
      nodeId: data.nodeId,
      licenseNumber: data.licenseNumber,
      organization: data.organization,
      createdAt: new Date().toISOString(),
    };

    await this.repo.create(newUser);

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
      nodeId: newUser.nodeId,
      name: newUser.name,
    };

    const token = signJwt(payload);

    return {
      token,
      user: sanitizeUser(newUser),
    };
  }

  public async switchPersona(userId: string, targetRole: PortalRole): Promise<AuthResult> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const updated = await this.repo.update(userId, { role: targetRole });

    const payload: JwtPayload = {
      sub: updated!.id,
      email: updated!.email,
      role: targetRole,
      tenantId: updated!.tenantId,
      nodeId: updated!.nodeId,
      name: updated!.name,
    };

    const token = signJwt(payload);

    return {
      token,
      user: sanitizeUser(updated!),
    };
  }

  public async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
