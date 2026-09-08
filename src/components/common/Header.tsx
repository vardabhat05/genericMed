import React from 'react';
import { 
  ShieldCheck, 
  Store, 
  Factory, 
  Activity, 
  Code2, 
  Network, 
  Smartphone, 
  Bell, 
  CheckCircle2, 
  Radio, 
  Cpu
} from 'lucide-react';
import { PortalRole } from '../../types';

interface HeaderProps {
  activeRole: PortalRole;
  setActiveRole: (role: PortalRole) => void;
  exceptionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  exceptionCount,
}) => {
  const roleNavItems: { id: PortalRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'customer',
      label: 'Patient App',
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: 'pharmacy',
      label: 'Store Node #4',
      icon: <Store className="w-4 h-4" />,
      badge: 'Apollo Rx',
    },
    {
      id: 'manufacturer',
      label: 'MFR Hub',
      icon: <Factory className="w-4 h-4" />,
      badge: 'Zydus',
    },
    {
      id: 'operations',
      label: 'Ops Control',
      icon: <Activity className="w-4 h-4" />,
      badge: exceptionCount > 0 ? `${exceptionCount} Alerts` : undefined,
    },
    {
      id: 'developer',
      label: 'API Gateway',
      icon: <Code2 className="w-4 h-4" />,
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: <Network className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Top micro-bar for platform telemetry */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CLUSTER #01 • US-CENTRAL1 (ACTIVE-ACTIVE)
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400" />
            142 Pharmacy Nodes Connected
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-slate-400">
            <Cpu className="w-3 h-3 text-cyan-400" />
            P99 DB Latency: 14ms
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">DEA / FDA cGMP Compliant</span>
          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
            99.4% Bioequivalent Match
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveRole('customer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  generic<span className="text-emerald-400">Med</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wide">
                  v3.1 SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Bioequivalent Marketplace & Operating System
              </p>
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
            {roleNavItems.map((item) => {
              const isActive = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-role-${item.id}`}
                  onClick={() => setActiveRole(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        item.badge.includes('Alert')
                          ? 'bg-rose-500 text-white'
                          : isActive
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveRole('operations')}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {exceptionCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                DR
              </div>
              <div className="text-left leading-tight hidden lg:block">
                <p className="text-xs font-semibold text-white">Dr. A. Vance, MD</p>
                <p className="text-[10px] text-slate-400 font-mono">Licensed Prescriber</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden py-2 border-t border-slate-800 overflow-x-auto flex items-center gap-1 no-scrollbar">
          {roleNavItems.map((item) => {
            const isActive = activeRole === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveRole(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
