import { OperationalException, CanonicalMapping } from '../../src/types';
import { OPERATIONAL_EXCEPTIONS, CANONICAL_MAPPINGS } from '../../src/data/mockData';

export class OperationsRepository {
  private exceptions: OperationalException[];
  private mappings: CanonicalMapping[];

  constructor() {
    this.exceptions = JSON.parse(JSON.stringify(OPERATIONAL_EXCEPTIONS));
    this.mappings = JSON.parse(JSON.stringify(CANONICAL_MAPPINGS));
  }

  public async findAllExceptions(status?: string): Promise<OperationalException[]> {
    if (!status || status === 'all') {
      return [...this.exceptions];
    }
    return this.exceptions.filter((e) => e.status === status);
  }

  public async resolveException(id: string): Promise<OperationalException | null> {
    const index = this.exceptions.findIndex((e) => e.id === id);
    if (index === -1) return null;

    this.exceptions[index].status = 'resolved';
    return { ...this.exceptions[index] };
  }

  public async findAllMappings(status?: string): Promise<CanonicalMapping[]> {
    if (!status || status === 'all') {
      return [...this.mappings];
    }
    return this.mappings.filter((m) => m.status === status);
  }

  public async updateMappingDecision(
    id: string,
    decision: 'approved' | 'rejected'
  ): Promise<CanonicalMapping | null> {
    const index = this.mappings.findIndex((m) => m.id === id);
    if (index === -1) return null;

    this.mappings[index].status = decision;
    return { ...this.mappings[index] };
  }

  public async createMapping(
    data: Omit<CanonicalMapping, 'id' | 'dateAdded'>
  ): Promise<CanonicalMapping> {
    const newEntry: CanonicalMapping = {
      ...data,
      id: `map-${Date.now().toString().slice(-4)}`,
      dateAdded: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    this.mappings.unshift(newEntry);
    return { ...newEntry };
  }
}

export const operationsRepository = new OperationsRepository();
