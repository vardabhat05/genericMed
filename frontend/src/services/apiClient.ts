import {
  MedicineGeneric,
  PharmacyStockItem,
  PharmacyOrder,
  ManufacturerDossier,
  RfqVolumeContract,
  OperationalException,
  CanonicalMapping,
  ApiGatewayClient,
  WebhookKafkaEvent,
  PortalRole
} from '../types';
import {
  MEDICINES_DATA,
  PHARMACY_STOCK,
  INITIAL_ORDERS,
  MANUFACTURER_DOSSIERS,
  OPEN_RFQS,
  OPERATIONAL_EXCEPTIONS,
  CANONICAL_MAPPINGS,
  API_GATEWAY_CLIENTS,
  MOCK_KAFKA_EVENTS
} from '../data/mockData';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export const DEMO_CREDENTIALS: Record<PortalRole, { email: string; password: string; name: string; role: PortalRole }> = {
  customer: {
    email: 'patient@genericmed.io',
    password: 'Patient123!',
    name: 'Sarah Jenkins (Patient)',
    role: 'customer',
  },
  pharmacy: {
    email: 'pharmacist@apollopharmacy.com',
    password: 'Pharmacy123!',
    name: 'Dr. Arthur Pendelton, R.Ph #49021',
    role: 'pharmacy',
  },
  manufacturer: {
    email: 'regulatory@zyduslife.com',
    password: 'Manufacturer123!',
    name: 'Dr. Ramesh Patel (Zydus Regulatory)',
    role: 'manufacturer',
  },
  operations: {
    email: 'ops@genericmed.io',
    password: 'Operations123!',
    name: 'Elena Rostova (Lead Ops Officer)',
    role: 'operations',
  },
  developer: {
    email: 'developer@docpulse.ehr.io',
    password: 'Developer123!',
    name: 'Alexander Wright (DocPulse EHR Lead)',
    role: 'developer',
  },
  architecture: {
    email: 'ops@genericmed.io',
    password: 'Operations123!',
    name: 'System Architect',
    role: 'operations',
  },
};

export interface ApiResponse<T> {
  data: T;
  isLive: boolean;
  message?: string;
  error?: string;
}

class ApiClient {
  private tokenKey = 'genericmed_auth_token';
  private userKey = 'genericmed_current_user';
  private connectionStatusListeners: ((isOnline: boolean) => void)[] = [];
  private _isOnline = false;

  constructor() {
    // Check initial health
    this.checkHealth();
  }

