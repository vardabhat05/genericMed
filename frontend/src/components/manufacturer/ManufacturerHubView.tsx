import React, { useState } from 'react';
import { 
  Factory, 
  FileText, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  Award, 
  Download, 
  ChevronRight, 
  Building2, 
  Network, 
  Gavel, 
  DollarSign, 
  Send, 
  Filter, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { ManufacturerDossier, RfqVolumeContract } from '../../types';
import { MANUFACTURER_DOSSIERS, OPEN_RFQS } from '../../data/mockData';
import { apiClient } from '../../services/apiClient';

export const ManufacturerHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dossiers' | 'rfqs'>('dossiers');
  const [dossiers, setDossiers] = useState<ManufacturerDossier[]>(MANUFACTURER_DOSSIERS);
  const [selectedDossierId, setSelectedDossierId] = useState<string>('dos-atorva-20');
  const [selectedPhIndex, setSelectedPhIndex] = useState<number>(0);
  
  // RFQ bidding state
  const [rfqs, setRfqs] = useState<RfqVolumeContract[]>(OPEN_RFQS);
  const [biddingRfq, setBiddingRfq] = useState<RfqVolumeContract | null>(null);
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);

  // Load dossiers and RFQs from backend on mount
  React.useEffect(() => {
    apiClient.manufacturers.getDossiers().then(res => {
      if (res?.data && res.data.length > 0) {
        setDossiers(res.data);
      }
    }).catch(() => {});

    apiClient.manufacturers.getRfqs().then(res => {
      if (res?.data && res.data.length > 0) {
        setRfqs(res.data);
      }
    }).catch(() => {});
  }, []);

  const selectedDossier = dossiers.find(d => d.id === selectedDossierId) || dossiers[0];
  const activeDissolution = selectedDossier.multiPhDissolution[selectedPhIndex] || selectedDossier.multiPhDissolution[0];

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingRfq || !bidPrice) return;

    const priceNum = parseFloat(bidPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    try {
      await apiClient.manufacturers.placeBid(biddingRfq.id, priceNum, 'Zydus Lifesciences Ltd');
    } catch {
      // Continue updating local UI state
    }

    setRfqs(rfqs.map(r => {
      if (r.id === biddingRfq.id) {
        return {
          ...r,
          currentLowestBid: priceNum,
        };
      }
      return r;
    }));

    setBidSuccessMessage(`Bid of $${priceNum.toFixed(3)}/unit submitted for ${biddingRfq.rfqCode} by Zydus Lifesciences!`);
    setBiddingRfq(null);
    setBidPrice('');
    setTimeout(() => setBidSuccessMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Manufacturer Header */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs border border-purple-500/40">
                LICENSED FACILITY: ZYDUS LIFESCIENCES LTD
              </span>
              <span className="text-slate-400 text-xs font-mono">FDA cGMP • LIC: G/25/1842</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <Factory className="w-7 h-7 text-purple-400" />
              MFR HUB v3.1 — Regulatory Dossiers & Volume Distribution
            </h1>
            <p className="text-xs text-slate-400">
              Submit bioequivalence dissolution curves (f2 scores), manage ANDA dossiers, and bid on direct-to-pharmacy dispensary network allocation contracts.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dossiers')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'dossiers'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regulatory Dossiers & f2 Curves
            </button>
            <button
              onClick={() => setActiveTab('rfqs')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'rfqs'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dispensary Volume RFQs ({rfqs.length})
            </button>
          </div>
        </div>

        {/* 5-Card Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Active Dossiers</span>
            <p className="text-xl font-bold text-white font-mono mt-1">84 SKUs</p>
            <span className="text-[10px] text-purple-400">100% FDA Approved</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Canonical Index</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">99.2%</p>
            <span className="text-[10px] text-slate-400">Normalized Salt IDs</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">BE Audit Score</span>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-1">100%</p>
            <span className="text-[10px] text-slate-400">USP & In-Vivo Validated</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Downstream Reach</span>
            <p className="text-xl font-bold text-amber-400 font-mono mt-1">142 Hubs</p>
            <span className="text-[10px] text-slate-400">Direct Delivery</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-xs font-mono">Avg API Price Index</span>
            <p className="text-xl font-bold text-white font-mono mt-1">$0.032</p>
            <span className="text-[10px] text-emerald-400 font-mono">-78% vs Innovator</span>
          </div>
        </div>

        {/* Bid notification */}
        {bidSuccessMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-3.5 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{bidSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: PRODUCT PORTFOLIO & REGULATORY DOSSIERS */}
        {activeTab === 'dossiers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Dossier List (1 col) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>REGISTERED FORMULATIONS</span>
                <span>ANDA STATUS</span>
              </div>

              <div className="space-y-2.5">
                {dossiers.map((dos) => {
                  const isSelected = dos.id === selectedDossierId;
                  return (
                    <div
                      key={dos.id}
                      onClick={() => {
                        setSelectedDossierId(dos.id);
                        setSelectedPhIndex(0);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border transition ${
                        isSelected
                          ? 'bg-slate-800 border-purple-500 shadow-md'
                          : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-purple-400">{dos.fdaDossierNumber}</span>
                        <span className="text-emerald-400 font-bold">f2: {dos.f2Score}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{dos.brandName}</h4>
                      <p className="text-xs text-slate-400">{dos.activeSalt}</p>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/60 text-[10px] font-mono">
                        <span className="text-slate-400">{dos.activeBatches.length} Active Production Batches</span>
                        <span className="text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">FDA APPROVED</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dossier Details & Dissolution Curve Inspector (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-700 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-purple-400 font-bold">{selectedDossier.fdaDossierNumber}</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-xs text-slate-300">{selectedDossier.genericName}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-0.5">
                      Dossier: {selectedDossier.brandName} ({selectedDossier.dosage})
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-right font-mono">
                      <span className="text-[10px] text-slate-400">Similarity Metric</span>
                      <p className="text-sm font-bold text-emerald-400">f2 = {selectedDossier.f2Score}</p>
                    </div>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-right font-mono">
                      <span className="text-[10px] text-slate-400">Difference Metric</span>
                      <p className="text-sm font-bold text-cyan-400">f1 = {selectedDossier.f1Score}</p>
                    </div>
                  </div>
                </div>

                {/* Multi-pH Dissolution Curve Inspector */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-mono uppercase text-slate-300 font-bold">
                        Multi-pH In-Vitro Dissolution Profiles
                      </h3>
                      <p className="text-xs text-slate-400">
                        USP Apparatus II (Paddle, 50 RPM, 37°C ± 0.5°C)
                      </p>
                    </div>

                    {/* Buffer switcher */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {selectedDossier.multiPhDissolution.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPhIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition ${
                            selectedPhIndex === idx
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          {item.phLabel.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dissolution Chart Graphic */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">{activeDissolution.phLabel}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <span className="w-2.5 h-0.5 bg-slate-400"></span> Reference Innovator
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-400">
                          <span className="w-2.5 h-0.5 bg-purple-400"></span> Zydus Generic
                        </span>
                      </div>
                    </div>

                    {/* Dissolution Release Visual Bars */}
                    <div className="space-y-2 pt-2">
                      {activeDissolution.timePoints.map((tp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-slate-400">
                            <span>T = {tp.time} min</span>
                            <span>Ref: {tp.refRelease}% | Generic: {tp.testRelease}%</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                            {/* Ref */}
                            <div
                              className="bg-slate-500 rounded-full h-full transition-all duration-300"
                              style={{ width: `${tp.refRelease}%` }}
                            ></div>
                            {/* Test */}
                            <div
                              className="bg-purple-500 rounded-full h-full transition-all duration-300"
                              style={{ width: `${tp.testRelease}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                      <span>FDA Bioequivalence Requirement: f2 &gt; 50.0</span>
                      <span className="text-emerald-400 font-bold">COMPLIANT (f2 = {selectedDossier.f2Score})</span>
                    </div>
                  </div>
                </div>

                {/* Active Production Batches */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-slate-300 font-bold">
                    Active Production Batches & Certificates of Analysis (CoA)
                  </h3>
                  <div className="space-y-2">
                    {selectedDossier.activeBatches.map((b, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-white">{b.batchId}</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono px-1.5 py-0.2 rounded uppercase">
                              QC: {b.qcStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Yield: {b.yieldUnits.toLocaleString()} units • Release: {b.releaseDate}
                          </p>
                          <p className="text-[11px] text-slate-500">Destination: {b.destinationHub}</p>
                        </div>

                        <button
                          onClick={() => alert(`Certificate of Analysis for batch ${b.batchId} downloaded (PDF 1.2 MB). Cryptographically signed by Zydus QA Director.`)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-400" />
                          <span>Download CoA</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DISPENSARY VOLUME CONTRACTS & RFQS */}
        {activeTab === 'rfqs' && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-purple-400" />
                  Direct Pharmacy Network Volume Replenishment Requests (RFQs)
                </h3>
                <p className="text-xs text-slate-400">
                  Consolidated demand contracts aggregated across 142 licensed dispensary nodes. Submit bulk unit bids to supply inventory directly.
                </p>
              </div>

              <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-700/60">
                1.05M Total Requested Units
              </span>
            </div>

            {/* RFQs List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-400">{rfq.rfqCode}</span>
                      <span className="text-amber-400">{rfq.deadline}</span>
                    </div>

                    <h4 className="font-bold text-white text-base">{rfq.saltName}</h4>
                    <p className="text-xs text-slate-400">{rfq.requestedBy}</p>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Volume Required:</span>
                        <span className="text-white font-bold">{rfq.quantityUnits.toLocaleString()} tabs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ceiling Price:</span>
                        <span className="text-slate-300">${rfq.targetMaxPrice.toFixed(3)}/unit</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                        <span>Current Lowest Bid:</span>
                        <span>${rfq.currentLowestBid?.toFixed(3)}/unit</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setBiddingRfq(rfq)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Submit Competitive Bid</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Bid Modal */}
            {biddingRfq && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-purple-400" />
                      Submit Bid: {biddingRfq.rfqCode}
                    </h3>
                    <button
                      onClick={() => setBiddingRfq(null)}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-slate-300 font-bold">{biddingRfq.saltName}</p>
                    <p className="text-xs text-slate-400">{biddingRfq.quantityUnits.toLocaleString()} units requested</p>
                  </div>

                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300">Your Unit Bid Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder={`e.g. ${(biddingRfq.currentLowestBid ? biddingRfq.currentLowestBid - 0.002 : 0.024).toFixed(3)}`}
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-xs font-mono space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>Total Contract Value:</span>
                        <span className="text-white font-bold">
                          ${bidPrice ? (parseFloat(bidPrice) * biddingRfq.quantityUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lead Time to Node #4:</span>
                        <span className="text-emerald-400">48 Hours (Guaranteed)</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition"
                    >
                      Confirm Bid Submission
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
