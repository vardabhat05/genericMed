import React, { useState } from 'react';
import { UserRole } from './types';
import { Header } from './components/common/Header';
import { CustomerAppView } from './components/customer/CustomerAppView';
import { PharmacyNodeView } from './components/pharmacy/PharmacyNodeView';
import { ManufacturerHubView } from './components/manufacturer/ManufacturerHubView';
import { OpsControlView } from './components/operations/OpsControlView';
import { ApiGatewayView } from './components/developer/ApiGatewayView';
import { SystemArchitectureView } from './components/architecture/SystemArchitectureView';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [activeOrderCount, setActiveOrderCount] = useState<number>(4);
  const [exceptionCount, setExceptionCount] = useState<number>(3);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const handleOrderCreated = (orderId?: string) => {
    setActiveOrderCount(prev => prev + 1);
    setGlobalToast(`🎉 Order #${orderId || 'ORD-98241'} routed to Apollo Pharmacy (Store Node #4)! Escrow funds pre-authorized.`);
    setTimeout(() => setGlobalToast(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Global Toast Notification */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400">
          <span>{globalToast}</span>
          <button 
            onClick={() => setGlobalToast(null)}
            className="text-xs bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cross-Persona System Navigation Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        activeOrderCount={activeOrderCount}
        exceptionCount={exceptionCount}
      />

      {/* Main View Portals */}
      <main className="flex-1">
        {activeRole === 'customer' && (
          <CustomerAppView onOrderCreated={handleOrderCreated} />
        )}

        {activeRole === 'pharmacy' && (
          <PharmacyNodeView />
        )}

        {activeRole === 'manufacturer' && (
          <ManufacturerHubView />
        )}

        {activeRole === 'operations' && (
          <OpsControlView onExceptionsChange={setExceptionCount} />
        )}

        {activeRole === 'developer' && (
          <ApiGatewayView />
        )}

        {activeRole === 'architecture' && (
          <SystemArchitectureView onNavigateToRole={setActiveRole} />
        )}
      </main>

      {/* Footer System Status Strip */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-bold">genericMed Core Network</span>
            <span>•</span>
            <span>Cluster us-central1 (Austin)</span>
            <span>•</span>
            <span className="text-emerald-400">142 Nodes Live</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>FDA cGMP 21 CFR § 211</span>
            <span>•</span>
            <span>USP &lt;711&gt; Bioequivalence Verified</span>
            <span>•</span>
            <span>HL7 FHIR R4 API</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
