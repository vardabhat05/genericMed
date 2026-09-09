import { OperationalException, CanonicalMapping } from '../types';
import { operationsRepository, OperationsRepository } from '../repositories/operations.repository';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export class OperationsService {
  constructor(private repo: OperationsRepository = operationsRepository) {}

  public async getExceptions(status?: string): Promise<OperationalException[]> {
    return this.repo.findAllExceptions(status);
  }

  public async resolveException(id: string): Promise<{ message: string; exception: OperationalException }> {
    const resolved = await this.repo.resolveException(id);
    if (!resolved) {
      throw new AppError(
        `Operational exception '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    return {
      message: `Exception ${id} resolved successfully. Audit trail logged.`,
      exception: resolved,
    };
  }

  public async getCanonicalMappings(status?: string): Promise<CanonicalMapping[]> {
    return this.repo.findAllMappings(status);
  }

  public async updateMappingDecision(
    id: string,
    decision: 'approved' | 'rejected'
  ): Promise<{ message: string; mapping: CanonicalMapping }> {
    const updated = await this.repo.updateMappingDecision(id, decision);
    if (!updated) {
      throw new AppError(
        `Canonical mapping '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    return {
      message: `Mapping ${id} marked as ${decision}. Pushed to Redis cache & Elasticsearch cluster.`,
      mapping: updated,
    };
  }

  public async addCanonicalSalt(
    rawSearchTerm: string,
    casNumber?: string,
    strength: string = 'Standard Dosage'
  ): Promise<{ message: string; mapping: CanonicalMapping }> {
    if (!rawSearchTerm || !rawSearchTerm.trim()) {
      throw new AppError(
        'Salt search term is required.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const suggestedCanonicalSalt = `${rawSearchTerm.trim()}${casNumber ? ` (CAS: ${casNumber.trim()})` : ''}`;

    const newMapping = await this.repo.createMapping({
      rawSearchTerm: rawSearchTerm.trim(),
      suggestedCanonicalSalt,
      strength,
      confidenceScore: 0.999,
      sourceFeed: 'Admin Manual Entry',
      status: 'approved',
    });

    return {
      message: `Canonical salt "${rawSearchTerm}" published to global marketplace index.`,
      mapping: newMapping,
    };
  }
}

export const operationsService = new OperationsService();
