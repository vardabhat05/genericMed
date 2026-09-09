import { ManufacturerDossier, RfqVolumeContract } from '../../src/types';
import { MANUFACTURER_DOSSIERS, OPEN_RFQS } from '../../src/data/mockData';

export class ManufacturerRepository {
  private dossiers: ManufacturerDossier[];
  private rfqs: RfqVolumeContract[];

  constructor() {
    this.dossiers = JSON.parse(JSON.stringify(MANUFACTURER_DOSSIERS));
    this.rfqs = JSON.parse(JSON.stringify(OPEN_RFQS));
  }

  public async findAllDossiers(): Promise<ManufacturerDossier[]> {
    return [...this.dossiers];
  }

  public async findDossierById(id: string): Promise<ManufacturerDossier | null> {
    const dossier = this.dossiers.find((d) => d.id === id);
    return dossier ? { ...dossier } : null;
  }

  public async findAllRfqs(): Promise<RfqVolumeContract[]> {
    return [...this.rfqs];
  }

  public async findRfqById(id: string): Promise<RfqVolumeContract | null> {
    const rfq = this.rfqs.find((r) => r.id === id || r.rfqCode === id);
    return rfq ? { ...rfq } : null;
  }

  public async updateRfqBid(
    rfqId: string,
    bidPrice: number
  ): Promise<RfqVolumeContract | null> {
    const index = this.rfqs.findIndex((r) => r.id === rfqId || r.rfqCode === rfqId);
    if (index === -1) return null;

    this.rfqs[index].currentLowestBid = bidPrice;
    return { ...this.rfqs[index] };
  }
}

export const manufacturerRepository = new ManufacturerRepository();
