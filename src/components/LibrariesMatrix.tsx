import React from 'react';
import { Cpu, CheckCircle2, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface LibraryRecommendation {
  category: string;
  recommended: string;
  version: string;
  alternatives: string[];
  latencyProfile: 'Ultra-low (<2ms)' | 'Low (<20ms)' | 'Medium (<100ms)' | 'LLM Bound';
  keyAdvantages: string[];
  defensiveFeatures: string;
}

const LIBRARIES_DATA: LibraryRecommendation[] = [
  {
    category: 'Validation & Contracts',
    recommended: 'Pydantic v2',
    version: '>= 2.7.0',
    alternatives: ['Instructor', 'Marshmallow', 'Cerberus'],
    latencyProfile: 'Ultra-low (<2ms)',
    keyAdvantages: [
      'Rust-backed core (pydantic-core) delivers 5x-20x speedup over v1',
      'Strict mode validation (strict=True) blocks implicit casting',
      'Field descriptions & metadata generate clean OpenAPI & JSONSchema specs',
    ],
    defensiveFeatures: 'model_validator(mode="after") enforces inter-field constraints; ConfigDict(extra="forbid") immediately drops unexpected injection payloads.',
  },
  {
    category: 'Ingress & Async Web Server',
    recommended: 'FastAPI + Uvicorn',
    version: 'FastAPI >= 0.111.0, Uvicorn >= 0.29.0',
    alternatives: ['Litestar', 'Aiohttp', 'Sanic'],
    latencyProfile: 'Low (<20ms)',
    keyAdvantages: [
      'Native async/await event loop integration for high concurrency',
      'Seamless Pydantic v2 validation integrated at the routing layer',
      'Built-in dependency injection for DB pools, cache clients, and rate limiters',
    ],
    defensiveFeatures: 'Global exception handlers sanitize raw tracebacks before returning standard RFC 7807 problem details with correlation IDs.',
  },
  {
    category: 'Distributed In-Memory Cache',
    recommended: 'Redis (redis-py async) / DragonflyDB',
    version: 'Redis >= 7.2, redis-py >= 5.0.0',
    alternatives: ['Dragonfly', 'AWS ElastiCache Redis', 'Memcached'],
    latencyProfile: 'Ultra-low (<2ms)',
    keyAdvantages: [
      'Async connection pooling handles thousands of concurrent coroutines',
      'Volatile-lfu eviction gracefully sheds unneeded cache without OOM',
      'Sub-millisecond pipeline queries reduce round-trip network hops',
    ],
    defensiveFeatures: 'Socket timeout set to 150ms; circuit breaker wraps cache queries to prevent slow Redis nodes from stalling user requests.',
  },
  {
    category: 'Asynchronous Task Queue & Workers',
    recommended: 'Celery (with RabbitMQ/Redis) or Temporal.io',
    version: 'Celery >= 5.4.0 (or Temporal Python SDK >= 1.5.0)',
    alternatives: ['ARQ (asyncio Redis)', 'DRAMATIQ', 'Kafka-Python'],
    latencyProfile: 'Medium (<100ms)',
    keyAdvantages: [
      'Decouples compute-heavy LLM synthesis from web ingress',
      'Bounded prefetch (prefetch_count=1) prevents worker task starvation',
      'Automatic retry policies with exponential backoff and jitter',
    ],
    defensiveFeatures: 'task_acks_late=True guarantees that if a worker pod crashes mid-execution, the task is safely redelivered to a healthy worker.',
  },
  {
    category: 'Vector Database & Hybrid Search',
    recommended: 'Qdrant (or pgvector on Cloud SQL)',
    version: 'Qdrant >= 1.9.0 (Client >= 1.9.0)',
    alternatives: ['Milvus 2.4+', 'pgvector 0.7+', 'Pinecone'],
    latencyProfile: 'Low (<20ms)',
    keyAdvantages: [
      'Native hybrid retrieval (dense embeddings + sparse lexical BM25 vectors)',
      'High-performance HNSW index with scalar quantization int8',
      'Payload filtering executed directly at the index graph traversal stage',
    ],
    defensiveFeatures: 'Configurable retrieval timeout (1200ms); if breached, the pipeline seamlessly degrades to local lexical BM25 search.',
  },
  {
    category: 'Hallucination & Faithfulness Evaluation',
    recommended: 'Ragas + TruLens',
    version: 'Ragas >= 0.1.9, TruLens-eval >= 0.28.0',
    alternatives: ['DeepEval', 'Cleanlab Studio', 'Guardrails AI'],
    latencyProfile: 'Medium (<100ms)',
    keyAdvantages: [
      'Quantitative faithfulness and answer-relevance metrics',
      'Claim extraction and Natural Language Inference (NLI) entailment scoring',
      'Continuous evaluation loop for canary deployments',
    ],
    defensiveFeatures: 'If ungrounded propositions exceed 20% (faithfulness < 0.80), the output is automatically quarantined and swapped with verified extractive excerpts.',
  },
  {
    category: 'LLM Gateway & Circuit Breaker',
    recommended: 'LiteLLM + PyBreaker + Tenacity',
    version: 'LiteLLM >= 1.35.0, PyBreaker >= 1.1.0, Tenacity >= 8.3.0',
    alternatives: ['Langfuse Proxy', 'Portkey AI Gateway', 'OpenTelemetry GenAI'],
    latencyProfile: 'LLM Bound',
    keyAdvantages: [
      'Standardized OpenAI/Gemini format across all foundation models',
      'Client-side token bucket rate limiting and budget tracking',
      'Automatic failover across secondary providers or regional endpoints',
    ],
    defensiveFeatures: 'PyBreaker trips after 5 consecutive 5xx/429 errors within 30s, halting API calls and activating the ExtractiveFallbackSummarizer in <15ms.',
  },
  {
    category: 'Observability & Structured Logging',
    recommended: 'Structlog + OpenTelemetry Python',
    version: 'Structlog >= 24.1.0, opentelemetry-sdk >= 1.24.0',
    alternatives: ['Loguru', 'Datadog Trace', 'SigNoz'],
    latencyProfile: 'Ultra-low (<2ms)',
    keyAdvantages: [
      'Outputs machine-parseable structured JSON logs with zero overhead',
      'Automatic context injection: correlation_id, tenant_id, agent_name',
      'Vendor-agnostic OpenTelemetry traces exported to Jaeger, Grafana, or CloudWatch',
    ],
    defensiveFeatures: 'Processors automatically redact credit cards, bearer tokens, API keys, and sensitive PII before logs hit standard output.',
  },
];

export const LibrariesMatrix: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                Technology Stack Selection
              </span>
              <span className="text-xs text-slate-500">
                Performance, Maintainability & Testing Efficiency
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recommended Libraries & Frameworks Matrix
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Carefully curated, battle-tested Python libraries chosen specifically for low latency, 
              worst-case defensive resilience, strict Pydantic v2 data typing, and high-concurrency event-driven processing.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Libraries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LIBRARIES_DATA.map((lib, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {lib.category}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Latency: <strong className="text-slate-700">{lib.latencyProfile}</strong>
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-slate-900">{lib.recommended}</h3>
                <span className="text-xs font-mono text-slate-500">{lib.version}</span>
              </div>

              <div className="text-xs text-slate-500 mt-1 font-mono">
                Alternatives: {lib.alternatives.join(', ')}
              </div>

              {/* Key Advantages */}
              <div className="mt-3.5 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Key Production Advantages:
                </div>
                {lib.keyAdvantages.map((adv, aIdx) => (
                  <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defensive Feature Card */}
            <div className="pt-3 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-2xl border-t">
              <div className="flex items-start gap-2 text-xs text-slate-800">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900 font-semibold">Defensive Contract: </strong>
                  <span className="text-slate-600">{lib.defensiveFeatures}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
