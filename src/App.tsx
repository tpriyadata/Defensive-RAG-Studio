import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineSimulator } from './components/PipelineSimulator';
import { GroundingMetricsDashboard } from './components/GroundingMetricsDashboard';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { ConfigParametersView } from './components/ConfigParametersView';
import { LibrariesMatrix } from './components/LibrariesMatrix';
import { CodeScaffoldView } from './components/CodeScaffoldView';
import { InfraAndScalingView } from './components/InfraAndScalingView';
import { MultiTenantWorkspace } from './components/MultiTenantWorkspace';
import { AuthRbacControl } from './components/AuthRbacControl';
import { MonitoringObservability } from './components/MonitoringObservability';
import { BillingUsageDashboard } from './components/BillingUsageDashboard';
import { TenantAuthProvider } from './context/TenantAuthContext';
import { ShieldCheck, Server, Zap, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [apiHealthy, setApiHealthy] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    // Check backend health on mount
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') {
          setApiHealthy(true);
        }
      })
      .catch(() => {
        // Degraded mode / fallback
        setApiHealthy(false);
      });
  }, []);

  return (
    <TenantAuthProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          apiHealthy={apiHealthy}
          isProcessing={isProcessing}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'simulator' && (
            <PipelineSimulator onNavigateToMetrics={() => setActiveTab('metrics')} />
          )}
          {activeTab === 'tenants' && <MultiTenantWorkspace />}
          {activeTab === 'auth' && <AuthRbacControl />}
          {activeTab === 'monitoring' && <MonitoringObservability />}
          {activeTab === 'billing' && <BillingUsageDashboard />}
          {activeTab === 'metrics' && <GroundingMetricsDashboard />}
          {activeTab === 'architecture' && <ArchitectureDiagram />}
          {activeTab === 'configs' && <ConfigParametersView />}
          {activeTab === 'libraries' && <LibrariesMatrix />}
          {activeTab === 'scaffold' && <CodeScaffoldView />}
          {activeTab === 'infra' && <InfraAndScalingView />}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800/80 text-slate-400 text-xs py-6 mt-12 transition-all">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                DR
              </div>
              <span className="font-semibold text-slate-200 tracking-tight">
                Defensive Multi-Agent RAG Studio
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 text-[11px]">
                Multi-Tenant Isolation · RBAC & Scoped Tokens · Prometheus & OTel Telemetry · Stripe Metered Invoicing
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Rate Limiter: Virtual Queue Active
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                P99 SLA: &lt;650ms
              </span>
            </div>
          </div>
        </footer>
      </div>
    </TenantAuthProvider>
  );
}
