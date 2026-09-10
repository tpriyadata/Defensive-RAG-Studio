import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Lock, 
  Server, 
  RefreshCw,
  GitPullRequest,
  CheckCircle2,
  Info
} from 'lucide-react';

interface NodeDetail {
  id: string;
  title: string;
  category: string;
  role: string;
  latency: string;
  failover: string;
  criticalConfig: string[];
}

const NODES_DATA: Record<string, NodeDetail> = {
  client: {
    id: 'client',
    title: 'Client / Web Consumer',
    category: 'Ingress Point',
    role: 'Issues summarization queries, provides optional tenant ID, listens for streamed server-sent events (SSE) or webhook responses.',
    latency: 'User network bound',
    failover: 'Client-side retry with exponential backoff and idempotency keys.',
    criticalConfig: ['Payload limit: 2MB', 'Timeout: 10s', 'Keep-Alive: Enabled'],
  },
  alb: {
    id: 'alb',
    title: 'Application Load Balancer (ALB)',
    category: 'Edge Infrastructure',
    role: 'Terminates TLS 1.3, distributes traffic across 3 Availability Zones, enforces AWS WAF rate-limiting, and tracks health checks.',
    latency: '< 5ms',
    failover: 'Cross-zone load balancing automatically bypasses degraded AZ nodes within 10 seconds.',
    criticalConfig: [
      'Deregistration Delay: 30s',
      'HealthCheckPath: /api/health',
      'Idle Timeout: 60s',
      'Cross-Zone: Enabled',
    ],
  },
  fastapi: {
    id: 'fastapi',
    title: 'FastAPI Ingress & Schema Guard',
    category: 'API Tier',
    role: 'Injects X-Correlation-ID, validates request schemas strictly via Pydantic v2 (extra="forbid"), checks Redis exact cache, and dispatches async tasks.',
    latency: '8ms - 15ms',
    failover: 'Stateless API replicas auto-scaled by ASG; zero shared state in memory.',
    criticalConfig: [
      'Workers: (2 * vCPU) + 1',
      'Uvicorn Keepalive: 65s',
      'Pydantic: strict=True',
    ],
  },
  eventbus: {
    id: 'eventbus',
    title: 'Asynchronous Event Bus (Kafka / RabbitMQ)',
    category: 'Decoupling & Concurrency',
    role: 'Buffers incoming summarization requests to prevent worker overload during traffic spikes; routes unprocessable tasks to Dead Letter Queue (DLQ).',
    latency: '< 10ms queuing',
    failover: 'Broker clustering with replication factor 3; idempotent consumer acknowledgments.',
    criticalConfig: [
      'prefetch_count: 1',
      'task_acks_late: True',
      'DLQ Max Retries: 3',
    ],
  },
  workers: {
    id: 'workers',
    title: 'Celery / Temporal Agent Worker Pool',
    category: 'Compute & Orchestration',
    role: 'Orchestrates the multi-agent DAG: Retrieval Agent -> Validation Agent -> Synthesis Agent -> Hallucination Agent.',
    latency: 'Concurrent parallel execution',
    failover: 'Workers report heartbeat every 10s. If a worker crashes mid-synthesis, task is reassigned to another node.',
    criticalConfig: [
      'worker_concurrency: vCPU count',
      'task_time_limit: soft 15s / hard 20s',
      'ASG Scaling: Based on queue backlog',
    ],
  },
  redis: {
    id: 'redis',
    title: 'Distributed Multi-Tier Cache (Redis)',
    category: 'In-Memory State',
    role: 'Tier 1: Exact query hash cache (SHA-256). Tier 2: Intermediate retrieval & verification cache to eliminate redundant LLM calls.',
    latency: '< 2ms',
    failover: 'Multi-AZ Redis Cluster with automatic Sentinel failover and 2 read replicas.',
    criticalConfig: [
      'maxmemory-policy: volatile-lfu',
      'TTL: 3600s with +/-10% jitter',
      'Socket Timeout: 150ms (fast-fail)',
    ],
  },
  vectordb: {
    id: 'vectordb',
    title: 'Hybrid Vector DB (Qdrant / Milvus)',
    category: 'Knowledge Retrieval',
    role: 'Executes dense HNSW vector similarity search and sparse BM25 keyword matching fused via Reciprocal Rank Fusion (RRF).',
    latency: '15ms - 35ms',
    failover: 'Clustered shards with replication factor 2. Fallback to local lexical keyword search if vector search times out (>1200ms).',
    criticalConfig: [
      'hnsw_ef_search: 64',
      'hnsw_m: 32',
      'Quantization: Scalar int8',
      'Timeout: 1200ms SLA',
    ],
  },
  llmgateway: {
    id: 'llmgateway',
    title: 'LLM Gateway & Circuit Breaker',
    category: 'Synthesis & Generation',
    role: 'Routes prompt to Gemini / provider models with PyBreaker circuit breaking, token budgeting, and automatic extractive fallback on failure.',
    latency: '200ms - 800ms',
    failover: 'Circuit breaker trips after 5 failures in 30s. Automatically falls back to deterministic extractive summarizer (<15ms).',
    criticalConfig: [
      'PyBreaker Threshold: 5 fails',
      'Recovery Timeout: 30s',
      'Max Output Tokens: 512',
      'Retry: Exponential with Full Jitter',
    ],
  },
  hallucination: {
    id: 'hallucination',
    title: 'Hallucination & Entailment Agent',
    category: 'Quality & Safety',
    role: 'Verifies factual claims in candidate summary against retrieved chunks; validates citations; quarantines summaries with hallucination score > 0.20.',
    latency: '60ms - 120ms',
    failover: 'If entailment verification fails, the ungrounded output is discarded and replaced with verified source excerpts.',
    criticalConfig: [
      'Faithfulness Threshold: >= 0.80',
      'Citation Requirement: Strict chunk IDs',
      'Quarantine Policy: Extractive replacement',
    ],
  },
  asg: {
    id: 'asg',
    title: 'Auto-Scaling Group (ASG) Fleet',
    category: 'Elastic Infrastructure',
    role: 'Scales EC2 / container instances across 3 AZs based on ALB request rate and message queue depth; mixes On-Demand baseline with Spot instances.',
    latency: 'Elastic elasticity',
    failover: 'Spot termination notice handler gives 120s graceful draining window before node decommission.',
    criticalConfig: [
      'Min / Max / Desired: 3 / 30 / 6',
      'Target Tracking: 600 req/target/min',
      'Step Scaling: Queue depth > 50',
      'Mixed Instances: 30% On-Demand / 70% Spot',
    ],
  },
};

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('alb');

  const currentNode = NODES_DATA[selectedNode] || NODES_DATA['alb'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                Event-Driven & Asynchronous
              </span>
              <span className="text-xs text-slate-500">
                P99 Target &lt; 850ms · Zero-Downtime HA
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cloud-Native Defensive Architecture Blueprint
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Interactive structural map of the end-to-end multi-agent pipeline. 
              Click on any component node to inspect its operational role, defensive failure isolation, and tuning parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flow Canvas */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl overflow-x-auto text-white">
        <div className="min-w-[900px] space-y-6">
          {/* Layer 1: Ingress & Edge */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Tier 1: Edge Ingress, SSL & Load Balancing</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedNode('client')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'client'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>CLIENT</span>
                  <span className="text-emerald-400">&lt;2MB</span>
                </div>
                <div className="font-bold text-white text-sm">Client / Web Consumer</div>
                <div className="text-xs text-slate-400 mt-1">HTTPS REST / SSE Stream</div>
              </button>

              <button
                onClick={() => setSelectedNode('alb')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'alb'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>EDGE PROXY</span>
                  <span className="text-cyan-400">AWS ALB</span>
                </div>
                <div className="font-bold text-white text-sm">Application Load Balancer</div>
                <div className="text-xs text-slate-400 mt-1">Multi-AZ · Health Check /api/health</div>
              </button>

              <button
                onClick={() => setSelectedNode('fastapi')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'fastapi'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>API INGRESS</span>
                  <span className="text-indigo-400">FastAPI</span>
                </div>
                <div className="font-bold text-white text-sm">FastAPI & Schema Guard</div>
                <div className="text-xs text-slate-400 mt-1">Pydantic v2 · Correlation ID</div>
              </button>
            </div>
          </div>

          {/* Connective Indicator */}
          <div className="flex justify-around text-slate-600 text-xs font-mono">
            <span>&#8595; TLS Termination</span>
            <span>&#8595; Correlation Tracing</span>
            <span>&#8595; Async Enqueue</span>
          </div>

          {/* Layer 2: Decoupled Message Bus & Distributed Cache */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Tier 2: Asynchronous Event Bus & Distributed Caching</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedNode('redis')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'redis'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>CACHE LAYER</span>
                  <span className="text-emerald-400">&lt;2ms</span>
                </div>
                <div className="font-bold text-white text-sm">Redis Cluster (volatile-lfu)</div>
                <div className="text-xs text-slate-400 mt-1">Tier 1 Exact Hash + Tier 2 Chunk Cache</div>
              </button>

              <button
                onClick={() => setSelectedNode('eventbus')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'eventbus'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>MESSAGE BUS</span>
                  <span className="text-amber-400">Kafka / Celery</span>
                </div>
                <div className="font-bold text-white text-sm">Asynchronous Queue & DLQ</div>
                <div className="text-xs text-slate-400 mt-1">prefetch_count=1 · Poison Message Quarantine</div>
              </button>

              <button
                onClick={() => setSelectedNode('asg')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'asg'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>AUTOSCALING</span>
                  <span className="text-purple-400">AWS ASG</span>
                </div>
                <div className="font-bold text-white text-sm">Auto-Scaling Fleet (Spot+OnDemand)</div>
                <div className="text-xs text-slate-400 mt-1">Target Tracking on ALB + SQS Backlog</div>
              </button>
            </div>
          </div>

          {/* Connective Indicator */}
          <div className="flex justify-around text-slate-600 text-xs font-mono">
            <span>&#8595; Fast-Path Cache Return</span>
            <span>&#8595; Parallel Worker Dispatch</span>
            <span>&#8595; Scale In/Out Triggers</span>
          </div>

          {/* Layer 3: Agentic Execution DAG */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>Tier 3: Multi-Agent Execution & Defensive Validation</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedNode('vectordb')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'vectordb'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>AGENT 1</span>
                  <span className="text-cyan-400">&lt;25ms</span>
                </div>
                <div className="font-bold text-white text-sm">Retrieval Agent</div>
                <div className="text-xs text-slate-400 mt-1">Qdrant HNSW + BM25 Reciprocal Rank Fusion</div>
              </button>

              <button
                onClick={() => setSelectedNode('workers')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'workers'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>AGENT 2</span>
                  <span className="text-emerald-400">Pydantic v2</span>
                </div>
                <div className="font-bold text-white text-sm">Validation Agent</div>
                <div className="text-xs text-slate-400 mt-1">Checksum Verify · Reliability Filter · Sanitizer</div>
              </button>

              <button
                onClick={() => setSelectedNode('llmgateway')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'llmgateway'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>AGENT 3</span>
                  <span className="text-indigo-400">LLM Gateway</span>
                </div>
                <div className="font-bold text-white text-sm">Synthesis Agent</div>
                <div className="text-xs text-slate-400 mt-1">PyBreaker · Citations · Extractive Fallback</div>
              </button>

              <button
                onClick={() => setSelectedNode('hallucination')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNode === 'hallucination'
                    ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>AGENT 4</span>
                  <span className="text-purple-400">Safety Guard</span>
                </div>
                <div className="font-bold text-white text-sm">Hallucination Agent</div>
                <div className="text-xs text-slate-400 mt-1">Faithfulness Check (&ge;80%) · Quarantine</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Deep-Dive Inspection Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                {currentNode.category}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{currentNode.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              Latency Target: <strong>{currentNode.latency}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Operational Responsibilities
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed">
                {currentNode.role}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Worst-Case Failover & Isolation Policy
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-amber-950">
                {currentNode.failover}
              </p>
            </div>
          </div>

          {/* Critical Parameters */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Production Tuning Parameters</span>
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-800">
              {currentNode.criticalConfig.map((cfg, idx) => (
                <li key={idx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  {cfg}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
