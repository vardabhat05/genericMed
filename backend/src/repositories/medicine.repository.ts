import { MedicineGeneric } from '../types';
import { MEDICINES_DATA } from '../data/mockData';

export class MedicineRepository {
  private medicines: MedicineGeneric[];

  constructor() {
    // Deep clone initial seed data to prevent mutation of static seeds
    this.medicines = JSON.parse(JSON.stringify(MEDICINES_DATA));
  }

  public async findAll(search?: string): Promise<MedicineGeneric[]> {
    if (!search || !search.trim()) {
      return [...this.medicines];
    }
    const q = search.toLowerCase().trim();
    return this.medicines.filter(
      (m) =>
        m.brandName.toLowerCase().includes(q) ||
        m.originatorBrand.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.activeSalt.toLowerCase().includes(q)
    );
  }

  public async findById(id: string): Promise<MedicineGeneric | null> {
    const med = this.medicines.find((m) => m.id === id);
    return med ? { ...med } : null;
  }

  public async searchBioequivalent(
    queryBrandOrSalt: string,
    dosageFilter?: string
  ): Promise<MedicineGeneric[]> {
    const q = queryBrandOrSalt.toLowerCase().trim();
    return this.medicines.filter((m) => {
      const matchName =
        m.originatorBrand.toLowerCase().includes(q) ||
        m.brandName.toLowerCase().includes(q) ||
        m.activeSalt.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q);

      if (!matchName) return false;

      if (dosageFilter && dosageFilter.trim()) {
        const cleanFilter = dosageFilter.replace(/\s+/g, '').toLowerCase();
        const cleanDosage = m.dosage.replace(/\s+/g, '').toLowerCase();
        return cleanDosage.includes(cleanFilter);
      }

      return true;
    });
  }
}

export const medicineRepository = new MedicineRepository();
