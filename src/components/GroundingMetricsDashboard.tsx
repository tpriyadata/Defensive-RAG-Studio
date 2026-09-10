import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Clock,
  Filter,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Activity,
  Layers,
  FileCheck,
  ChevronRight,
  Database,
  Search,
} from 'lucide-react';
import {
  HISTORICAL_METRIC_SERIES,
  HALLUCINATION_CATEGORIES,
  RADAR_PERFORMANCE_METRICS,
  RECENT_BENCHMARK_RUNS,
} from '../data/metricsData';
import { PipelineBenchmarkRun, GroundingMetricDataPoint } from '../types';

export const GroundingMetricsDashboard: React.FC = () => {
  // Filter States
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [metricViewMode, setMetricViewMode] = useState<'both' | 'faithfulness' | 'grounding' | 'hallucination'>('both');
  const [metricSeries, setMetricSeries] = useState<GroundingMetricDataPoint[]>(HISTORICAL_METRIC_SERIES);
  const [benchmarkRuns, setBenchmarkRuns] = useState<PipelineBenchmarkRun[]>(RECENT_BENCHMARK_RUNS);
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered metric series based on domain
  const filteredSeries = useMemo(() => {
    if (selectedDomain === 'all') return metricSeries;
    return metricSeries.filter(
      (item) => item.workload === selectedDomain || item.workload === 'mixed'
    );
  }, [metricSeries, selectedDomain]);

  // Current latest metrics
  const latestMetric = metricSeries[metricSeries.length - 1];
  const initialMetric = metricSeries[0];

  const faithfulnessImprovement = (latestMetric.faithfulnessScore - initialMetric.faithfulnessScore).toFixed(1);
  const groundingImprovement = (latestMetric.groundingScore - initialMetric.groundingScore).toFixed(1);
  const hallucinationReduction = (initialMetric.hallucinationRate - latestMetric.hallucinationRate).toFixed(1);
  const latencyReduction = (initialMetric.p99LatencyMs - latestMetric.p99LatencyMs);

  // Simulate a new benchmark run
  const handleSimulateNewRun = () => {
    setIsSimulatingRun(true);
    setTimeout(() => {
      const runId = `run-bmk-${Math.floor(8500 + Math.random() * 500)}`;
      const newFaithfulness = parseFloat((99.3 + Math.random() * 0.6).toFixed(1));
      const newScore = parseFloat((99.1 + Math.random() * 0.8).toFixed(1));
      const newHallucination = parseFloat((0.2 + Math.random() * 0.4).toFixed(1));
      const newLatency = Math.floor(580 + Math.random() * 80);

      const newRun: PipelineBenchmarkRun = {
        id: runId,
        timestamp: 'Just now',
        query: 'Clinical endpoint analysis across SGLT2i and GLP-1 RA trials (DAPA-HF & FLOW).',
        category: 'Healthcare Clinical',
        groundingScore: newScore,
        faithfulnessScore: newFaithfulness,
        hallucinationScore: newHallucination,
        p99LatencyMs: newLatency,
        mode: 'Healthcare Zero-Tolerance',
        documentsGrounded: 4,
        status: 'passed',
      };

      setBenchmarkRuns((prev) => [newRun, ...prev]);

      // Also update latest historical series data point
      setMetricSeries((prev) => {
        const copy = [...prev];
        const last = { ...copy[copy.length - 1] };
        last.runCount += 150;
        last.faithfulnessScore = Math.max(last.faithfulnessScore, newFaithfulness);
        last.groundingScore = Math.max(last.groundingScore, newScore);
        last.hallucinationRate = Math.min(last.hallucinationRate, newHallucination);
        copy[copy.length - 1] = last;
        return copy;
      });

      setIsSimulatingRun(false);
      setSimulatedNotice(`Logged new benchmark run (${runId}) with ${newFaithfulness}% Faithfulness, ${newScore}% Grounding, and ${newHallucination}% Hallucination.`);
      setTimeout(() => setSimulatedNotice(null), 4000);
    }, 600);
  };

  // Filtered runs
  const filteredRuns = useMemo(() => {
    if (!searchQuery.trim()) return benchmarkRuns;
    const q = searchQuery.toLowerCase();
    return benchmarkRuns.filter(
      (r) =>
        r.query.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.mode.toLowerCase().includes(q)
    );
  }, [benchmarkRuns, searchQuery]);

  // Custom Recharts Tooltip
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as GroundingMetricDataPoint;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-100 font-sans min-w-[210px]">
          <div className="font-bold text-white mb-1 flex items-center justify-between">
            <span>{data.version}</span>
            <span className="text-[10px] text-slate-400">{data.date}</span>
          </div>
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <div className="flex justify-between items-center text-indigo-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Faithfulness Score:
              </span>
              <span className="font-bold font-mono">{data.faithfulnessScore}%</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Grounding Score:
              </span>
              <span className="font-bold font-mono">{data.groundingScore}%</span>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Hallucination Rate:
              </span>
              <span className="font-bold font-mono">{data.hallucinationRate}%</span>
            </div>
            <div className="flex justify-between items-center text-cyan-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                P99 Latency:
              </span>
              <span className="font-mono">{data.p99LatencyMs} ms</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1">
              <span>Verified Inferences:</span>
              <span className="font-mono text-slate-300">{data.runCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Continuous Telemetry
              </span>
              <span className="text-xs text-slate-500">
                Faithfulness Verification · Pydantic v2 Schema · Multi-Agent NLI Guard
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Grounding & Faithfulness Metrics Dashboard</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Track quantitative performance improvements over pipeline version iterations. Monitor how strict schema validation, 
              entailment verification, RRF hybrid retrieval, and multi-agent cross-verification systematically elevate Faithfulness to 99.5% and eliminate clinical hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={handleSimulateNewRun}
              disabled={isSimulatingRun}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingRun ? 'animate-spin' : ''}`} />
              <span>{isSimulatingRun ? 'Simulating Run...' : 'Simulate Benchmark Run'}</span>
            </button>
          </div>
        </div>

        {simulatedNotice && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{simulatedNotice}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Faithfulness Score (Lead Metric) */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white shadow-sm ring-1 ring-indigo-500/10">
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Faithfulness Score
            </span>
            <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
              Ragas
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-950 font-mono">
              {latestMetric.faithfulnessScore}%
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{faithfulnessImprovement}%
            </span>
          </div>
          <p className="text-xs text-indigo-900/70 mt-2">
            Entailed claims ratio: (Verified / Total Claims) &times; (1 - Hallucination Rate).
          </p>
        </div>

        {/* Card 2: Grounding Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Grounding Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {latestMetric.groundingScore}%
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{groundingImprovement}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Zero-Tolerance Healthcare mode active (NLI citation verification).
          </p>
        </div>

        {/* Card 3: Hallucination Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hallucination Rate</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {latestMetric.hallucinationRate}%
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              -{hallucinationReduction}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Reduced from 27.6% (Naive RAG) down to 0.4%.
          </p>
        </div>

        {/* Card 4: Citation Precision */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Citation Precision</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {latestMetric.citationPrecision}%
            </span>
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              <Award className="w-3 h-3 mr-0.5" />
              Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            100% verified PMID, NCT, and DOI reference attribution.
          </p>
        </div>

        {/* Card 5: P99 Latency */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">P99 SLA Latency</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {latestMetric.p99LatencyMs} ms
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              -{latencyReduction}ms
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Target SLA &lt;850ms guaranteed via volatile-lfu Redis caching.
          </p>
        </div>
      </div>

      {/* Faithfulness Mathematical Formulation Ribbon */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm border border-indigo-500/30">
              S<sub>faith</sub>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  RAG Triad Mathematical Metric: Faithfulness Score Formula
                </span>
                <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded font-mono border border-indigo-700/50">
                  Strict Entailment
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates factual consistency: Every individual propositional claim generated in the LLM response must be logically inferred from retrieved context.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-3 shrink-0">
            <span className="text-indigo-400 font-bold">Faithfulness Score =</span>
            <span>(|Verified Entailed Claims| &divide; |Total Claims|) &times; (1 &minus; Hallucination Rate)</span>
          </div>
        </div>
      </div>

      {/* Main Chart: Performance Over Time (Recharts Area/Line Chart) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Grounding Score vs. Hallucination Rate Over Time
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical progression across pipeline architecture iterations (v1.0 Naive to v2.5 Zero-Tolerance).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMetricViewMode('both')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metricViewMode === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setMetricViewMode('faithfulness')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metricViewMode === 'faithfulness' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Faithfulness Only
              </button>
              <button
                onClick={() => setMetricViewMode('grounding')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metricViewMode === 'grounding' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Grounding Only
              </button>
              <button
                onClick={() => setMetricViewMode('hallucination')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metricViewMode === 'hallucination' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Hallucination Only
              </button>
            </div>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Workload Domains</option>
              <option value="healthcare">Healthcare & Clinical Trials</option>
              <option value="mixed">Mixed Benchmark Suite</option>
            </select>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="faithfulnessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="groundingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="hallucinationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="version"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                unit="%"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />

              {(metricViewMode === 'both' || metricViewMode === 'faithfulness') && (
                <Area
                  type="monotone"
                  dataKey="faithfulnessScore"
                  name="Faithfulness Score (%)"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#faithfulnessGradient)"
                />
              )}

              {(metricViewMode === 'both' || metricViewMode === 'grounding') && (
                <Area
                  type="monotone"
                  dataKey="groundingScore"
                  name="Grounding Score (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#groundingGradient)"
                />
              )}

              {(metricViewMode === 'both' || metricViewMode === 'hallucination') && (
                <Area
                  type="monotone"
                  dataKey="hallucinationRate"
                  name="Hallucination Rate (%)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hallucinationGradient)"
                />
              )}

              {metricViewMode === 'both' && (
                <Line
                  type="monotone"
                  dataKey="citationPrecision"
                  name="Citation Precision (%)"
                  stroke="#3b82f6"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Peak Faithfulness: 99.5%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Peak Grounding: 99.4%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Trough Hallucination: 0.4%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Total Verified Inferences: 33,260
            </span>
          </div>
          <span className="text-slate-400">Target baseline: 0% hallucinations on clinical endpoints</span>
        </div>
      </div>

      {/* Two Column Grid: Error Category Reduction & Multi-Dimensional Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Hallucination Breakdown by Category (Recharts Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hallucination Reduction by Category
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison: Baseline Naive RAG vs. Defensive Multi-Agent RAG (Error frequency per 10k queries).
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                &gt;95% Reduction
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={HALLUCINATION_CATEGORIES}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={140}
                    tick={{ fontSize: 10, fill: '#334155' }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      `${value} incidents`,
                      name === 'baselineErrors' ? 'Baseline RAG' : 'Defensive RAG',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                  />
                  <Bar dataKey="baselineErrors" name="Baseline Errors" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="defensiveErrors" name="Defensive Errors" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            {HALLUCINATION_CATEGORIES.slice(0, 3).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate mr-2 font-medium">{cat.category}</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                  -{cat.reductionPercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 6-Dimensional Radar Chart (Recharts RadarChart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  6-Dimensional Defense Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Holistic capability benchmark against enterprise healthcare requirements.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                Radar Matrix
              </span>
            </div>

            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="75%" data={RADAR_PERFORMANCE_METRICS}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Radar
                    name="Baseline RAG"
                    dataKey="baselineRag"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Defensive Multi-Agent"
                    dataKey="defensiveRag"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Healthcare Zero-Tolerance"
                    dataKey="healthcareMode"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Critical Metric: <strong>Numerical Faithfulness (99/100)</strong></span>
            <span className="font-mono text-emerald-600 font-semibold">Zero Dosages Inverted</span>
          </div>
        </div>
      </div>

      {/* Recent Pipeline Benchmark Runs Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Verified Pipeline Inferences & Benchmark Runs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live log of evaluated clinical and system prompts with real-time grounding scores.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queries, PMID, or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Run ID</th>
                <th className="py-2.5 px-3">Benchmark Query</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Faithfulness</th>
                <th className="py-2.5 px-3">Grounding</th>
                <th className="py-2.5 px-3">Hallucination</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Pipeline Mode</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-blue-600">{run.id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate" title={run.query}>
                    {run.query}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{run.category}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                    {run.faithfulnessScore ? `${run.faithfulnessScore}%` : `${(100 - run.hallucinationScore).toFixed(1)}%`}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                    {run.groundingScore}%
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-500">
                    {run.hallucinationScore}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{run.p99LatencyMs}ms</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {run.mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        run.status === 'passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : run.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
