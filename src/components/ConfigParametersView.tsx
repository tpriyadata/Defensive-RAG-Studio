import React, { useState } from 'react';
import { Sliders, Filter, CheckCircle2, ShieldAlert, Cpu, Database, Zap, BookOpen } from 'lucide-react';
import { SERVICE_CONFIGS } from '../data/architecturalData';

export const ConfigParametersView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'API & Ingress',
    'Caching',
    'Message Queue & Workers',
    'Vector Store',
    'LLM & Resilience',
    'Observability',
  ];

  const filteredConfigs = selectedCategory === 'ALL'
    ? SERVICE_CONFIGS
    : SERVICE_CONFIGS.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                Production Hardening
              </span>
              <span className="text-xs text-slate-500">
                Battle-Tested Tuning for Low Latency & Worst-Case Reliability
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Services & Production Configuration Parameters
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Exact configuration parameters required to guarantee sub-second P99 latencies, 
              prevent cache stampedes, isolate poison payloads, and maintain zero-downtime elasticity.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 self-center mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Step-by-Step Build Order Guide */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-slate-800 text-white shadow-lg">
        <h2 className="text-base font-bold tracking-tight mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Step-by-Step Architecture Implementation Sequence</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="font-mono text-cyan-400 font-bold">STEP 01: Contracts & Ingress</span>
            <p className="text-slate-300">
              Declare strict Pydantic v2 schemas (<code className="text-cyan-300">extra="forbid"</code>, regex bounds). Configure FastAPI edge with correlation ID propagation and 65s keep-alive.
            </p>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="font-mono text-cyan-400 font-bold">STEP 02: Caching & Event Queue</span>
            <p className="text-slate-300">
              Spin up Redis Cluster with <code className="text-cyan-300">volatile-lfu</code> eviction. Setup Kafka / RabbitMQ with <code className="text-cyan-300">prefetch_count=1</code> and Dead-Letter Queue.
            </p>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="font-mono text-cyan-400 font-bold">STEP 03: Multi-Agent DAG & Fallbacks</span>
            <p className="text-slate-300">
              Wire Retrieval, Validation, Hallucination, and Synthesis agents. Wrap LLM calls with PyBreaker circuit breakers and deterministic extractive fallbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="space-y-6">
        {filteredConfigs.map((service, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {service.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Latency: <strong className="text-slate-700">{service.latencyImpact}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{service.serviceName}</h3>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Recommended Engine:</div>
                <div className="text-sm font-semibold text-indigo-700 font-mono">{service.recommendedTool}</div>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {service.role}
            </p>

            {/* Critical Parameters Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 font-mono">Configuration Parameter</th>
                    <th className="py-2.5 px-3.5 font-mono">Default</th>
                    <th className="py-2.5 px-3.5 font-mono text-blue-700">Production Value</th>
                    <th className="py-2.5 px-3.5">Engineering Rationale & Defense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {service.criticalParameters.map((p, pIdx) => (
                    <tr key={pIdx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800">
                        {p.param}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-500">
                        {p.defaultValue}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-700 bg-indigo-50/30">
                        {p.productionValue}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 leading-relaxed">
                        {p.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Defensive Strategy Box */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-900">Worst-Case Failure Defense: </strong>
                <span>{service.defensiveStrategy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