  public getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  public clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch {
      // Ignore
    }
  }

  public getCurrentUser(): any | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: any): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch {
      // Ignore
    }
  }

  public onConnectionChange(listener: (isOnline: boolean) => void): () => void {
    this.connectionStatusListeners.push(listener);
    listener(this._isOnline);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
    };
  }

  private notifyConnection(online: boolean) {
    if (this._isOnline !== online) {
      this._isOnline = online;
      this.connectionStatusListeners.forEach(l => l(online));
    }
  }

  public isOnline(): boolean {
    return this._isOnline;
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/health', { method: 'GET', credentials: 'omit' });
      const online = res.ok;
      this.notifyConnection(online);
      return online;
    } catch {
      this.notifyConnection(false);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackData?: T
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        let errJson: any = null;
        try {
          errJson = await res.json();
        } catch {
          // not json
        }
        const message = errJson?.message || `HTTP ${res.status} error`;
        if (fallbackData !== undefined) {
          return { data: fallbackData, isLive: false, error: message };
        }
        throw new Error(message);
      }

      const json = await res.json();
      this.notifyConnection(true);
      return {
        data: (json.data !== undefined ? json.data : json) as T,
        isLive: true,
        message: json.message,
      };
    } catch (err: any) {
      this.notifyConnection(false);
      if (fallbackData !== undefined) {
        return { data: fallbackData, isLive: false, error: err?.message || 'Network unreachable' };
      }
      throw err;
    }
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  public auth = {
    login: async (email: string, password: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const json = await res.json();
          const { token, user } = json.data;
          this.setToken(token);
          this.setCurrentUser(user);
          this.notifyConnection(true);
          return { token, user, isLive: true };
        }
      } catch {
        // Fall back to local auth simulation
      }

      // Offline simulation fallback
      const foundRole = Object.keys(DEMO_CREDENTIALS).find(
        (r) => DEMO_CREDENTIALS[r as PortalRole].email.toLowerCase() === email.toLowerCase()
      ) as PortalRole | undefined;

      const user = {
        id: `usr-${foundRole || 'user'}`,
        email,
        name: foundRole ? DEMO_CREDENTIALS[foundRole].name : 'Local Demo User',
        role: foundRole || 'customer',
        tenantId: foundRole === 'pharmacy' ? 'STORE-NODE-004' : foundRole === 'manufacturer' ? 'mfr-zydus' : 'genericmed-global',
      };
      const token = `mock-jwt-${Date.now()}`;
      this.setToken(token);
      this.setCurrentUser(user);
      return { token, user, isLive: false };
    },

    loginAsRole: async (role: PortalRole) => {
      const creds = DEMO_CREDENTIALS[role];
      if (!creds) return null;
      return this.auth.login(creds.email, creds.password);
    },

    getProfile: async () => {
      return this.request<any>('/auth/me', { method: 'GET' }, this.getCurrentUser());
    },

    getDemoPersonas: async () => {
      return this.request<any[]>('/auth/demo-personas', { method: 'GET' }, Object.values(DEMO_CREDENTIALS));
    },

    logout: () => {
      this.clearToken();
    },
  };

  // ==========================================
  // MEDICINES & BIOEQUIVALENCE
  // ==========================================
  public medicines = {
    getAll: async (search?: string) => {
      const endpoint = search ? `/medicines?search=${encodeURIComponent(search)}` : '/medicines';
      const fallback = search
        ? MEDICINES_DATA.filter(
            m =>
              m.brandName.toLowerCase().includes(search.toLowerCase()) ||
              m.genericName.toLowerCase().includes(search.toLowerCase()) ||
              m.activeSalt.toLowerCase().includes(search.toLowerCase())
          )
        : MEDICINES_DATA;
      return this.request<MedicineGeneric[]>(endpoint, { method: 'GET' }, fallback);
    },

    getById: async (id: string) => {
      const fallback = MEDICINES_DATA.find(m => m.id === id) || MEDICINES_DATA[0];
      return this.request<MedicineGeneric>(`/medicines/${id}`, { method: 'GET' }, fallback);
    },

    searchBioequivalent: async (params: { query_brand?: string; dosage?: string; max_results?: number }) => {
      const qs = new URLSearchParams();
      if (params.query_brand) qs.set('query_brand', params.query_brand);
      if (params.dosage) qs.set('dosage', params.dosage);
      if (params.max_results) qs.set('max_results', String(params.max_results));

      const fallback = {
        query_brand: params.query_brand || 'Glucophage XR',
        canonical_salt: 'Metformin HCl (CAS: 1115-70-4)',
        originator_price_usd: 23.0,
        results_count: 2,
        matches: MEDICINES_DATA.map(m => ({
          generic_name: m.brandName,
          active_salt: m.activeSalt,
          manufacturer: m.manufacturer,
          price_usd: m.genericPrice,
          savings_pct: m.savingsPercent,
          f2_similarity_metric: m.f2SimilarityMetric,
          bioequivalent_score_pct: m.bioequivalentScore,
          fda_rating: m.orangeBookRating,
          in_stock: m.inStock,
          delivery_mins: m.deliveryTimeMins,
        })),
      };

      return this.request<any>(`/medicines/bioequivalent-search?${qs.toString()}`, { method: 'GET' }, fallback);
    },

    normalizeSalt: async (rawTerm: string) => {
      return this.request<any>(
        '/medicines/normalize-salt',
        {
          method: 'POST',
          body: JSON.stringify({ rawTerm }),
        },
        {
          rawTerm,
          canonicalSalt: rawTerm,
          strength: 'Standard Dosage',
          confidenceScore: 0.95,
          method: 'NLP Normalizer',
        }
      );
    },
  };

  // ==========================================
  // PRESCRIPTION OCR EXTRACTION
  // ==========================================
  public prescriptions = {
    extractOcr: async (payload: { imageBase64?: string; filename?: string; mimeType?: string }) => {
      const fallback = {
        prescriber: 'Dr. Arthur Vance, MD (NPI: #1902847119)',
        detectedSalts: ['Metformin HCl 500mg ER', 'Atorvastatin Calcium 20mg'],
        recommendedGenerics: ['Glycomet 500mg ER (Save 79%)', 'Atorva 20mg (Save 84%)'],
        rawText: 'Rx: Glucophage XR 500mg 1 tab PO daily, Lipitor 20mg 1 tab PO qhs. Dr. Arthur Vance, NPI: 1902847119.',
        ocrConfidence: 0.985,
        clinicalSafetyNotes: ['Verified active ANDA approvals for both entities.'],
      };

      return this.request<any>(
        '/prescriptions/ocr-extract',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        fallback
      );
    },
  };

  // ==========================================
  // ORDERS & ESCROW LIFECYCLE
  // ==========================================
  public orders = {
    getAll: async () => {
      return this.request<PharmacyOrder[]>('/orders', { method: 'GET' }, INITIAL_ORDERS);
    },

    getById: async (id: string) => {
      const fallback = INITIAL_ORDERS.find(o => o.id === id) || INITIAL_ORDERS[0];
      return this.request<PharmacyOrder>(`/orders/${id}`, { method: 'GET' }, fallback);
    },

    checkout: async (payload: {
      patientName: string;
      address?: string;
      doctorName?: string;
      doctorNpi?: string;
      items: {
        medicineName: string;
        dosage: string;
        quantity: number;
        batchNumber?: string;
        shelfLocation?: string;
        unitPrice?: number;
      }[];
      totalAmount: number;
      savingsAmount?: number;
      paymentMethod?: string;
    }) => {
      const orderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const fallback: PharmacyOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        patientName: payload.patientName || 'Sarah Jenkins',
        address: payload.address || '742 Evergreen Terrace, Austin, TX 78701',
        doctorName: payload.doctorName || 'Dr. Arthur Vance, MD',
        doctorNpi: payload.doctorNpi || '1902847119',
        timestamp: 'Just now',
        items: payload.items.map(item => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          quantity: item.quantity,
          batchNumber: item.batchNumber || 'BAT-2026-904',
          shelfLocation: item.shelfLocation || 'Bay 3-A',
          verified: false,
        })),
        totalAmount: payload.totalAmount,
        savingsAmount: payload.savingsAmount || 26.4,
        status: 'action_required',
        prescriptionVerified: true,
        pharmacistSigned: false,
        courierName: 'Jason K. (Apollo Dispatch)',
        courierPin: `${Math.floor(1000 + Math.random() * 9000)}`,
        courierHandoverDone: false,
      };

      return this.request<PharmacyOrder>(
        '/orders/checkout',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        fallback
      );
    },

    verifyItem: async (orderId: string, itemIdx: number, verified: boolean) => {
      return this.request<PharmacyOrder>(
        `/orders/${orderId}/verify-item`,
        {
          method: 'PATCH',
          body: JSON.stringify({ itemIdx, verified }),
        }
      );
    },

    pharmacistSignoff: async (orderId: string, pharmacistName?: string, signature?: string) => {
      return this.request<PharmacyOrder>(
        `/orders/${orderId}/pharmacist-signoff`,
        {
          method: 'POST',
          body: JSON.stringify({
            pharmacistName: pharmacistName || 'Dr. Arthur Pendelton, R.Ph #49021',
            signature: signature || 'SIG-RPH-49021-VALIDATED',
          }),
        }
      );
    },

    courierHandover: async (orderId: string, courierPin?: string) => {
      return this.request<PharmacyOrder>(
        `/orders/${orderId}/courier-handover`,
        {
          method: 'POST',
          body: JSON.stringify({ courierPin }),
        }
      );
    },
  };

  // ==========================================
  // PHARMACY DISPENSARY NODE
  // ==========================================
  public pharmacy = {
    getInventory: async () => {
      return this.request<PharmacyStockItem[]>('/pharmacy/inventory', { method: 'GET' }, PHARMACY_STOCK);
    },

    scanBarcode: async (barcode: string, quantity: number = 50) => {
      return this.request<any>(
        '/pharmacy/scan-stock',
        {
          method: 'POST',
          body: JSON.stringify({ barcode, quantity }),
        },
        {
          success: true,
          barcode,
          quantityAdded: quantity,
          message: `Stock updated for barcode ${barcode}`,
        }
      );
    },

    getTelemetry: async () => {
      return this.request<any>(
        '/pharmacy/telemetry',
        { method: 'GET' },
        {
          nodeId: 'STORE-NODE-004',
          nodeName: 'Apollo Pharmacy Store Node #4',
          coldChain: {
            temperatureC: 4.2,
            targetRange: '2.0°C – 6.0°C',
            status: 'nominal',
          },
          activeSkus: 1420,
          depletionAlertsCount: 6,
          posBridgeStatus: 'connected',
        }
      );
    },
  };

  // ==========================================
  // MANUFACTURER HUB
  // ==========================================
  public manufacturers = {
    getDossiers: async () => {
      return this.request<ManufacturerDossier[]>('/manufacturers/dossiers', { method: 'GET' }, MANUFACTURER_DOSSIERS);
    },

    getDossierById: async (id: string) => {
      const fallback = MANUFACTURER_DOSSIERS.find(d => d.id === id) || MANUFACTURER_DOSSIERS[0];
      return this.request<ManufacturerDossier>(`/manufacturers/dossiers/${id}`, { method: 'GET' }, fallback);
    },

    getRfqs: async () => {
      return this.request<RfqVolumeContract[]>('/manufacturers/rfqs', { method: 'GET' }, OPEN_RFQS);
    },

    placeBid: async (rfqId: string, bidPrice: number, manufacturerName?: string) => {
      return this.request<any>(
        `/manufacturers/rfqs/${rfqId}/bid`,
        {
          method: 'POST',
          body: JSON.stringify({
            bidAmount: bidPrice,
            bidPrice,
            manufacturerName: manufacturerName || 'Zydus Lifesciences Ltd',
          }),
        },
        {
          rfqId,
          bidPrice,
          manufacturer: manufacturerName || 'Zydus Lifesciences Ltd',
          status: 'bid_registered',
          message: `Bid of $${bidPrice.toFixed(3)} registered successfully`,
        }
      );
    },
  };

  // ==========================================
  // OPERATIONS CONTROL TOWER
  // ==========================================
  public operations = {
    getExceptions: async () => {
      return this.request<OperationalException[]>('/operations/exceptions', { method: 'GET' }, OPERATIONAL_EXCEPTIONS);
    },

    resolveException: async (id: string, notes?: string) => {
      return this.request<any>(
        `/operations/exceptions/${id}/resolve`,
        {
          method: 'POST',
          body: JSON.stringify({ resolutionNotes: notes || 'Resolved by Ops Tower Lead' }),
        },
        { id, status: 'resolved' }
      );
    },

    getMappings: async () => {
      return this.request<CanonicalMapping[]>('/operations/mappings', { method: 'GET' }, CANONICAL_MAPPINGS);
    },

    updateMappingDecision: async (id: string, decision: 'approved' | 'rejected') => {
      return this.request<any>(
        `/operations/mappings/${id}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({ decision }),
        },
        { id, status: decision }
      );
    },

    addCanonicalSalt: async (payload: {
      rawSearchTerm: string;
      suggestedCanonicalSalt: string;
      strength?: string;
      casNumber?: string;
    }) => {
      return this.request<any>(
        '/operations/mappings/canonical-salt',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        {
          id: `map-${Date.now().toString().slice(-4)}`,
          rawSearchTerm: payload.rawSearchTerm,
          suggestedCanonicalSalt: payload.suggestedCanonicalSalt,
          strength: payload.strength || 'Standard Dosage',
          confidenceScore: 0.999,
          sourceFeed: 'Admin Manual Entry',
          status: 'approved',
          dateAdded: 'Just now',
        }
      );
    },
  };

  // ==========================================
  // DEVELOPER API GATEWAY
  // ==========================================
  public gateway = {
    getClients: async () => {
      return this.request<ApiGatewayClient[]>('/gateway/clients', { method: 'GET' }, API_GATEWAY_CLIENTS);
    },

    getEvents: async () => {
      return this.request<WebhookKafkaEvent[]>('/gateway/events', { method: 'GET' }, MOCK_KAFKA_EVENTS);
    },

    emitEvent: async (topic: string, payload: Record<string, any>) => {
      return this.request<any>(
        '/gateway/events/emit',
        {
          method: 'POST',
          body: JSON.stringify({ topic, payload }),
        },
        {
          id: `evt-${Date.now()}`,
          topic,
          timestamp: new Date().toISOString(),
          partition: Math.floor(Math.random() * 8),
          payload,
          status: 'delivered',
        }
      );
    },

    runExplorerTest: async (endpoint: string, payload?: any, method: string = 'POST') => {
      const startTime = performance.now();
      try {
        const res = await this.request<any>(
          '/gateway/test-run',
          {
            method: 'POST',
            body: JSON.stringify({ endpoint, payload, method }),
          }
        );
        const duration = Math.round(performance.now() - startTime);
        return {
          response: res.data,
          durationMs: duration,
          isLive: res.isLive,
        };
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        return {
          response: { error: err.message, status: 'error' },
          durationMs: duration,
          isLive: false,
        };
      }
    },
  };

  // ==========================================
  // REAL-TIME SSE TELEMETRY STREAM
  // ==========================================
  public telemetry = {
    subscribeStream: (
      onTick: (data: any) => void,
      onError?: (err: any) => void
    ): (() => void) => {
      let eventSource: EventSource | null = null;
      let intervalTimer: any = null;

      try {
        eventSource = new EventSource(`${API_BASE}/telemetry/stream`);

        eventSource.onopen = () => {
          this.notifyConnection(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onTick(data);
          } catch {
            // Ignore non-json ticks
          }
        };

        eventSource.onerror = (err) => {
          if (onError) onError(err);
          // If EventSource fails (e.g. offline dev environment), smoothly fall back to local simulated ticker
          if (!intervalTimer) {
            intervalTimer = setInterval(() => {
              const temp = +(4.0 + (Math.random() * 0.5 - 0.25)).toFixed(2);
              onTick({
                nodeId: 'STORE-NODE-004',
                nodeName: 'Apollo Pharmacy Store Node #4',
                temperatureC: temp,
                humidityPct: 44.5,
                targetRange: '2.0°C – 6.0°C',
                status: 'nominal',
                timestamp: new Date().toISOString(),
              });
            }, 3000);
          }
        };
      } catch (err) {
        if (onError) onError(err);
        // Local ticker fallback
        intervalTimer = setInterval(() => {
          const temp = +(4.2 + (Math.random() * 0.4 - 0.2)).toFixed(2);
          onTick({
            nodeId: 'STORE-NODE-004',
            nodeName: 'Apollo Pharmacy Store Node #4',
            temperatureC: temp,
            humidityPct: 45.0,
            targetRange: '2.0°C – 6.0°C',
            status: 'nominal',
            timestamp: new Date().toISOString(),
          });
        }, 3000);
      }

      return () => {
        if (eventSource) {
          eventSource.close();
        }
        if (intervalTimer) {
          clearInterval(intervalTimer);
        }
      };
    },

    simulateExcursion: async (temperatureC: number, reason: string) => {
      return this.request<any>(
        '/telemetry/excursion',
        {
          method: 'POST',
          body: JSON.stringify({ temperatureC, reason }),
        },
        {
          alert: 'Temperature Excursion Triggered',
          temperatureC,
          reason,
          timestamp: new Date().toISOString(),
        }
      );
    },
  };
}

export const apiClient = new ApiClient();
