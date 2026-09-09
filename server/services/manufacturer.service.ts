import { ManufacturerDossier, RfqVolumeContract } from '../../src/types';
import { manufacturerRepository, ManufacturerRepository } from '../repositories/manufacturer.repository';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export class ManufacturerService {
  constructor(private repo: ManufacturerRepository = manufacturerRepository) {}

  public async getAllDossiers(): Promise<ManufacturerDossier[]> {
    return this.repo.findAllDossiers();
  }

  public async getDossierById(id: string): Promise<ManufacturerDossier> {
    const dossier = await this.repo.findDossierById(id);
    if (!dossier) {
      throw new AppError(
        `Regulatory dossier '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }
    return dossier;
  }

  public async getAllRfqs(): Promise<RfqVolumeContract[]> {
    return this.repo.findAllRfqs();
  }

  public async placeBid(
    rfqId: string,
    bidPrice: number,
    manufacturerName: string = 'Zydus Lifesciences Ltd'
  ): Promise<{ message: string; rfq: RfqVolumeContract }> {
    const rfq = await this.repo.findRfqById(rfqId);
    if (!rfq) {
      throw new AppError(
        `Volume RFQ '${rfqId}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    if (rfq.status !== 'open_bidding') {
      throw new AppError(
        `RFQ '${rfqId}' is currently ${rfq.status} and not accepting new bids.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.CONFLICT
      );
    }

    if (bidPrice > rfq.targetMaxPrice) {
      throw new AppError(
        `Bid price $${bidPrice.toFixed(3)} exceeds target maximum ceiling price of $${rfq.targetMaxPrice.toFixed(3)}.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (rfq.currentLowestBid && bidPrice >= rfq.currentLowestBid) {
      throw new AppError(
        `Bid price $${bidPrice.toFixed(3)} must be lower than the current lowest bid of $${rfq.currentLowestBid.toFixed(3)}.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.CONFLICT
      );
    }

    const updated = await this.repo.updateRfqBid(rfq.id, bidPrice);

    return {
      message: `Bid of $${bidPrice.toFixed(3)}/unit submitted successfully for ${rfq.rfqCode} by ${manufacturerName}.`,
      rfq: updated!,
    };
  }
}

export const manufacturerService = new ManufacturerService();
