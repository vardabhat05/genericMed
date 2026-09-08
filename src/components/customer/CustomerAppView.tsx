import React, { useState } from 'react';
import { 
  Search, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Store, 
  ShoppingCart, 
  ChevronRight, 
  Info, 
  Sparkles, 
  Lock, 
  Plus, 
  Minus, 
  CreditCard, 
  Check, 
  AlertCircle,
  Eye,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { MedicineGeneric } from '../../types';
import { MEDICINES_DATA } from '../../data/mockData';

interface CustomerAppViewProps {
  onOrderCreated?: () => void;
}

export const CustomerAppView: React.FC<CustomerAppViewProps> = ({ onOrderCreated }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'compare' | 'details' | 'cart'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineGeneric>(MEDICINES_DATA[0]);
  
  // Cart state
  const [cart, setCart] = useState<{ medicine: MedicineGeneric; quantity: number }[]>([
    { medicine: MEDICINES_DATA[0], quantity: 2 }, // Glycomet 500
    { medicine: MEDICINES_DATA[1], quantity: 1 }, // Atorva 20
  ]);
  
  // OCR Prescription Simulation State
  const [isUploadingRx, setIsUploadingRx] = useState(false);
  const [rxUploaded, setRxUploaded] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    prescriber: string;
    detectedSalts: string[];
    recommendedGenerics: string[];
  } | null>(null);

  // Checkout Payment state
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'apple_pay' | 'card' | 'hsa'>('apple_pay');

  const filteredMedicines = MEDICINES_DATA.filter((med) =>
    med.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.originatorBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.activeSalt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartSubtotal = cart.reduce((sum, item) => sum + item.medicine.genericPrice * item.quantity, 0);
  const cartBrandOriginal = cart.reduce((sum, item) => sum + item.medicine.brandPrice * item.quantity, 0);
  const cartSavings = cartBrandOriginal - cartSubtotal;
  const genericDiscount = 3.0;
  const dispensingFee = 1.14;
  const finalTotal = Math.max(0, cartSubtotal - genericDiscount + dispensingFee);

  const handleSimulateRxUpload = () => {
    setIsUploadingRx(true);
    setTimeout(() => {
      setIsUploadingRx(false);
      setRxUploaded(true);
      setOcrResult({
        prescriber: 'Dr. Arthur Vance, MD (NPI: #1902847119)',
        detectedSalts: ['Metformin HCl 500mg ER', 'Atorvastatin Calcium 20mg'],
        recommendedGenerics: ['Glycomet 500mg ER (Save 79%)', 'Atorva 20mg (Save 84%)'],
      });
    }, 1400);
  };

  const handleAddToCart = (med: MedicineGeneric) => {
    const existing = cart.find(i => i.medicine.id === med.id);
    if (existing) {
      setCart(cart.map(i => i.medicine.id === med.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { medicine: med, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (medId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as { medicine: MedicineGeneric; quantity: number }[]);
  };

  const handleCheckout = () => {
    setPaymentDone(true);
    if (onOrderCreated) {
      onOrderCreated();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6">
      {/* Mobile-Frame Wrapper for High-Fidelity Simulator */}
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[760px] relative">
        
        {/* Device Status Bar */}
        <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs font-mono select-none">
          <span>09:41</span>
          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto"></div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <div className="w-4 h-2 border border-white rounded-sm p-0.5">
              <div className="w-full h-full bg-emerald-400 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Sub-Header / Location Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-left leading-tight">
              <p className="text-[11px] text-slate-400">Delivering to</p>
              <p className="text-xs font-bold text-white">Austin, TX 78701 • 35 mins</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('cart')} 
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <ShoppingCart className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white font-bold rounded-full text-[10px] flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Screen Contents */}
        <div className="flex-1 overflow-y-auto pb-20">

          {/* VIEW 1: DISCOVER SCREEN */}
          {activeTab === 'discover' && (
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brand (e.g. Glucophage, Lipitor)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* AI Prescription OCR Upload Banner */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-4 rounded-2xl border border-emerald-700/50 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-3 -translate-y-3 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">AI Salt Extraction</span>
                      <span className="bg-emerald-400/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-mono">HIPAA Encrypted</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Upload Doctor Prescription</h3>
                    <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                      Instant clinical entity detection maps expensive brand names to FDA-approved bioequivalent generic salts.
                    </p>
                  </div>
                </div>

                {/* Upload Action */}
                {!rxUploaded ? (
                  <div className="mt-3 pt-3 border-t border-emerald-800/80 flex items-center justify-between">
                    <button
                      onClick={handleSimulateRxUpload}
                      disabled={isUploadingRx}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      {isUploadingRx ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          <span>Extracting Active Salt Molecules...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Scan / Upload Prescription Image</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-emerald-800/80 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-emerald-300">OCR PARSER RESOLVED</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 100% Match
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-white">{ocrResult?.prescriber}</p>
                    <div className="space-y-1">
                      {ocrResult?.recommendedGenerics.map((gen, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded text-[10px]">
                          <span className="text-slate-200">{gen}</span>
                          <span className="text-emerald-400 font-bold">Auto-Substituted</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section Header: Trending Generic Switches */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Trending Generic Switches</h3>
                  <p className="text-[11px] text-slate-500">AB-Rated clinical bioequivalence confirmed</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Avg 80% Savings
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {filteredMedicines.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-emerald-500 transition shadow-xs space-y-2.5"
                  >
                    {/* Brand vs Generic comparison line */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="line-through text-slate-400">${med.brandPrice.toFixed(2)}</span>
                          <span className="text-slate-500">Brand: {med.originatorBrand}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{med.brandName}</h4>
                        <p className="text-[11px] font-mono text-emerald-700 font-medium">{med.activeSalt}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-emerald-700">${med.genericPrice.toFixed(2)}</span>
                        <div className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          Save {med.savingsPercent}%
                        </div>
                      </div>
                    </div>

                    {/* Bioequivalence Metric & Badge */}
                    <div className="flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bioequivalent: <strong>{med.bioequivalentScore}%</strong></span>
                      </div>
                      <span className="text-emerald-700 font-medium">f2 score: {med.f2SimilarityMetric}</span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedMedicine(med);
                          setActiveTab('compare');
                        }}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-600" />
                        <span>Compare (PK)</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMedicine(med);
                          setActiveTab('details');
                        }}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: COMPARE SCREEN (SIDE-BY-SIDE CLINICAL BIOEQUIVALENCE) */}
          {activeTab === 'compare' && (
            <div className="p-4 space-y-4">
              <button
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Discover
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                    Pharmacokinetic Analysis
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">CAS: {selectedMedicine.casNumber}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Side-by-Side Equivalence
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMedicine.genericName}
                </p>
              </div>

              {/* Rationale Callout */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Why {selectedMedicine.brandName} is Recommended</span>
                </div>
                <p className="text-[11px] text-emerald-950/80 leading-relaxed">
                  {selectedMedicine.clinicalRationale}
                </p>
              </div>

              {/* Originator vs Generic Comparison Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="grid grid-cols-2 divide-x divide-slate-100 text-xs">
                  {/* Originator Column */}
                  <div className="p-3 bg-slate-50/70 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Originator Drug</span>
                    <h4 className="font-bold text-slate-900">{selectedMedicine.originatorBrand}</h4>
                    <p className="text-[10px] text-slate-500">{selectedMedicine.originatorManufacturer}</p>
                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[10px] text-slate-400">Retail Price</p>
                      <p className="text-sm font-bold text-rose-600 line-through">${selectedMedicine.brandPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Therapeutic Class</p>
                      <p className="text-[11px] font-medium text-slate-700">Innovator Reference</p>
                    </div>
                  </div>

                  {/* Generic Column */}
                  <div className="p-3 bg-emerald-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider font-bold">Recommended Generic</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <h4 className="font-bold text-emerald-900">{selectedMedicine.brandName}</h4>
                    <p className="text-[10px] text-slate-600">{selectedMedicine.manufacturer}</p>
                    <div className="pt-2 border-t border-emerald-200/60">
                      <p className="text-[10px] text-emerald-800">Direct Price</p>
                      <p className="text-sm font-extrabold text-emerald-700">${selectedMedicine.genericPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-800">Equivalence</p>
                      <p className="text-[11px] font-bold text-emerald-900">{selectedMedicine.bioequivalentScore}% (AB Rated)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparative Bioavailability Curve (PK Profile) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Plasma Concentration vs Time (0-24h)</h4>
                    <p className="text-[10px] text-slate-500">Bioavailability AUC & Cmax curve comparison</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    f2 = {selectedMedicine.f2SimilarityMetric}
                  </span>
                </div>

                {/* SVG Graph */}
                <div className="relative h-44 w-full bg-slate-900 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Cmax: {selectedMedicine.pkProfile.cmaxUgl} µg/mL</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-300">
                        <span className="w-2 h-0.5 bg-slate-400"></span> Innovator
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-0.5 bg-emerald-400"></span> {selectedMedicine.brandName}
                      </span>
                    </div>
                  </div>

                  {/* SVG Curves */}
                  <div className="relative h-28 w-full">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="300" y2="25" stroke="#334155" strokeDasharray="3,3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeDasharray="3,3" />
                      <line x1="0" y1="75" x2="300" y2="75" stroke="#334155" strokeDasharray="3,3" />
                      
                      {/* Reference Innovator curve (Gray) */}
                      <path
                        d="M 0 95 Q 60 10, 120 40 T 300 85"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />

                      {/* Generic Curve (Emerald Green) */}
                      <path
                        d="M 0 95 Q 62 12, 122 39 T 300 86"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />

                      {/* Tmax point indicator */}
                      <circle cx="62" cy="12" r="3.5" fill="#10b981" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-1">
                    <span>0h (Admin)</span>
                    <span>Tmax: {selectedMedicine.pkProfile.tmaxHours}h</span>
                    <span>12h</span>
                    <span>24h (Elimination)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>AUC ratio <strong>{(selectedMedicine.pkProfile.aucRatio * 100).toFixed(1)}%</strong> sits comfortably within the required 80.0% – 125.0% FDA bioequivalence window.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    handleAddToCart(selectedMedicine);
                    setActiveTab('cart');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Substitute & Add to Cart (${selectedMedicine.genericPrice.toFixed(2)})</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: MEDICINE DETAILS */}
          {activeTab === 'details' && (
            <div className="p-4 space-y-4">
              <button
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Search
              </button>

              {/* Product Header */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                      Canonical Equivalent
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">{selectedMedicine.brandName}</h3>
                    <p className="text-xs text-slate-500">{selectedMedicine.form} • {selectedMedicine.dosage}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{selectedMedicine.manufacturer}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-700">${selectedMedicine.genericPrice.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400 line-through">Brand: ${selectedMedicine.brandPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-semibold">Direct Patient Savings:</span>
                  <span className="font-bold text-emerald-700">Save ${(selectedMedicine.brandPrice - selectedMedicine.genericPrice).toFixed(2)} per strip</span>
                </div>
              </div>

              {/* Clinical Rigor Badges */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Clinical Assurance Rigor</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-slate-400 font-mono">Therapeutic Equivalence</p>
                    <p className="font-bold text-slate-800">{selectedMedicine.orangeBookRating}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-slate-400 font-mono">Similarity Index</p>
                    <p className="font-bold text-emerald-700">f2 = {selectedMedicine.f2SimilarityMetric}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {selectedMedicine.description}
                </p>
              </div>

              {/* Fulfillable Pharmacies Nearby */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Fulfillable Pharmacies Nearby</h4>
                <div className="space-y-2">
                  <div className="bg-white border-2 border-emerald-500 p-3 rounded-2xl shadow-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900">Apollo Pharmacy - Store Node #4</span>
                      </div>
                      <p className="text-[10px] text-slate-500">0.8 miles away • Bay C-4 Shelf 2 • In Stock: 420</p>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded inline-block">
                        Ready for 35-min Dispatch
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900">${selectedMedicine.genericPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between opacity-80">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-slate-800">MedPlus Austin Central</span>
                      <p className="text-[10px] text-slate-400">1.4 miles away • In Stock: 180</p>
                    </div>
                    <span className="font-semibold text-xs text-slate-700">${(selectedMedicine.genericPrice - 0.15).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleAddToCart(selectedMedicine);
                    setActiveTab('cart');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add {selectedMedicine.brandName} to Cart</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: CART & CHECKOUT (IMAGE 12 EXACT REPLICA) */}
          {activeTab === 'cart' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('discover')}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Continue Browsing
                </button>
                <span className="text-xs font-mono text-slate-400">Cart #{cart.length} items</span>
              </div>

              {!paymentDone ? (
                <>
                  {/* Chronic Care Savings Banner */}
                  <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-sm space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                      <TrendingDown className="w-4 h-4" />
                      <span>CHRONIC CARE BENEFIT</span>
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight">
                      You're saving ${cartSavings.toFixed(2)}!
                    </h3>
                    <p className="text-[11px] text-emerald-100/90 leading-tight">
                      80% lower than brand-name retail pricing via direct generic API substitution.
                    </p>
                  </div>

                  {/* Prescription on File Badge */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-bold text-slate-800">Prescription on File</p>
                        <p className="text-[10px] text-slate-400">Dr. Arthur Vance, MD (NPI #1902847119)</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.medicine.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{item.medicine.brandName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{item.medicine.form}</p>
                          <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                            ${(item.medicine.genericPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                          <button
                            onClick={() => updateCartQuantity(item.medicine.id, -1)}
                            className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.medicine.id, 1)}
                            className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Route Matrix */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Delivery Destination
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">Express Courier</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Sarah Jenkins • 402 West 6th St, Austin TX 78701</p>
                    <p className="text-[10px] text-slate-400">Dispatched from Apollo Pharmacy Node #4 (35 min ETA)</p>
                  </div>

                  {/* Financial Itemized Reconciliation */}
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 font-mono uppercase text-[10px]">Itemized Reconciliation</h4>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Medicines Subtotal</span>
                        <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Generic Subsidy Discount</span>
                        <span className="font-mono">-${genericDiscount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clinical Dispensing Fee</span>
                        <span className="font-mono">${dispensingFee.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                        <span>Total Due</span>
                        <span className="font-mono text-emerald-700">${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instrument Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                      Select Settlement Instrument
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedPaymentMethod('apple_pay')}
                        className={`p-2 rounded-xl border text-center transition ${
                          selectedPaymentMethod === 'apple_pay'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">Apple Pay</p>
                        <p className="text-[9px] opacity-70">1-Touch</p>
                      </button>

                      <button
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`p-2 rounded-xl border text-center transition ${
                          selectedPaymentMethod === 'card'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">Visa / MC</p>
                        <p className="text-[9px] opacity-70">•••• 4242</p>
                      </button>

                      <button
                        onClick={() => setSelectedPaymentMethod('hsa')}
                        className={`p-2 rounded-xl border text-center transition ${
                          selectedPaymentMethod === 'hsa'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">HSA / FSA</p>
                        <p className="text-[9px] opacity-70">Pre-tax</p>
                      </button>
                    </div>
                  </div>

                  {/* Authorize & Pay CTA */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay ${finalTotal.toFixed(2)}</span>
                  </button>
                </>
              ) : (
                /* Payment Success View with Escrow & Live Node Relay */
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 my-6">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Payment Escrow Authorized</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Order #ORD-98241 routed to Apollo Pharmacy Store Node #4.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-left font-mono text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Escrow Hold:</span>
                      <span className="text-slate-900 font-bold">${finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Settlement Trigger:</span>
                      <span className="text-emerald-700">Upon Pharmacist Sign-Off</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Courier:</span>
                      <span className="text-slate-900">Jason K. (PIN: 8492)</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Switch to the <strong>"Store Node #4"</strong> tab to view the live dispensing verification checklist!
                  </p>

                  <button
                    onClick={() => {
                      setPaymentDone(false);
                      setActiveTab('discover');
                    }}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Return to Discover
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around z-20">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              activeTab === 'discover' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              activeTab === 'compare' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Compare</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              activeTab === 'details' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Equivalence</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition relative ${
              activeTab === 'cart' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
