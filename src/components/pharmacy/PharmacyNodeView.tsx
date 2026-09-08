import React, { useState } from 'react';
import { 
  Store, 
  Thermometer, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Barcode, 
  Clock, 
  UserCheck, 
  Truck, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight,
  Printer,
  Radio,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { PharmacyStockItem, PharmacyOrder } from '../../types';
import { PHARMACY_STOCK, INITIAL_ORDERS } from '../../data/mockData';

export const PharmacyNodeView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'inventory'>('orders');
  const [stockList, setStockList] = useState<PharmacyStockItem[]>(PHARMACY_STOCK);
  const [orders, setOrders] = useState<PharmacyOrder[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ord-98241');
  const [inventorySearch, setInventorySearch] = useState('');
  
  // Barcode Scanner simulation state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Handle Barcode scan in inventory
  const handleStockInScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedIndex = stockList.findIndex(
      s => s.sku.toLowerCase() === barcodeInput.toLowerCase() ||
           s.batchNumber.toLowerCase().includes(barcodeInput.toLowerCase())
    );

    if (matchedIndex !== -1) {
      const updated = [...stockList];
      updated[matchedIndex].stockQty += 50;
      setStockList(updated);
      setScanMessage(`Verified & Stocked +50 units for ${updated[matchedIndex].name} (${updated[matchedIndex].batchNumber})`);
      setBarcodeInput('');
      setTimeout(() => setScanMessage(null), 4000);
    } else {
      setScanMessage(`Barcode ${barcodeInput} not mapped to active formulary.`);
      setTimeout(() => setScanMessage(null), 3000);
    }
  };

  // Dispensing verification steps
  const toggleItemVerification = (itemIdx: number) => {
    if (!selectedOrder) return;
    const updatedOrders = orders.map(ord => {
      if (ord.id === selectedOrder.id) {
        const updatedItems = [...ord.items];
        updatedItems[itemIdx].verified = !updatedItems[itemIdx].verified;
        return { ...ord, items: updatedItems };
      }
      return ord;
    });
    setOrders(updatedOrders);
  };

  const handleSignOffPharmacist = () => {
    if (!selectedOrder) return;
    const updatedOrders = orders.map(ord => {
      if (ord.id === selectedOrder.id) {
        return {
          ...ord,
          pharmacistSigned: true,
          prescriptionVerified: true,
          pharmacistName: 'Dr. Arthur Pendelton, R.Ph #49021',
          status: 'packaged' as const,
        };
      }
      return ord;
    });
    setOrders(updatedOrders);
  };

  const handleCourierHandover = () => {
    if (!selectedOrder) return;
    const updatedOrders = orders.map(ord => {
      if (ord.id === selectedOrder.id) {
        return {
          ...ord,
          courierHandoverDone: true,
          status: 'dispatched' as const,
        };
      }
      return ord;
    });
    setOrders(updatedOrders);
  };

  const filteredStock = stockList.filter(s => 
    s.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    s.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    s.shelfLocation.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Node Fulfillment Header */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/40">
                DISPENSARY NODE #4
              </span>
              <span className="text-slate-400 text-xs font-mono">Austin Downtown Hub • DEA TX-9042-FD</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <Store className="w-7 h-7 text-blue-400" />
              Apollo Pharmacy — Live Fulfillment Console
            </h1>
            <p className="text-xs text-slate-400">
              Active node fulfilling generic bioequivalent orders with real-time barcode validation, cold-chain monitoring, and licensed pharmacist quality sign-off.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeSubTab === 'orders'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Orders Queue ({orders.filter(o => o.status !== 'dispatched').length})
            </button>
            <button
              onClick={() => setActiveSubTab('inventory')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeSubTab === 'inventory'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dispensary Stock Ledger ({stockList.length})
            </button>
          </div>
        </div>

        {/* Node Telemetry 5-Card Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Cold-Chain Guard</span>
              <Thermometer className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">4.2°C</p>
            <span className="text-[10px] text-slate-400">Target 2.0°C – 6.0°C (Nominal)</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active SKUs</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono mt-1">1,420</p>
            <span className="text-[10px] text-slate-400">99.4% Physical Match</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Depletion Queue</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400 font-mono mt-1">06</p>
            <span className="text-[10px] text-slate-400">Auto-RFQ Trigger Active</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>POS Bridge</span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">Connected</p>
            <span className="text-[10px] text-slate-400">Sync cycle: 10s P2P</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Ledger Audits</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-1">418</p>
            <span className="text-[10px] text-slate-400">DEA 222 Compliant</span>
          </div>
        </div>

        {/* TAB 1: LIVE ORDERS QUEUE & DISPENSING STATION */}
        {activeSubTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Orders List (1 col) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>ACTIVE QUEUE ({orders.length})</span>
                <span>ESCROW SECURED</span>
              </div>

              <div className="space-y-2.5">
                {orders.map((ord) => {
                  const isSelected = ord.id === selectedOrderId;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 shadow-md'
                          : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-blue-400">{ord.orderNumber}</span>
                        <span className="text-slate-400">{ord.timestamp}</span>
                      </div>

                      <h4 className="font-bold text-white text-sm mt-1">{ord.patientName}</h4>
                      <p className="text-xs text-slate-400 truncate">{ord.items.map(i => i.medicineName).join(', ')}</p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/60 text-xs">
                        <span className="font-mono text-emerald-400 font-bold">${ord.totalAmount.toFixed(2)}</span>
                        
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          ord.status === 'action_required'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : ord.status === 'dispensing'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : ord.status === 'packaged'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dispensing Verification Station (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Station Title */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-700 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-blue-400 font-bold">DISPENSING STATION</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-xs text-slate-300">{selectedOrder.orderNumber}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-0.5">
                      Verification for {selectedOrder.patientName}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Destination: {selectedOrder.address}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Smart Escrow Vault</span>
                    <p className="text-lg font-bold text-emerald-400 font-mono">
                      ${selectedOrder.totalAmount.toFixed(2)} HELD
                    </p>
                  </div>
                </div>

                {/* Prescriber Validation Banner */}
                <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">Digital Prescription Authenticated</p>
                      <p className="text-slate-400 font-mono text-[11px]">{selectedOrder.doctorName} • {selectedOrder.doctorNpi}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded">
                    E-Prescribe Hash Valid
                  </span>
                </div>

                {/* Checklist 1: Physical Barcode Scanning */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                      1. Physical Barcode & Batch Verification
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedOrder.items.filter(i => i.verified).length}/{selectedOrder.items.length} Scanned
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                          item.verified
                            ? 'bg-emerald-950/30 border-emerald-500/60'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.medicineName}</span>
                            <span className="text-xs text-slate-400">({item.dosage})</span>
                          </div>
                          <p className="text-xs font-mono text-slate-400">
                            Shelf: <strong className="text-blue-300">{item.shelfLocation}</strong> • Batch: <strong className="text-slate-200">{item.batchNumber}</strong>
                          </p>
                        </div>

                        <button
                          onClick={() => toggleItemVerification(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                            item.verified
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              : 'bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700'
                          }`}
                        >
                          <Barcode className="w-4 h-4" />
                          <span>{item.verified ? 'Scanned & Verified ✓' : 'Simulate Barcode Scan'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist 2: Pharmacist Quality Sign-Off */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">
                        2. Pharmacist Clinical Quality Sign-Off
                      </h4>
                      <p className="text-xs text-slate-400">
                        Confirm generic drug substitution bioequivalence and dosage instructions.
                      </p>
                    </div>

                    {selectedOrder.pharmacistSigned ? (
                      <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-700/60">
                        <CheckCircle2 className="w-4 h-4" /> Signed by R.Ph
                      </span>
                    ) : (
                      <button
                        onClick={handleSignOffPharmacist}
                        disabled={selectedOrder.items.some(i => !i.verified)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                          selectedOrder.items.some(i => !i.verified)
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                        }`}
                      >
                        Sign & Authorize Packaging
                      </button>
                    )}
                  </div>
                  {selectedOrder.pharmacistSigned && (
                    <p className="text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                      Digital Cryptographic Signature: <span className="text-slate-300">{selectedOrder.pharmacistName}</span>
                    </p>
                  )}
                </div>

                {/* Checklist 3: Courier Handover Protocol */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">
                        3. Express Courier Handover
                      </h4>
                      <p className="text-xs text-slate-400">
                        Courier: <span className="text-slate-200 font-semibold">{selectedOrder.courierName}</span> • Handover PIN: <span className="text-blue-400 font-mono font-bold">{selectedOrder.courierPin}</span>
                      </p>
                    </div>

                    {selectedOrder.courierHandoverDone ? (
                      <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-700/60">
                        <Truck className="w-4 h-4" /> Dispatched for Delivery
                      </span>
                    ) : (
                      <button
                        onClick={handleCourierHandover}
                        disabled={!selectedOrder.pharmacistSigned}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                          !selectedOrder.pharmacistSigned
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        Verify PIN & Release to Courier
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ACTIVE DISPENSARY STOCK LEDGER */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-4">
            
            {/* Rapid Barcode Stock-In Banner */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Barcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rapid Physical Stock-In Barcode Scanner</h3>
                  <p className="text-xs text-slate-400">Scan incoming medicine carton barcodes or enter SKU code (e.g. GM-500-ER, ATV-020-CL).</p>
                </div>
              </div>

              <form onSubmit={handleStockInScan} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan SKU / Barcode..."
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex-shrink-0"
                >
                  Stock In (+50)
                </button>
              </form>
            </div>

            {/* Scan Notification Message */}
            {scanMessage && (
              <div className="bg-emerald-950/80 border border-emerald-500/60 p-3 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{scanMessage}</span>
              </div>
            )}

            {/* Inventory Table Search & Ledger */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search SKU, name, or shelf bay..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredStock.length} SKUs in Node #4
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">SKU / Code</th>
                      <th className="py-3 px-4">Product Name & Active Molecule</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Shelf Bay</th>
                      <th className="py-3 px-4">Batch / Lot</th>
                      <th className="py-3 px-4">Expiry</th>
                      <th className="py-3 px-4">Retail Price</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {filteredStock.map((stock) => (
                      <tr key={stock.sku} className="hover:bg-slate-750 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">{stock.sku}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{stock.name}</p>
                          <p className="text-[11px] text-slate-400">{stock.activeSalt}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`font-bold ${stock.stockQty <= stock.reorderPoint ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {stock.stockQty}
                          </span>
                          <span className="text-slate-500 text-[10px] ml-1">({stock.reservedQty} rsvd)</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{stock.shelfLocation}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{stock.batchNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{stock.expiryDate}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">${stock.sellingPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            stock.status === 'optimal'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {stock.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
