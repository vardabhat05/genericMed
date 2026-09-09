import { User } from '../models/user.model';
import { hashPassword } from '../utils/crypto';

export class UserRepository {
  private users: User[] = [];
  private initialized = false;

  constructor() {
    this.initDefaultUsers();
  }

  private async initDefaultUsers() {
    if (this.initialized) return;

    const [patientHash, pharmacyHash, mfrHash, opsHash, devHash] = await Promise.all([
      hashPassword('Patient123!'),
      hashPassword('Pharmacy123!'),
      hashPassword('Manufacturer123!'),
      hashPassword('Operations123!'),
      hashPassword('Developer123!'),
    ]);

    this.users = [
      {
        id: 'usr-patient-001',
        email: 'patient@genericmed.io',
        passwordHash: patientHash,
        name: 'Sarah Jenkins',
        role: 'customer',
        tenantId: 'tenant-patient-001',
        createdAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr-pharmacy-004',
        email: 'pharmacist@apollopharmacy.com',
        passwordHash: pharmacyHash,
        name: 'Dr. Arthur Pendelton, R.Ph #49021',
        role: 'pharmacy',
        tenantId: 'node-apollo-4',
        nodeId: 'STORE-NODE-004',
        licenseNumber: 'DEA TX-9042-FD',
        organization: 'Apollo Pharmacy Downtown',
        createdAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr-mfr-001',
        email: 'regulatory@zyduslife.com',
        passwordHash: mfrHash,
        name: 'Dr. Elena Rostova',
        role: 'manufacturer',
        tenantId: 'mfr-zydus',
        licenseNumber: 'LIC: G/25/1842',
        organization: 'Zydus Lifesciences Ltd',
        createdAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr-ops-001',
        email: 'ops@genericmed.io',
        passwordHash: opsHash,
        name: 'Alex Vance (Ops Director)',
        role: 'operations',
        tenantId: 'tenant-ops-master',
        organization: 'genericMed Operations Tower',
        createdAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr-dev-001',
        email: 'developer@docpulse.ehr.io',
        passwordHash: devHash,
        name: 'Marcus Chen',
        role: 'developer',
        tenantId: 'tenant-dev-docpulse',
        organization: 'DocPulse Health Systems',
        createdAt: '2026-09-01T08:00:00.000Z',
      },
    ];

    this.initialized = true;
  }

  public async findByEmail(email: string): Promise<User | null> {
    await this.initDefaultUsers();
    const clean = email.toLowerCase().trim();
    const user = this.users.find((u) => u.email.toLowerCase() === clean);
    return user ? { ...user } : null;
  }

  public async findById(id: string): Promise<User | null> {
    await this.initDefaultUsers();
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  public async create(user: User): Promise<User> {
    await this.initDefaultUsers();
    this.users.push({ ...user });
    return { ...user };
  }

  public async update(id: string, partial: Partial<User>): Promise<User | null> {
    await this.initDefaultUsers();
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    this.users[idx] = {
      ...this.users[idx],
      ...partial,
    };
    return { ...this.users[idx] };
  }
}

export const userRepository = new UserRepository();
