import React, { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  Server, 
  Database, 
  Smartphone, 
  Layers, 
  Globe, 
  Zap, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Code2,
  HardDrive,
  RefreshCw,
  Info
} from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  category: 'client' | 'edge' | 'app' | 'core_service' | 'data';
  description: string;
  techStack: string;
  specs: string[];
  status: 'operational' | 'nominal';
  activeConnections: string;
}

export const SystemArchitectureView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchNode | null>(null);

  const archNodes: Record<string, ArchNode> = {
    'client-customer': {
      id: 'client-customer',
      name: 'Customer Web & Mobile App',
      category: 'client',
      description: 'Progressive Web App & native mobile frontends for patients. Features prescription OCR upload, bioequivalent generic comparison, and live pharmacy order tracking.',
      techStack: 'React 19, Vite, Tailwind CSS, Motion, WebRTC',
      specs: ['100% Client Responsive', 'PWA Offline Cache', 'HIPAA compliant OCR extraction', 'Sub-100ms search latency'],
      status: 'operational',
      activeConnections: '24,190 Active Sessions',
    },
    'client-pharmacy': {
      id: 'client-pharmacy',
      name: 'Pharmacy Store Node Portal',
      category: 'client',
      description: 'Real-time dispensary station for retail pharmacies. Integrates with physical barcode scanners, cold-chain IoT monitors, and local POS/ERP inventory bridges.',
      techStack: 'React, WebSockets, Web Serial API (Barcode Scanners), IoT MQTT Client',
      specs: ['Store Node #4 live', 'P2P POS Sync Channel', 'Cold-chain excursion alerts', 'Pharmacist cryptographic signoff'],
      status: 'operational',
      activeConnections: '142 Active Pharmacy Nodes',
    },
    'client-mfr': {
      id: 'client-mfr',
      name: 'Medicine Company Portal (MFR Hub)',
      category: 'client',
      description: 'Manufacturer hub for pharmaceutical companies (e.g. Zydus, Sun Pharma, USV) to upload regulatory dossiers, bioequivalence dissolution curves (f2 scores), and bid on bulk dispensary RFQs.',
      techStack: 'Next.js / React, Charting engine, PDF Dossier Parser',
      specs: ['FDA ANDA Dossier Vault', 'Multi-pH Dissolution Model', 'Automated RFQ Volume Bidding'],
      status: 'operational',
      activeConnections: '38 Verified Manufacturers',
    },
    'client-api': {
      id: 'client-api',
      name: 'Public API Clients & SDKs',
      category: 'client',
      description: 'Third-party EHR integrations (DocPulse, Epic, Cerner) and Pharmacy Benefit Managers (PBMs) retrieving canonical salt substitutions and pricing.',
      techStack: 'HL7 FHIR R4, REST, GraphQL, Kafka Webhooks',
      specs: ['OAuth 2.0 Client Credentials', 'Mutual TLS (mTLS)', '600-1200 RPM Quota'],
      status: 'operational',
      activeConnections: '4.28M Monthly API Calls',
    },
    'edge-layer': {
      id: 'edge-layer',
      name: 'Global Edge & WAF Layer',
      category: 'edge',
      description: 'Distributed Cloudflare & Google Cloud Armor edge layer providing GeoDNS routing, SSL/TLS termination, DDoS mitigation, and edge token inspection.',
      techStack: 'Cloudflare Enterprise, Cloud Armor, Anycast Routing',
      specs: ['<15ms Global Edge Latency', 'TLS 1.3 Strict', 'DDoS Protection L3/L4/L7', 'WAF Bot Mitigation'],
      status: 'operational',
      activeConnections: '99.999% SLA Uptime',
    },
    'app-gateway': {
      id: 'app-gateway',
      name: 'API Gateway & Routing Mesh',
      category: 'app',
      description: 'High-performance Envoy / Kong reverse proxy terminating client sessions, enforcing rate-limiting tokens, authenticating JWT claims, and routing to microservices.',
      techStack: 'Envoy Proxy, Kong Gateway, OpenID Connect',
      specs: ['Distributed Rate Limiter (Redis)', 'Tenant Isolation Context Injection', 'Dynamic Service Mesh Routing'],
      status: 'operational',
      activeConnections: '14.8k Requests / min',
    },
    'service-search': {
      id: 'service-search',
      name: 'Search & Recommendation Service',
      category: 'core_service',
      description: 'Bioequivalent algorithm engine matching commercial brand names to active pharmaceutical ingredients (APIs), calculating f2 dissolution similarities and pricing savings.',
      techStack: 'Elasticsearch 8.x, pgvector, Node.js Microservice',
      specs: ['Sub-20ms Salt Resolution', 'Fuzzy Typo Tolerant NLP', 'Clinical Equivalence AB Ranking'],
      status: 'operational',
      activeConnections: '84,200 Daily Queries',
    },
    'service-catalog': {
      id: 'service-catalog',
      name: 'Catalog & Inventory Service',
      category: 'core_service',
      description: 'Real-time multi-tenant dispensary stock synchronization tracking 142 pharmacies, lot numbers, expiration dates, shelf bays, and cold-chain status.',
      techStack: 'Go / Node.js, Redis Distributed Locks, PostgreSQL Partitioning',
      specs: ['Stock Depletion Webhooks', 'Distributed Pessimistic Hold', 'Lot & Expiry Tracking'],
      status: 'operational',
      activeConnections: '124,000 Managed SKUs',
    },
    'service-orders': {
      id: 'service-orders',
      name: 'Order Management & Escrow Service',
      category: 'core_service',
      description: 'Coordinates end-to-end dispensing workflows, holds payment funds in smart escrow until pharmacist sign-off, and orchestrates express courier delivery.',
      techStack: 'PostgreSQL ACID, Stripe Connect, Escrow Smart Vault',
      specs: ['Pharmacist 4-Eye Verification Protocol', 'Courier PIN Handshake', 'Full Audit Logging'],
      status: 'operational',
      activeConnections: '14,820 Daily Dispatches',
    },
    'data-pg': {
      id: 'data-pg',
      name: 'Multi-Tenant PostgreSQL Database',
      category: 'data',
      description: 'Primary ACID relational storage with row-level security (RLS) and schema-per-tenant isolation for orders, dispensary ledgers, and audit logs.',
      techStack: 'PostgreSQL 16 High Availability, Cloud SQL HA Cluster',
      specs: ['P99 Latency: 14ms', 'Row Level Security Enforced', 'Continuous WAL Streaming Replicas'],
      status: 'operational',
      activeConnections: '48 / 64 Connection Pool',
    },
    'data-redis': {
      id: 'data-redis',
      name: 'Redis In-Memory Cluster',
      category: 'data',
      description: 'Ultra low-latency cache for canonical salt mappings, rapid stock counts, rate limiting counters, and pub/sub WebSocket channels.',
      techStack: 'Redis 7.2 Cluster, Sentinel HA',
      specs: ['Hit Rate: 94.2%', 'Sub-1ms Latency', 'Distributed Lock Manager'],
      status: 'operational',
      activeConnections: '1,840 Active PubSub Sockets',
    },
    'data-s3': {
      id: 'data-s3',
      name: 'Encrypted Object Storage (S3 Vault)',
      category: 'data',
      description: 'HIPAA and FDA compliant storage for encrypted doctor prescription images, scanned batch Certificates of Analysis (CoAs), and regulatory dossiers.',
      techStack: 'AWS S3 / Google Cloud Storage, AES-256 GCM Server-Side Encryption',
      specs: ['Presigned URL Time-Limits', 'Zero Public Access', 'Immutable Audit Trails'],
      status: 'operational',
      activeConnections: '99.999999999% Durability',
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/40">
                ARCHITECTURE BLUEPRINT
              </span>
              <span className="text-slate-400 text-xs font-mono">v3.1 Production Topology</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Network className="w-7 h-7 text-emerald-400" />
              genericMed System Architecture Diagram
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Scalable, secure, and clinical-grade multi-tenant SaaS platform connecting patients, licensed retail pharmacy dispensary nodes, pharmaceutical manufacturers, and healthcare API clients.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-700 font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-slate-400">System Availability</span>
              <span className="text-emerald-400 font-bold text-sm">99.98% High-Avail</span>
            </div>
            <div className="h-8 w-px bg-slate-700 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-slate-400">Security Model</span>
              <span className="text-cyan-400 font-bold text-sm">HIPAA & FDA cGMP</span>
            </div>
          </div>
        </div>

        {/* Interactive Architecture Diagram Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Diagram Column (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* LAYER 1: CLIENT LAYER */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-700/50">
                <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Smartphone className="w-4 h-4" />
                  1. CLIENT LAYER (MULTIPLE USER PERSONAS)
                </span>
                <span>Web / Mobile / IoT / POS Bridges</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'client-customer', label: 'Patient App', sub: 'PWA & Mobile iOS/Android', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
                  { id: 'client-pharmacy', label: 'Pharmacy Node #4', sub: 'Dispensary & Barcode POS', icon: <Server className="w-4 h-4 text-blue-400" /> },
                  { id: 'client-mfr', label: 'MFR Hub', sub: 'Regulatory Dossiers & RFQs', icon: <HardDrive className="w-4 h-4 text-purple-400" /> },
                  { id: 'client-api', label: 'Public API Clients', sub: 'EHR / PBM Integrations', icon: <Code2 className="w-4 h-4 text-cyan-400" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedNode(archNodes[item.id])}
                    className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                      selectedNode?.id === item.id
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-900/30'
                        : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      {item.icon}
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="font-semibold text-xs text-white leading-tight">{item.label}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* FLOW ARROW */}
            <div className="flex justify-center -my-2 text-slate-500">
              <span className="bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono flex items-center gap-1 text-slate-400">
                HTTPS (TLS 1.3) • WebSockets • Mutual TLS
              </span>
            </div>

            {/* LAYER 2: EDGE & SECURITY LAYER */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-700/50">
                <span className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Globe className="w-4 h-4" />
                  2. EDGE & SECURITY LAYER (GLOBAL)
                </span>
                <span>DDoS Mitigation & GeoDNS</span>
              </div>
              <div
                onClick={() => setSelectedNode(archNodes['edge-layer'])}
                className={`cursor-pointer p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition ${
                  selectedNode?.id === 'edge-layer'
                    ? 'bg-cyan-950/50 border-cyan-500'
                    : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700 flex items-center justify-center text-cyan-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Global Edge Mesh & Cloud Armor WAF</h3>
                    <p className="text-xs text-slate-400">SSL/TLS Termination, Anycast GeoDNS, Edge Rate-Limiting, Bot Shield</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  P99 Edge: 12ms
                </div>
              </div>
            </div>

            {/* FLOW ARROW */}
            <div className="flex justify-center -my-2 text-slate-500">
              <span className="bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono flex items-center gap-1 text-slate-400">
                Authenticated Ingress Token
              </span>
            </div>

            {/* LAYER 3: APPLICATION & CORE BUSINESS SERVICES */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-700/50">
                <span className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Cpu className="w-4 h-4" />
                  3. APPLICATION LAYER (MICROSERVICES & EVENT BUS)
                </span>
                <span>Containerized K8s Cluster</span>
              </div>

              {/* API Gateway */}
              <div
                onClick={() => setSelectedNode(archNodes['app-gateway'])}
                className={`cursor-pointer p-3.5 rounded-xl border mb-3 transition ${
                  selectedNode?.id === 'app-gateway'
                    ? 'bg-amber-950/40 border-amber-500'
                    : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-white">API Gateway & Request Orchestrator</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Envoy Mesh • Kong Ingress</span>
                </div>
              </div>

              {/* Core Business Services 3-Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedNode(archNodes['service-search'])}
                  className={`text-left p-3.5 rounded-xl border transition ${
                    selectedNode?.id === 'service-search'
                      ? 'bg-emerald-950/50 border-emerald-500'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">Bioequivalent Search</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Active salt matching, f2 similarity calculations & savings ranking.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedNode(archNodes['service-catalog'])}
                  className={`text-left p-3.5 rounded-xl border transition ${
                    selectedNode?.id === 'service-catalog'
                      ? 'bg-emerald-950/50 border-emerald-500'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs text-white">Catalog & Inventory</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Real-time stock sync across 142 nodes, lot tracking & reorder alerts.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedNode(archNodes['service-orders'])}
                  className={`text-left p-3.5 rounded-xl border transition ${
                    selectedNode?.id === 'service-orders'
                      ? 'bg-emerald-950/50 border-emerald-500'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs text-white">Order & Escrow Vault</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Clinical sign-off checks, pharmacist verification & courier handover.
                  </p>
                </button>
              </div>
            </div>

            {/* FLOW ARROW */}
            <div className="flex justify-center -my-2 text-slate-500">
              <span className="bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono flex items-center gap-1 text-slate-400">
                Transactional ACID & Distributed PubSub Bus
              </span>
            </div>

            {/* LAYER 4: DATA & STORAGE LAYER */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-700/50">
                <span className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Database className="w-4 h-4" />
                  4. DATA & PERSISTENCE LAYER (MULTI-TENANT ISOLATION)
                </span>
                <span>Encrypted at Rest & Transit</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedNode(archNodes['data-pg'])}
                  className={`text-left p-3 rounded-xl border transition ${
                    selectedNode?.id === 'data-pg'
                      ? 'bg-indigo-950/50 border-indigo-500'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">PostgreSQL HA</span>
                    <span className="text-[10px] font-mono text-emerald-400">ACID RLS</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Primary transactional ledger, orders, tenant tables & prescriptions.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedNode(archNodes['data-redis'])}
                  className={`text-left p-3 rounded-xl border transition ${
                    selectedNode?.id === 'data-redis'
                      ? 'bg-indigo-950/50 border-indigo-500'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Redis Cluster</span>
                    <span className="text-[10px] font-mono text-emerald-400">&lt;1ms</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Formulary cache, inventory locks, rate limits & WebSocket pubsub.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedNode(archNodes['data-s3'])}
                  className={`text-left p-3 rounded-xl border transition ${
                    selectedNode?.id === 'data-s3'
                      ? 'bg-indigo-950/50 border-indigo-500'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Encrypted S3 Vault</span>
                    <span className="text-[10px] font-mono text-cyan-400">AES-256</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Encrypted prescription images, clinical dossiers & CoAs.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Side Inspector Column */}
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sticky top-24">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs uppercase">
                      {selectedNode.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {selectedNode.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedNode.name}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Tech Stack</p>
                    <p className="text-xs font-mono text-cyan-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                      {selectedNode.techStack}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Capabilities & Specs</p>
                    <div className="space-y-1">
                      {selectedNode.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Telemetry:</span>
                    <span className="text-white font-semibold">{selectedNode.activeConnections}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-white text-sm">Interactive Node Inspector</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Click any layer or component in the architecture diagram to inspect its specifications, technology stack, and real-time operational telemetry.
                  </p>
                </div>
              )}

              {/* Multi-Tenant Security Highlights */}
              <div className="mt-6 pt-6 border-t border-slate-700/80 space-y-3">
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Multi-Tenant Isolation Model</h4>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Row Level Security (RLS)</strong>: Each pharmacy and patient only sees their cryptographic tenant scope.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><strong>Escrow Smart Vault</strong>: Consumer funds held in escrow until pharmacist scans & approves batch.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
