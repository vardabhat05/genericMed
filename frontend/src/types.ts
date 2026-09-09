export type PortalRole = 
  | 'customer'
  | 'pharmacy'
  | 'manufacturer'
  | 'operations'
  | 'developer'
  | 'architecture';

export type UserRole = PortalRole;

export interface MedicineGeneric {
  id: string;
  brandName: string;
  originatorBrand: string;
  originatorManufacturer: string;
  genericName: string;
  activeSalt: string;
  casNumber: string;
  dosage: string;
  form: string;
  manufacturer: string;
  brandPrice: number;
  genericPrice: number;
  savingsPercent: number;
  bioequivalentScore: number; // e.g. 99.4%
  f2SimilarityMetric: number; // e.g. 78.4
  orangeBookRating: string; // e.g. "AB-Rated"
  inStock: boolean;
  stockCount: number;
  deliveryTimeMins: number;
  prescriptionRequired: boolean;
  description: string;
  clinicalRationale: string;
  pkProfile: {
    tmaxHours: number;
    cmaxUgl: number;
    aucRatio: number;
    halfLifeHours: number;
  };
  dissolutionCurve: {
    timeMins: number;
    originatorPct: number;
    genericPct: number;
  }[];
}

export interface PharmacyStockItem {
  sku: string;
  name: string;
  activeSalt: string;
  dosage: string;
  stockQty: number;
  reservedQty: number;
  reorderPoint: number;
  batchNumber: string;
  expiryDate: string;
  shelfLocation: string;
  unitCost: number;
  sellingPrice: number;
  status: 'optimal' | 'low_stock' | 'depleted' | 'quarantine';
}

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  address: string;
  doctorName: string;
  doctorNpi: string;
  timestamp: string;
  items: {
    medicineName: string;
    dosage: string;
    quantity: number;
    batchNumber: string;
    shelfLocation: string;
    verified: boolean;
    scannedBarcode?: string;
  }[];
  totalAmount: number;
  savingsAmount: number;
  status: 'action_required' | 'dispensing' | 'packaged' | 'dispatched';
  prescriptionVerified: boolean;
  pharmacistSigned: boolean;
  pharmacistName?: string;
  courierName?: string;
  courierPin?: string;
  courierHandoverDone: boolean;
}

export interface ManufacturerDossier {
  id: string;
  brandName: string;
  genericName: string;
  activeSalt: string;
  dosage: string;
  dossierStatus: 'draft' | 'under_review' | 'fda_approved' | 'market_active';
  f2Score: number;
  f1Score: number;
  fdaDossierNumber: string;
  activeBatches: {
    batchId: string;
    yieldUnits: number;
    releaseDate: string;
    qcStatus: 'passed' | 'testing';
    destinationHub: string;
  }[];
  multiPhDissolution: {
    phLabel: string;
    timePoints: { time: number; refRelease: number; testRelease: number }[];
  }[];
}

export interface RfqVolumeContract {
  id: string;
  rfqCode: string;
  saltName: string;
  quantityUnits: number;
  targetMaxPrice: number;
  requestedBy: string;
  deadline: string;
  status: 'open_bidding' | 'awarded' | 'closed';
  currentLowestBid?: number;
}

export interface OperationalException {
  id: string;
  code: string;
  severity: 'critical' | 'high' | 'medium';
  type: 'cold_chain' | 'escrow_hold' | 'mapping_drift' | 'stockout';
  title: string;
  detail: string;
  node: string;
  timestamp: string;
  status: 'unresolved' | 'investigating' | 'resolved';
}

export interface CanonicalMapping {
  id: string;
  rawSearchTerm: string;
  suggestedCanonicalSalt: string;
  strength: string;
  confidenceScore: number;
  sourceFeed: string;
  status: 'pending' | 'approved' | 'rejected';
  dateAdded: string;
}

export interface ApiGatewayClient {
  id: string;
  name: string;
  clientType: 'ehr' | 'pbm' | 'pos' | 'sdk';
  apiKeyMasked: string;
  activeScopes: string[];
  requestsPerMinLimit: number;
  currentRpm: number;
  monthlyCalls: number;
  status: 'active' | 'throttled' | 'suspended';
  webhookUrl: string;
}

export interface WebhookKafkaEvent {
  id: string;
  topic: string;
  timestamp: string;
  partition: number;
  payload: Record<string, any>;
  status: 'delivered' | 'processing' | 'acked';
}
