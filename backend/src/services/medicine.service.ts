import { MedicineGeneric } from '../types';
import { medicineRepository, MedicineRepository } from '../repositories/medicine.repository';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export interface BioequivalentSearchResult {
  canonicalSalt: string;
  brandQuery: string;
  referenceInnovatorPriceUsd: number;
  recommendedGenerics: Array<{
    id: string;
    genericName: string;
    manufacturer: string;
    bioequivalenceScorePct: number;
    f2SimilarityMetric: number;
    fdaRating: string;
    priceUsd: number;
    savingsPct: number;
    inStock: boolean;
    stockCount: number;
    deliveryTimeMins: number;
    clinicalRationale: string;
  }>;
}

export class MedicineService {
  constructor(private repo: MedicineRepository = medicineRepository) {}

  /**
   * Calculates the mathematical f2 dissolution similarity factor per USP <711>
   * f2 = 50 * log10( [1 + (1/n)*sum((Rt - Tt)^2)]^(-0.5) * 100 )
   */
  public calculateF2Score(
    dissolutionCurve: { timeMins: number; originatorPct: number; genericPct: number }[]
  ): number {
    if (!dissolutionCurve || dissolutionCurve.length === 0) return 0;

    // Filter out time 0
    const points = dissolutionCurve.filter((p) => p.timeMins > 0);
    if (points.length === 0) return 100;

    const n = points.length;
    const sumSquaredDiff = points.reduce((acc, curr) => {
      const diff = curr.originatorPct - curr.genericPct;
      return acc + diff * diff;
    }, 0);

    const meanSquared = sumSquaredDiff / n;
    const rootTerm = Math.pow(1 + meanSquared, -0.5);
    const f2 = 50 * Math.log10(rootTerm * 100);

    return parseFloat(f2.toFixed(1));
  }

  public async getAllMedicines(search?: string): Promise<MedicineGeneric[]> {
    return this.repo.findAll(search);
  }

  public async getMedicineById(id: string): Promise<MedicineGeneric> {
    const med = await this.repo.findById(id);
    if (!med) {
      throw new AppError(
        `Medicine with ID '${id}' was not found in active formulary.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }
    return med;
  }

  public async searchBioequivalentGenerics(
    queryBrandOrSalt: string,
    dosageFilter?: string,
    maxResults: number = 5
  ): Promise<BioequivalentSearchResult> {
    const matches = await this.repo.searchBioequivalent(queryBrandOrSalt, dosageFilter);

    if (matches.length === 0) {
      // Return empty result structure rather than 404 so search UX remains graceful
      return {
        canonicalSalt: queryBrandOrSalt,
        brandQuery: queryBrandOrSalt,
        referenceInnovatorPriceUsd: 0,
        recommendedGenerics: [],
      };
    }

    const reference = matches[0];

    // Sort by highest bioequivalenceScore and highest savingsPercent
    const sorted = [...matches]
      .sort((a, b) => b.bioequivalentScore - a.bioequivalentScore || b.savingsPercent - a.savingsPercent)
      .slice(0, maxResults);

    return {
      canonicalSalt: reference.activeSalt,
      brandQuery: queryBrandOrSalt,
      referenceInnovatorPriceUsd: reference.brandPrice,
      recommendedGenerics: sorted.map((m) => ({
        id: m.id,
        genericName: m.brandName,
        manufacturer: m.manufacturer,
        bioequivalenceScorePct: m.bioequivalentScore,
        f2SimilarityMetric: m.f2SimilarityMetric,
        fdaRating: m.orangeBookRating,
        priceUsd: m.genericPrice,
        savingsPct: m.savingsPercent,
        inStock: m.inStock,
        stockCount: m.stockCount,
        deliveryTimeMins: m.deliveryTimeMins,
        clinicalRationale: m.clinicalRationale,
      })),
    };
  }
}

export const medicineService = new MedicineService();
