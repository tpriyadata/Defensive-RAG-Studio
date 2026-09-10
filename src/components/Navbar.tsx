import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Workflow, 
  Sliders, 
  Layers, 
  FileCode2, 
  CloudLightning,
  Activity,
  CheckCircle2,
  BarChart3,
  Building2,
  KeyRound,
  CreditCard,
  ChevronDown,
  Lock,
  UserCheck
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiHealthy: boolean;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  apiHealthy,
  isProcessing
}) => {
  const { tenants, activeTenant, currentUser, switchTenant } = useTenantAuth();
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);

  const navItems = [
    { id: 'simulator', label: 'Live Agent Pipeline', icon: Workflow, badge: 'Interactive' },
    { id: 'tenants', label: 'Workspaces & Multi-Tenant', icon: Building2, badge: 'Isolated' },
    { id: 'auth', label: 'Auth & RBAC', icon: KeyRound, badge: 'IAM' },
    { id: 'monitoring', label: 'Observability & OTel', icon: Activity, badge: 'Prometheus' },
    { id: 'billing', label: 'Usage & Billing', icon: CreditCard, badge: 'Stripe' },
    { id: 'metrics', label: 'Grounding & Metrics', icon: BarChart3, badge: 'Recharts' },
    { id: 'architecture', label: 'Architecture Blueprint', icon: Layers },
    { id: 'configs', label: 'Services & Parameters', icon: Sliders },
    { id: 'libraries', label: 'Recommended Stack', icon: Cpu },
    { id: 'scaffold', label: 'Code Scaffolding', icon: FileCode2, badge: 'Pydantic v2' },
    { id: 'infra', label: 'ALB & Auto-Scaling', icon: CloudLightning },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Defensive RAG Studio
                </span>
                <span className="text-[11px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Multi-Tenant · RBAC · HA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Worst-Case Fault Tolerance, OTel Telemetry & Metered Billing
              </p>
            </div>
          </div>

          {/* Right Top Bar: Tenant Switcher, Persona & Health Status */}
          <div className="flex items-center gap-3">
            {/* Active Tenant Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold transition-all shadow-xs"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: activeTenant.primaryColor }}
                />
                <span className="text-slate-200 max-w-[130px] truncate">{activeTenant.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isTenantDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Workspace Tenant
                  </div>
                  <div className="space-y-1 mt-1">
                    {tenants.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          setIsTenantDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                          t.id === activeTenant.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <span className="truncate">{t.name}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-mono shrink-0 ml-1">
                          {t.tier === 'enterprise_healthcare' ? 'HIPAA' : t.tier === 'pro' ? 'Pro' : 'Dev'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-800 px-2 pb-1">
                    <button
                      onClick={() => {
                        setActiveTab('tenants');
                        setIsTenantDropdownOpen(false);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 w-full text-center block py-1 font-semibold"
                    >
                      Manage All Workspaces &#8594;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Persona Chip */}
            <div 
              onClick={() => setActiveTab('auth')}
              className="hidden md:flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1 text-xs cursor-pointer transition-colors"
              title="Click to view Auth & RBAC Settings"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-slate-300 font-medium text-[11px] max-w-[110px] truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                {currentUser.role === 'ORG_ADMIN' ? 'Admin' : currentUser.role === 'CLINICAL_REVIEWER' ? 'Clinical' : 'Ops'}
              </span>
            </div>

            {/* Health & Status Indicator */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  apiHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {apiHealthy ? 'ALB Healthy' : 'Standalone'}
              </span>
              {isProcessing && (
                <div className="flex items-center gap-1 text-cyan-400 border-l border-slate-700 pl-2">
                  <Activity className="w-3 h-3 animate-spin" />
                  <span className="text-[10px]">Processing</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-150 text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
