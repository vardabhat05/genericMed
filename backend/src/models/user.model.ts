import { PortalRole } from '../types';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: PortalRole;
  tenantId: string;
  nodeId?: string;
  licenseNumber?: string;
  organization?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export function sanitizeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}
