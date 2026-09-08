import React, { useState } from 'react';
import { 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Database, 
  RefreshCw, 
  Sliders, 
  Download, 
  Radio, 
  AlertTriangle, 
  Search, 
  Filter, 
  Check, 
  X, 
  Plus, 
  Cpu, 
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { OperationalException, CanonicalMapping } from '../../types';
import { OPERATIONAL_EXCEPTIONS, CANONICAL_MAPPINGS } from '../../data/mockData';

interface OpsControlViewProps {
  onExceptionsChange?: (count: number) => void;
}

export const OpsControlView: React.FC<OpsControlViewProps> = ({ onExceptionsChange }) => {
  const [exceptions, setExceptions] = useState<OperationalException[]>(OPERATIONAL_EXCEPTIONS);
  const [mappings, setMappings] = useState<CanonicalMapping[]>(CANONICAL_MAPPINGS);
  const [selectedSubView, setSelectedSubView] = useState<'overview' | 'formulary' | 'telemetry'>('overview');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // New Salt Modal state
  const [showAddSaltModal, setShowAddSaltModal] = useState(false);
  const [newSaltName, setNewSaltName] = useState('');
  const [newCasNumber, setNewCasNumber] = useState('');

  const unresolvedCount = exceptions.filter(e => e.status !== 'resolved').length;

  const handleResolveException = (id: string) => {
    const updated = exceptions.map(e => e.id === id ? { ...e, status: 'resolved' as const } : e);
    setExceptions(updated);
    if (onExceptionsChange) {
      onExceptionsChange(updated.filter(e => e.status !== 'resolved').length);
    }
    setBannerNotice(`Exception ${id} resolved successfully. Audit trail logged.`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleMappingDecision = (id: string, decision: 'approved' | 'rejected') => {
    setMappings(mappings.map(m => m.id === id ? { ...m, status: decision } : m));
    setBannerNotice(`Mapping ${id} marked as ${decision}. Pushed to Redis cache & Elasticsearch cluster.`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleAddNewSalt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaltName) return;

    const newEntry: CanonicalMapping = {
      id: `map-${Date.now().toString().slice(-4)}`,
      rawSearchTerm: newSaltName,
      suggestedCanonicalSalt: `${newSaltName} ${newCasNumber ? `(CAS: ${newCasNumber})` : ''}`,
      strength: 'Standard Dosage',
      confidenceScore: 0.999,
      sourceFeed: 'Admin Manual Entry',
      status: 'approved',
      dateAdded: 'Just now',
    };

    setMappings([newEntry, ...mappings]);
    setShowAddSaltModal(false);
    setNewSaltName('');
    setNewCasNumber('');
    setBannerNotice(`Canonical salt "${newSaltName}" published to global marketplace index!`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Operations Header */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/40">
                OPS CONTROL TOWER
              </span>
              <span className="text-slate-400 text-xs font-mono">Cluster #01 • P99: 14ms</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <Activity className="w-7 h-7 text-emerald-400" />
              Executive Marketplace & Operations Center
            </h1>
            <p className="text-xs text-slate-400">
              Live marketplace telemetry, substitution conversion funnels, critical exception triage, and canonical formulary dictionary normalizer.
            </p>
          </div>

          {/* Sub Views */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setSelectedSubView('overview')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedSubView === 'overview'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Marketplace Funnel & Alerts
            </button>
            <button
              onClick={() => setSelectedSubView('formulary')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedSubView === 'formulary'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Canonical Formulary Matrix ({mappings.filter(m => m.status === 'pending').length} Pending)
            </button>
            <button
              onClick={() => setSelectedSubView('telemetry')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedSubView === 'telemetry'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Multi-Tenant Telemetry
            </button>
          </div>
        </div>

        {/* 5-Card Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Daily Order Volume</span>
            <p className="text-xl font-bold text-white font-mono mt-1">14,820</p>
            <span className="text-[10px] text-emerald-400 font-mono">+18.4% WoW</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Stock Freshness</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">99.4%</p>
            <span className="text-[10px] text-slate-400">142 Connected Stores</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Search-to-Detail</span>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-1">68.2%</p>
            <span className="text-[10px] text-slate-400">High Clinical Intent</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Avg Patient Savings</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">81.2%</p>
            <span className="text-[10px] text-slate-400">$51.20 per Rx avg</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-xs font-mono">Exceptions Queue</span>
            <p className="text-xl font-bold text-rose-400 font-mono mt-1">{unresolvedCount}</p>
            <span className="text-[10px] text-rose-300">Action Required</span>
          </div>
        </div>

        {/* Notice Banner */}
        {bannerNotice && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 p-3 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{bannerNotice}</span>
          </div>
        )}

        {/* VIEW 1: OVERVIEW & MARKETPLACE FUNNEL */}
        {selectedSubView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Substitution Funnel & Regional Throughput (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Prescription Search & Substitution Funnel */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Prescription Search & Substitution Funnel
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time user progression from brand queries to bioequivalent order fulfillment.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700/50">
                    Funnel Conv: 17.6%
                  </span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { stage: '1. Brand Queries & Rx Scans', count: 84200, pct: '100%', color: 'bg-blue-500' },
                    { stage: '2. Active Salt Molecules Resolved', count: 81950, pct: '97.3%', color: 'bg-cyan-500' },
                    { stage: '3. Bioequivalent Generics Compared', count: 58100, pct: '70.9%', color: 'bg-emerald-500' },
                    { stage: '4. Added to Cart (Generic Substituted)', count: 22400, pct: '38.5%', color: 'bg-purple-500' },
                    { stage: '5. Dispatched by Pharmacy Node', count: 14820, pct: '66.1%', color: 'bg-emerald-400' },
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 font-semibold">{step.stage}</span>
                        <span className="text-white font-bold">{step.count.toLocaleString()} ({step.pct})</span>
                      </div>
                      <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`${step.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${(step.count / 84200) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional Fulfillment Matrix */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Regional Fulfillment Matrix (Metro Hub Throughput)
                  </h3>
                  <span className="text-xs font-mono text-slate-400">142 Retail Endpoints</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { zone: 'Zone 1: Austin Metro', nodes: 18, throughput: '3,410 orders/day', avgTime: '32 mins', status: 'Optimal' },
                    { zone: 'Zone 2: Dallas-Fort Worth', nodes: 34, throughput: '5,120 orders/day', avgTime: '38 mins', status: 'Optimal' },
                    { zone: 'Zone 3: Houston Medical Center', nodes: 42, throughput: '4,190 orders/day', avgTime: '35 mins', status: 'Optimal' },
                    { zone: 'Zone 4: San Antonio Hub', nodes: 16, throughput: '1,280 orders/day', avgTime: '41 mins', status: 'Optimal' },
                    { zone: 'Zone 5: Phoenix Southwest', nodes: 20, throughput: '620 orders/day', avgTime: '44 mins', status: 'Optimal' },
                    { zone: 'Zone 6: Denver Hub', nodes: 12, throughput: '200 orders/day', avgTime: '49 mins', status: 'Onboarding' },
                  ].map((z, idx) => (
                    <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-300 font-bold">{z.zone}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{z.nodes} Active Pharmacy Nodes</p>
                      <p className="text-emerald-400 font-mono font-semibold">{z.throughput}</p>
                      <p className="text-slate-500 font-mono text-[10px]">Avg Delivery: {z.avgTime}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Critical Exception Priority Queue (1 col) */}
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Critical Exceptions
                    </h3>
                  </div>
                  <span className="bg-rose-500/20 text-rose-300 font-mono text-xs px-2 py-0.5 rounded border border-rose-500/40 font-bold">
                    {unresolvedCount} Active
                  </span>
                </div>

                <div className="space-y-3">
                  {exceptions.map((exc) => (
                    <div
                      key={exc.id}
                      className={`p-3.5 rounded-xl border transition space-y-2 ${
                        exc.status === 'resolved'
                          ? 'bg-slate-900/40 border-slate-800 opacity-60'
                          : exc.severity === 'critical'
                          ? 'bg-rose-950/30 border-rose-500/60'
                          : 'bg-amber-950/20 border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white">{exc.code}</span>
                        <span className="text-[10px] text-slate-400">{exc.timestamp}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200">{exc.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{exc.detail}</p>
                      <p className="text-[10px] font-mono text-slate-500">Node: {exc.node}</p>

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase font-bold ${
                          exc.status === 'resolved' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {exc.status}
                        </span>

                        {exc.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveException(exc.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                          >
                            Resolve / Triage
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Action Tools */}
                <div className="pt-3 border-t border-slate-700/80 space-y-2">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setShowAddSaltModal(true)}
                      className="p-2 bg-slate-900 hover:bg-slate-750 border border-slate-700 rounded-xl text-left text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add Canonical Salt</span>
                    </button>
                    <button
                      onClick={() => alert("Batch inventory refresh triggered across 142 nodes via WebSocket multicast.")}
                      className="p-2 bg-slate-900 hover:bg-slate-750 border border-slate-700 rounded-xl text-left text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Batch Sync Stock</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: CANONICAL FORMULARY MATRIX & RESOLUTION QUEUE */}
        {selectedSubView === 'formulary' && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Canonical Formulary Matrix & Salt Synonym Normalization
                </h3>
                <p className="text-xs text-slate-400">
                  Resolves messy doctor handwriting and proprietary brand variations into standardized chemical CAS and NDC molecular representations.
                </p>
              </div>

              <button
                onClick={() => setShowAddSaltModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Canonical Molecule</span>
              </button>
            </div>

            {/* Resolution Queue Table */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Raw Search / Rx Query</th>
                      <th className="py-3 px-4">Suggested Canonical Salt Molecule</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Source Feed</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Decision Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {mappings.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-750 transition">
                        <td className="py-3 px-4 font-mono font-bold text-white">{m.rawSearchTerm}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-emerald-300">{m.suggestedCanonicalSalt}</p>
                          <p className="text-[10px] text-slate-400">{m.strength}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-cyan-400">{(m.confidenceScore * 100).toFixed(1)}%</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{m.sourceFeed}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            m.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : m.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {m.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleMappingDecision(m.id, 'approved')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                                title="Approve Mapping"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMappingDecision(m.id, 'rejected')}
                                className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500">Indexed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MULTI-TENANT TELEMETRY */}
        {selectedSubView === 'telemetry' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-slate-400">Redis Cache Hit Rate</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">94.2%</p>
              <p className="text-xs text-slate-400">Sub-millisecond canonical lookup for 12,480 active drugs.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-slate-400">PostgreSQL P99 Latency</span>
              <p className="text-2xl font-bold font-mono text-cyan-400">14ms</p>
              <p className="text-xs text-slate-400">Partitioned orders table with Row-Level Security (RLS).</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-slate-400">Active Worker Threads</span>
              <p className="text-2xl font-bold font-mono text-purple-400">48 / 64</p>
              <p className="text-xs text-slate-400">Kafka consumer pool handling telemetry & escrow events.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-slate-400">Live WebSocket Connections</span>
              <p className="text-2xl font-bold font-mono text-amber-400">1,840</p>
              <p className="text-xs text-slate-400">Direct dispensary barcode scanners & courier links.</p>
            </div>
          </div>
        )}

        {/* Add Canonical Salt Modal */}
        {showAddSaltModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Add New Canonical Salt Molecule
                </h3>
                <button
                  onClick={() => setShowAddSaltModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  ✕ Cancel
                </button>
              </div>

              <form onSubmit={handleAddNewSalt} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Chemical Salt / Molecule Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Empagliflozin, Sitagliptin Phosphate"
                    value={newSaltName}
                    onChange={(e) => setNewSaltName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">CAS Registry Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 864070-44-0"
                    value={newCasNumber}
                    onChange={(e) => setNewCasNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-400">
                  Publishing indexes this molecule into the Elasticsearch bioequivalent engine and broadcasts to 142 connected dispensary nodes.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Publish to Canonical Index
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
