import { PortalRole } from '../types';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  tenantId: string;
  userId: string;
  userRole: PortalRole;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export class AuditService {
  private logs: AuditLogEntry[] = [];

  public logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(fullEntry);
    console.log(`[AUDIT] ${fullEntry.timestamp} | Tenant: ${fullEntry.tenantId} | Role: ${fullEntry.userRole} | Action: ${fullEntry.action} | Resource: ${fullEntry.resource}/${fullEntry.resourceId}`);
    return fullEntry;
  }

  public getLogs(filter?: {
    tenantId?: string;
    resource?: string;
    resourceId?: string;
    userId?: string;
  }): AuditLogEntry[] {
    let result = [...this.logs];

    if (filter?.tenantId) {
      result = result.filter((l) => l.tenantId === filter.tenantId);
    }
    if (filter?.resource) {
      result = result.filter((l) => l.resource === filter.resource);
    }
    if (filter?.resourceId) {
      result = result.filter((l) => l.resourceId === filter.resourceId);
    }
    if (filter?.userId) {
      result = result.filter((l) => l.userId === filter.userId);
    }

    return result;
  }
}

export const auditService = new AuditService();
