import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Gauge, 
  FileText, 
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useTenantAuth } from '../context/TenantAuthContext';
import { TENANT_TELEMETRY, RECENT_TRACES } from '../data/multiTenantData';
import { TraceRecord, TraceSpan } from '../types';

export const MonitoringObservability: React.FC = () => {
  const { activeTenant } = useTenantAuth();
  const [telemetryView, setTelemetryView] = useState<'latency' | 'qps' | 'cache' | 'tokens'>('latency');
  const [selectedTraceId, setSelectedTraceId] = useState<string>(RECENT_TRACES[0].traceId);
  const [selectedSpan, setSelectedSpan] = useState<TraceSpan | null>(RECENT_TRACES[0].spans[2]);

  const telemetryData = TENANT_TELEMETRY[activeTenant.id] || TENANT_TELEMETRY['tenant_mayo_health'];
  const traces = RECENT_TRACES.filter(t => t.tenantId === activeTenant.id || t.tenantId === 'tenant_mayo_health');
  const currentTrace = RECENT_TRACES.find(t => t.traceId === selectedTraceId) || RECENT_TRACES[0];

  const latestPoint = telemetryData[telemetryData.length - 1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Activity className="w-3.5 h-3.5" />
              Prometheus & OpenTelemetry (OTel)
            </span>
            <span className="text-xs text-slate-500">
              Live Production SLA & Distributed Tracing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Observability, Telemetry & Traces</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Monitor real-time QPS throughput, P99 tail latency SLAs, L1/L2 cache hit ratios, and explore end-to-end 
            distributed trace spans across the multi-agent RAG pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-mono shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Prometheus Exporter: Active (:9090)</span>
        </div>
      </div>

      {/* Production Telemetry KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Ingress QPS</span>
            <Gauge className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {latestPoint?.qps} <span className="text-xs font-normal text-slate-500">req/s</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>&#8593; 14% vs avg</span>
            <span className="text-slate-400">· Cap: {activeTenant.qpsLimit}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>P99 Tail Latency</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {latestPoint?.p99Ms} <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            SLA Target: &lt;750ms <span className="text-emerald-600 font-bold">(Within SLA)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>L1/L2 Cache Hit Rate</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {latestPoint?.cacheHitRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            In-Memory LRU + Redis cluster
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Circuit Breaker</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            CLOSED
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Error rate: {latestPoint?.errorRate}% (Budget: 99.98%)
          </div>
        </div>
      </div>

      {/* Recharts Live Telemetry Stream */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Real-Time Metric Telemetry ({activeTenant.name})</span>
            </h3>
            <p className="text-xs text-slate-500">10-minute rolling sample window</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'latency', label: 'Latency (P50/P95/P99)' },
              { id: 'qps', label: 'QPS Throughput' },
              { id: 'tokens', label: 'Tokens/Sec' },
              { id: 'cache', label: 'Cache Hit %' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTelemetryView(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  telemetryView === tab.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {telemetryView === 'latency' ? (
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="p99Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="ms" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="p99Ms" name="P99 Latency (ms)" stroke="#ef4444" strokeWidth={2} fill="url(#p99Grad)" />
                <Area type="monotone" dataKey="p95Ms" name="P95 Latency (ms)" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="p50Ms" name="P50 Latency (ms)" stroke="#6366f1" strokeWidth={2} fill="url(#p50Grad)" />
              </AreaChart>
            ) : telemetryView === 'qps' ? (
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="qpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" req/s" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="qps" name="Ingress Rate (req/s)" stroke="#0284c7" strokeWidth={2.5} fill="url(#qpsGrad)" />
              </AreaChart>
            ) : telemetryView === 'tokens' ? (
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" tok/s" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="tokensPerSec" name="Tokens Generated (tok/s)" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#tokenGrad)" />
              </AreaChart>
            ) : (
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cacheGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cacheHitRate" name="Cache Hit Ratio (%)" stroke="#10b981" strokeWidth={2.5} fill="url(#cacheGrad)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* OpenTelemetry Distributed Tracing Explorer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>OpenTelemetry Distributed Tracing Explorer</span>
            </h3>
            <p className="text-xs text-slate-500">
              End-to-end request waterfall showing span latencies, service tags & quarantine enforcement
            </p>
          </div>

          {/* Trace Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {RECENT_TRACES.map(t => (
              <button
                key={t.traceId}
                onClick={() => {
                  setSelectedTraceId(t.traceId);
                  setSelectedSpan(t.spans[0]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedTraceId === t.traceId
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${t.status === 'ok' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span>{t.traceId}</span>
                <span className="text-[10px] opacity-70">({t.totalDurationMs}ms)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Trace Summary */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Query Target</span>
            <div className="font-medium text-slate-800 text-sm mt-0.5">"{currentTrace.query}"</div>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Correlation ID</span>
              <span className="text-slate-700 font-bold">{currentTrace.correlationId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Total Duration</span>
              <span className="text-indigo-600 font-bold">{currentTrace.totalDurationMs} ms</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Status</span>
              <span className={`font-bold uppercase ${currentTrace.status === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currentTrace.status}
              </span>
            </div>
          </div>
        </div>

        {/* Waterfall Span Flame Graph & Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flame Graph (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Span Execution Timeline
            </span>

            <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
              {currentTrace.spans.map((span) => {
                const isSelected = selectedSpan?.spanId === span.spanId;
                const startPct = (span.startTime / currentTrace.totalDurationMs) * 100;
                const widthPct = Math.max(8, (span.durationMs / currentTrace.totalDurationMs) * 100);

                return (
                  <div 
                    key={span.spanId}
                    onClick={() => setSelectedSpan(span)}
                    className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/30' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          span.status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        <span>{span.name}</span>
                        <span className="text-slate-400 text-[10px] font-normal font-sans">({span.service})</span>
                      </span>
                      <span className="text-slate-600 font-semibold">{span.durationMs} ms</span>
                    </div>

                    {/* Timeline bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          span.status === 'quarantined' 
                            ? 'bg-rose-500' 
                            : span.service.includes('gemini')
                              ? 'bg-purple-500'
                              : span.service.includes('vector')
                                ? 'bg-emerald-500'
                                : 'bg-indigo-600'
                        }`}
                        style={{
                          marginLeft: `${startPct}%`,
                          width: `${widthPct}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Span Attribute Inspector (1 Col) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Span Attributes Inspector
            </span>

            {selectedSpan ? (
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-3 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-400">{selectedSpan.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedSpan.status === 'ok' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {selectedSpan.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-slate-400">Span ID: <span className="text-slate-200">{selectedSpan.spanId}</span></div>
                  <div className="text-slate-400">Service: <span className="text-cyan-300">{selectedSpan.service}</span></div>
                  <div className="text-slate-400">Duration: <span className="text-amber-300">{selectedSpan.durationMs} ms</span></div>
                  <div className="text-slate-400">Start Offset: <span className="text-slate-300">+{selectedSpan.startTime} ms</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Attributes (Tags)
                  </span>
                  <pre className="text-[11px] text-emerald-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedSpan.attributes, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                Click on any span to inspect its OpenTelemetry metadata
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
