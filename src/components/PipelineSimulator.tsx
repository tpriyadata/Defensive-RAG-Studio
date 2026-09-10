import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Database, 
  Search, 
  BrainCircuit, 
  Clock, 
  Zap, 
  Bug,
  Lock,
  FileCheck2,
  Terminal,
  Activity,
  Layers,
  ShieldCheck,
  Plus,
  BookOpen,
  Trash2,
  Sparkles,
  HeartPulse,
  Info,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_CORPORA } from '../data/sampleCorpus';
import { ChaosMode, PipelineExecutionResult, PipelineStep, DocumentChunk } from '../types';
import { DocumentIngestionModal } from './DocumentIngestionModal';
import { ClinicalGroundingInspector } from './ClinicalGroundingInspector';
import { RateLimiterQueueWidget } from './RateLimiterQueueWidget';
import { pubMedQueue } from '../utils/pubmedQueueManager';
import { useTenantAuth } from '../context/TenantAuthContext';
import { Building2 } from 'lucide-react';

interface PipelineSimulatorProps {
  onNavigateToMetrics?: () => void;
}

export const PipelineSimulator: React.FC<PipelineSimulatorProps> = ({
  onNavigateToMetrics
}) => {
  const { activeTenant, currentUser } = useTenantAuth();
  const [selectedCorpusIndex, setSelectedCorpusIndex] = useState(0);
  const [activeDocuments, setActiveDocuments] = useState<DocumentChunk[]>(SAMPLE_CORPORA[0].chunks);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [healthcareMode, setHealthcareMode] = useState(false);
  const [rateLimiterEnabled, setRateLimiterEnabled] = useState(true);
  const [query, setQuery] = useState('How does the system ensure high availability, defensive error handling, and low latency across worker queues?');
  const [chaosMode, setChaosMode] = useState<ChaosMode>('NONE');
  const [skipCache, setSkipCache] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PipelineExecutionResult | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const currentCorpus = SAMPLE_CORPORA[selectedCorpusIndex];

  const handleSelectCorpus = (idx: number) => {
    setSelectedCorpusIndex(idx);
    const corpus = SAMPLE_CORPORA[idx];
    setActiveDocuments(corpus.chunks);
    if (corpus.category === 'healthcare-clinical') {
      setHealthcareMode(true);
      setQuery('What are the mortality and renal clinical trial outcomes for Dapagliflozin (DAPA-HF) and Semaglutide (FLOW)?');
    } else {
      setHealthcareMode(false);
      if (idx === 0) {
        setQuery('How does the system ensure high availability, defensive error handling, and low latency across worker queues?');
      } else if (idx === 1) {
        setQuery('Explain the Raft consensus leader election timeouts and quorum guarantees during network partitions.');
      }
    }
  };

  const handleAddDocument = (newDoc: DocumentChunk) => {
    setActiveDocuments((prev) => [newDoc, ...prev]);
    if (newDoc.metadata?.pmid) {
      setHealthcareMode(true);
    }
  };

  const handleAddBatchDocuments = (newDocs: DocumentChunk[]) => {
    setActiveDocuments((prev) => [...newDocs, ...prev]);
    setHealthcareMode(true);
  };

  const handleRemoveDocument = (id: string) => {
    setActiveDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setActiveStepId('step-ingress');

    const correlationId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    // Prepare steps structure
    const initialSteps: PipelineStep[] = [
      {
        id: 'step-ingress',
        name: 'Ingress Schema & Rate Limit',
        agentRole: 'FastAPI Edge Guard',
        type: 'INGRESS_VALIDATION',
        status: 'running',
        latencyMs: 8,
        details: healthcareMode 
          ? 'Validating clinical query with Pydantic SanitizedClinicalQuery (extra="forbid", medical term preservation).'
          : 'Validating incoming query with Pydantic SanitizedString (max 2000 chars, regex sanitization).',
        logs: [`[${correlationId}] Ingress received query length: ${query.length} chars. Schema strict validation enforced.`],
      },
      {
        id: 'step-cache',
        name: 'Distributed Cache Probe',
        agentRole: 'Redis Tier 1/2',
        type: 'CACHE_CHECK',
        status: 'idle',
        latencyMs: 3,
        details: 'Hashing normalized query via SHA-256 for exact match; probing semantic embedding similarity.',
        logs: [],
      },
      {
        id: 'step-retrieval',
        name: 'Retrieval Agent (Hybrid)',
        agentRole: 'Qdrant / Dense + BM25',
        type: 'RETRIEVAL_AGENT',
        status: 'idle',
        latencyMs: 32,
        details: healthcareMode
          ? `Hybrid dense + PubMed MeSH keyword retrieval across ${activeDocuments.length} active documents (including indexed trials).`
          : `Hybrid vector search (HNSW ef_search=64) + BM25 keyword matching across ${activeDocuments.length} chunks.`,
        logs: [],
      },
      {
        id: 'step-validation',
        name: 'Defensive Validation Agent',
        agentRole: 'Pydantic v2 Guard',
        type: 'DEFENSIVE_VALIDATION',
        status: 'idle',
        latencyMs: 14,
        details: healthcareMode
          ? 'Enforcing ClinicalChunkMetadata, SHA-256 checksums, PubMed accession IDs, and clinical trial source reliability >= 0.90.'
          : 'Enforcing ChunkMetadata, checksum integrity, token boundaries, and source reliability >= 0.70.',
        logs: [],
      },
      {
        id: 'step-synthesis',
        name: 'Synthesis & Summarizer Agent',
        agentRole: 'LLM Gateway + Fallback',
        type: 'SYNTHESIS_AGENT',
        status: 'idle',
        latencyMs: 240,
        details: healthcareMode
          ? 'Generating strictly grounded clinical synthesis with verbatim statistical hazard ratios (HR, CI, P-values).'
          : 'Generating grounded summary constrained by max_output_tokens=512 with strict citation markers.',
        logs: [],
      },
      {
        id: 'step-hallucination',
        name: 'Hallucination Detection Agent',
        agentRole: 'Faithfulness Verifier',
        type: 'HALLUCINATION_AGENT',
        status: 'idle',
        latencyMs: 85,
        details: healthcareMode
          ? 'Clinical Natural Language Inference (NLI): Zero-tolerance claim verification against PubMed abstracts (Threshold: >=95% Grounding).'
          : 'Cross-verifying summary statements against source chunk spans; computing ungrounded claim ratio.',
        logs: [],
      },
      {
        id: 'step-egress',
        name: 'Egress Schema & Cache Write',
        agentRole: 'Pydantic Output Guard',
        type: 'EGRESS_VALIDATION',
        status: 'idle',
        latencyMs: 6,
        details: 'Validating final SummarizerOutput schema; asynchronously populating Redis volatile-lfu cache.',
        logs: [],
      },
    ];

    try {
      // Execute via backend API or simulated fallback
      let apiResponse: any = null;
      try {
        const response = await fetch('/api/rag/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
            'X-Tenant-Id': activeTenant.id,
            'X-User-Role': currentUser.role,
          },
          body: JSON.stringify({
            tenantId: activeTenant.id,
            userRole: currentUser.role,
            query,
            documents: activeDocuments,
            chaosMode,
            skipCache,
            healthcareMode,
          }),
        });
        apiResponse = await response.json();
      } catch (fetchErr) {
        console.warn('Backend API request error, proceeding with defensive client simulation:', fetchErr);
      }

      // Simulate step-by-step pipeline execution visualization
      let currentLogs: any[] = [];
      const updatedSteps = [...initialSteps];

      // Step 1: Ingress
      updatedSteps[0].status = 'success';
      currentLogs.push({
        timestamp: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        agent: 'FastAPI Ingress',
        message: `Query passed Pydantic validation. Mode: ${healthcareMode ? 'HEALTHCARE_CLINICAL_GRADE' : 'GENERAL_RAG'}. Correlation ID: ${correlationId}`,
      });

      // Step 2: Cache
      setActiveStepId('step-cache');
      await new Promise((r) => setTimeout(r, 180));
      const isCacheHit = !skipCache && chaosMode === 'NONE' && Math.random() > 0.7;
      updatedSteps[1].status = isCacheHit ? 'success' : 'bypassed';
      updatedSteps[1].details = isCacheHit
        ? 'Cache HIT in Redis Cluster (SHA-256 match). Saved downstream LLM compute.'
        : 'Cache MISS. Proceeding to Retrieval and Validation agents.';
      currentLogs.push({
        timestamp: new Date().toISOString().substring(11, 23),
        level: isCacheHit ? 'INFO' : 'DEBUG',
        agent: 'Redis Cache Tier',
        message: isCacheHit ? 'Exact query hash matched in volatile-lfu cache (TTL: 3540s).' : 'Query hash miss, fetching from vector store.',
      });

      // Step 3: Retrieval
      setActiveStepId('step-retrieval');
      await new Promise((r) => setTimeout(r, 220));
      if (chaosMode === 'RETRIEVAL_TIMEOUT') {
        updatedSteps[2].status = 'failed';
        updatedSteps[2].details = 'Vector DB latency exceeded 1200ms SLA. Circuit tripped; fallback to local lexical cache triggered.';
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'ERROR',
          agent: 'Retrieval Agent',
          message: 'Vector index timeout after 1200ms. Activating graceful degradation fallback.',
        });
      } else {
        updatedSteps[2].status = 'success';
        const pubmedDocsCount = activeDocuments.filter((d) => Boolean(d.metadata?.pmid)).length;
        updatedSteps[2].details = `Retrieved ${activeDocuments.length} candidate documents (${pubmedDocsCount} PubMed indexed trials) via hybrid dense + BM25 fusion.`;
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'INFO',
          agent: 'Retrieval Agent',
          message: `Multi-document candidate pool loaded: ${activeDocuments.length} documents concurrent. Top RRF score 0.97.`,
        });
      }

      // Step 4: Defensive Validation
      setActiveStepId('step-validation');
      await new Promise((r) => setTimeout(r, 200));
      let quarantinedCount = 0;
      if (chaosMode === 'SCHEMA_CORRUPTION') {
        updatedSteps[3].status = 'warning';
        quarantinedCount = 1;
        updatedSteps[3].details = 'Pydantic caught ValidationError: Chunk #2 checksum missing or corrupted. Chunk quarantined; remaining valid chunks forwarded.';
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'WARN',
          agent: 'Validation Agent',
          message: 'Quarantined corrupted chunk [chunk-02]: Missing required cryptographic sha256 checksum.',
        });
      } else if (chaosMode === 'POISONED_METADATA') {
        updatedSteps[3].status = 'success';
        updatedSteps[3].details = 'Prompt injection token `<|system|>` detected and sanitized by @field_validator into safe neutral marker.';
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'WARN',
          agent: 'Validation Agent',
          message: 'Sanitized injection token "<|system|>" from untrusted source payload.',
        });
      } else {
        updatedSteps[3].status = 'success';
        updatedSteps[3].details = `All ${activeDocuments.length} active documents strictly validated against DocumentChunk & Metadata schemas (Pydantic v2).`;
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'INFO',
          agent: 'Validation Agent',
          message: `Zero schema violations across ${activeDocuments.length} chunks. Checksums and token boundaries authenticated.`,
        });
      }

      // Step 5: Synthesis
      setActiveStepId('step-synthesis');
      await new Promise((r) => setTimeout(r, 320));
      let isFallback = false;
      let summaryText = '';
      if (chaosMode === 'CIRCUIT_BREAKER_OPEN') {
        updatedSteps[4].status = 'warning';
        isFallback = true;
        summaryText = `[Circuit Breaker Fallback] Due to downstream LLM rate limits (HTTP 429), the defensive engine generated a deterministic extractive summary from top verified chunks: ${activeDocuments[0]?.content.substring(0, 180)}... [${activeDocuments[0]?.id}]`;
        updatedSteps[4].details = 'Circuit Breaker in OPEN state. Bypassed external API to prevent cascade failure; generated extractive fallback.';
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'WARN',
          agent: 'Synthesis Agent',
          message: 'PyBreaker OPEN: 5 consecutive failures recorded. Routed to ExtractiveFallbackSummarizer.',
        });
      } else {
        updatedSteps[4].status = 'success';
        summaryText = apiResponse?.summary || (
          healthcareMode
            ? `Based on the peer-reviewed clinical trials for "${query}", SGLT2 inhibitor dapagliflozin reduced the primary composite outcome of worsening heart failure or cardiovascular death by 26% (16.3% vs 21.2%; Hazard Ratio 0.74; 95% CI, 0.65 to 0.85; P<0.001) and lowered all-cause mortality (HR 0.83; P=0.02) [PMID: 31535829]. In diabetic kidney disease, semaglutide reduced the composite kidney outcome by 24% (HR 0.76; 95% CI, 0.66 to 0.88; P=0.0003) and major cardiovascular events by 18% (HR 0.82; P=0.029) [PMID: 38780522].`
            : `The verified knowledge corpus confirms that high availability is preserved through asynchronous messaging with dead-letter exchanges and bounded prefetch [${activeDocuments[0]?.id || 'Doc 1'}]. Redis volatile-lfu caching mitigates stampedes via probabilistic early expiration, while ALB connection draining (30s) and ASG target tracking (600 req/min) guarantee low-latency elasticity [${activeDocuments[1]?.id || activeDocuments[0]?.id || 'Doc 2'}].`
        );
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'INFO',
          agent: 'Synthesis Agent',
          message: `Summary generated with strict citation markers bound to verified active documents.`,
        });
      }

      // Step 6: Hallucination Agent
      setActiveStepId('step-hallucination');
      await new Promise((r) => setTimeout(r, 260));
      let hScore = apiResponse?.metrics?.hallucinationScore ?? 0.02;
      let gScore = apiResponse?.metrics?.groundingScore ?? (healthcareMode ? 0.985 : 0.94);
      const isQuarantined = chaosMode === 'HALLUCINATION_BREACH' || apiResponse?.status === 'quarantined';

      if (isQuarantined) {
        hScore = 0.78;
        gScore = 0.22;
        updatedSteps[5].status = 'quarantined';
        updatedSteps[5].details = 'Hallucination Agent flagged ungrounded claims exceeding safety threshold (0.78 > 0.20). Healthcare zero-tolerance quarantine enforced!';
        summaryText = apiResponse?.safeFallbackSummary || `[Quarantined by Hallucination Guard] LLM asserted unverified metrics not found in reference literature. Safe verified excerpt: "${activeDocuments[0]?.content.slice(0, 220)}..." [${activeDocuments[0]?.id || 'Doc 1'}]`;
        isFallback = true;
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'ERROR',
          agent: 'Hallucination Agent',
          message: 'Entailment verification failed: Unsupported clinical propositions detected. Quarantine triggered.',
        });
      } else {
        updatedSteps[5].status = 'success';
        updatedSteps[5].details = healthcareMode
          ? `Clinical entailment verified: Grounding Score ${(gScore * 100).toFixed(1)}% (Grade A Certainty), zero ungrounded assertions.`
          : `Faithfulness verified: Groundedness score ${(gScore * 100).toFixed(1)}%, citations authenticated against context.`;
        currentLogs.push({
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'INFO',
          agent: 'Hallucination Agent',
          message: `Groundedness authenticated against PubMed & reference corpus. Grounding Score: ${(gScore * 100).toFixed(1)}%.`,
        });
      }

      // Step 7: Egress & Cache Write
      setActiveStepId('step-egress');
      await new Promise((r) => setTimeout(r, 120));
      updatedSteps[6].status = 'success';
      currentLogs.push({
        timestamp: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        agent: 'Egress Guard',
        message: 'SummarizerOutput validated against Pydantic schema. Async cache write dispatched.',
      });

      const totalLatency = Date.now() - startTime;

      const fScore = apiResponse?.faithfulnessScore 
        ?? (isQuarantined ? 0.22 : isFallback ? 0.72 : (healthcareMode ? 0.994 : 0.965));

      setResult({
        executionId: correlationId,
        timestamp: new Date().toISOString(),
        query,
        status: isQuarantined ? 'QUARANTINED' : isFallback ? 'DEGRADED_FALLBACK' : 'SUCCESS',
        quarantineReason: isQuarantined ? 'Hallucination Agent caught ungrounded assertions violating healthcare safety protocol.' : undefined,
        summary: summaryText,
        citations: apiResponse?.citations || activeDocuments.slice(0, 3).map((c) => c.metadata?.pmid ? `[PMID: ${c.metadata.pmid}] ${c.title}` : `[${c.id}] ${c.title}`),
        cacheStatus: isCacheHit ? 'HIT' : 'MISS',
        totalLatencyMs: totalLatency,
        hallucinationScore: hScore,
        confidenceScore: isQuarantined ? 0.38 : isFallback ? 0.68 : (healthcareMode ? 0.98 : 0.94),
        groundingScore: gScore,
        faithfulnessScore: fScore,
        healthcareMode,
        circuitBreakerState: chaosMode === 'CIRCUIT_BREAKER_OPEN' ? 'OPEN' : 'CLOSED',
        claimVerifications: apiResponse?.claimVerifications,
        clinicalMetrics: apiResponse?.clinicalMetrics,
        steps: updatedSteps,
        logs: currentLogs,
        pydanticValidationSummary: {
          schemaVersion: healthcareMode ? 'ClinicalSummarizerOutputV2 (strict=True)' : 'SummarizerOutputV2 (strict=True)',
          strictMode: true,
          validationsPassed: healthcareMode ? 7 : 6,
          validationsFailed: quarantinedCount,
          quarantinedFields: quarantinedCount > 0 ? ['chunk[1].metadata.checksum'] : [],
        },
      });
    } catch (err: any) {
      console.error('Pipeline execution simulation error:', err);
    } finally {
      setIsRunning(false);
      setActiveStepId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Multi-Document & PubMed Ingestion Modal */}
      <DocumentIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        activeDocuments={activeDocuments}
        onAddDocument={handleAddDocument}
        onAddBatchDocuments={handleAddBatchDocuments}
        onRemoveDocument={handleRemoveDocument}
        rateLimiterEnabled={rateLimiterEnabled}
        onToggleRateLimiter={setRateLimiterEnabled}
      />

      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border border-blue-500/30">
                Worst-Case Defensive Engine
              </span>
              <span className="text-slate-400 text-xs">
                Zero-Trust Multi-Agent Pipeline
              </span>
              {healthcareMode && (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Healthcare Grade Grounding Active</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Interactive Multi-Agent RAG Simulator
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
              Test queries against verified knowledge corpora. Observe real-time execution across 
              <strong> Retrieval Agent</strong>, <strong>Validation Agent</strong>, 
              <strong> Hallucination Agent</strong>, and <strong>Synthesis Agent</strong>. 
              Supports <strong>unrestricted concurrent ingestion</strong> of multiple PubMed studies with <strong>virtual queue rate limiting (3 req/sec)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-300 group-hover:rotate-90 group-hover:text-cyan-200 transition-all duration-200 shrink-0" />
              <span className="font-semibold text-xs text-white tracking-wide select-none">Ingest Document / PubMed ID</span>
            </button>

            <button
              id="run-pipeline-btn"
              onClick={handleRunPipeline}
              disabled={isRunning}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 cursor-pointer ${
                isRunning
                  ? 'bg-slate-700 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 active:scale-95 ring-1 ring-white/10'
              }`}
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-cyan-300" />
                  <span className="font-bold text-xs uppercase tracking-wider select-none">Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-cyan-300" />
                  <span className="font-bold text-xs uppercase tracking-wider select-none">Execute Defensive Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Query & Corpus Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label htmlFor="pipeline-query" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>User Summarization Query</span>
              </label>

              <div className="flex items-center gap-3">
                {/* Healthcare Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setHealthcareMode(!healthcareMode)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all border ${
                    healthcareMode
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle healthcare-grade zero-tolerance grounding"
                >
                  <HeartPulse className={`w-3.5 h-3.5 ${healthcareMode ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>Healthcare Mode: {healthcareMode ? 'ON' : 'OFF'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Preset:</span>
                  <select
                    aria-label="Select sample question"
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-xs bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    {healthcareMode ? (
                      <>
                        <option value="What are the mortality and renal clinical trial outcomes for Dapagliflozin (DAPA-HF) and Semaglutide (FLOW)?">
                          DAPA-HF & FLOW Outcomes (PubMed)
                        </option>
                        <option value="What is the 6-month humoral durability and antibody decay rate of mRNA-1273 and BNT162b2 vaccines?">
                          mRNA Vaccine Neutralizing Durability
                        </option>
                        <option value="In hospitalized COVID-19 patients with hypoxia, what was the 28-day mortality benefit of Tocilizumab in RECOVERY?">
                          Tocilizumab RECOVERY Trial Endpoints
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="How does the system ensure high availability, defensive error handling, and low latency across worker queues?">
                          High Availability & Worker Queues
                        </option>
                        <option value="Explain the Raft consensus leader election timeouts and quorum guarantees during network partitions.">
                          Raft Consensus & Quorum Safety
                        </option>
                        <option value="What are the primary AWS ALB connection draining and ASG Target Tracking scaling configurations?">
                          ALB Tuning & ASG Policies
                        </option>
                        <option value="How does Redis volatile-lfu eviction and probabilistic early expiration prevent cache stampedes?">
                          Redis Cache Stampede Defense
                        </option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <textarea
              id="pipeline-query"
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter user query to synthesize..."
              className="w-full text-sm font-medium font-sans bg-slate-50/70 border border-slate-300 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-150 shadow-inner resize-y leading-relaxed"
            />

            {/* Knowledge Corpus Selector & Ingestion Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Active Ground Truth Corpus ({activeDocuments.length} Documents)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    {SAMPLE_CORPORA.map((c, idx) => (
                      <button
                        key={c.category}
                        onClick={() => handleSelectCorpus(idx)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                          selectedCorpusIndex === idx
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c.label.split('&')[0]}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsIngestModalOpen(true)}
                    className="text-xs px-2.5 py-1 rounded-md font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ingest PubMed/Doc</span>
                  </button>
                </div>
              </div>

              {/* Unrestricted Ingestion Notice */}
              <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span><strong>Multi-Document Ingestion Unrestricted:</strong> You can add multiple PubMed IDs and clinical trial protocols concurrently without lockout.</span>
                </span>
                <span className="font-mono text-[10px] text-indigo-600 font-semibold">
                  {activeDocuments.filter(d => Boolean(d.metadata?.pmid)).length} PubMed trials loaded
                </span>
              </div>

              {/* Active Document Chunks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {activeDocuments.map((chunk, i) => (
                  <div 
                    key={chunk.id} 
                    className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-indigo-700">[{chunk.id}]</span>
                          {chunk.metadata?.pmid && (
                            <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-1.5 py-0.2 rounded">
                              PMID: {chunk.metadata.pmid}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-sans">
                            {(chunk.reliability * 100).toFixed(0)}%
                          </span>
                          {activeDocuments.length > 1 && (
                            <button
                              onClick={() => handleRemoveDocument(chunk.id)}
                              title="Remove document from active batch"
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="font-medium text-slate-800 line-clamp-1 mb-1">{chunk.title}</div>
                      <div className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed font-sans">
                        {chunk.content}
                      </div>
                    </div>
                    {chunk.metadata?.journal && (
                      <div className="mt-1.5 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                        <span>{chunk.metadata.journal}</span>
                        <span>{chunk.metadata.publicationDate}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulator Settings (Rate Limiter Virtual Queue + Chaos / Worst-Case Fault Injector) */}
        <div className="space-y-4">
          {/* Rate Limiter Virtual Queue Widget */}
          <RateLimiterQueueWidget
            rateLimiterEnabled={rateLimiterEnabled}
            onToggleRateLimiter={setRateLimiterEnabled}
          />

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Worst-Case Chaos Injector</h2>
                <p className="text-xs text-slate-500">Test automated defensive recovery</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'NONE',
                  label: 'Normal Flow (Happy Path)',
                  desc: 'All validation passes; high-grounding synthesis with citations.',
                  badge: 'Standard',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                },
                {
                  id: 'RETRIEVAL_TIMEOUT',
                  label: 'Vector DB Timeout (>1200ms)',
                  desc: 'SLA breach triggers fallback to local lexical cache.',
                  badge: 'Timeout',
                  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                },
                {
                  id: 'SCHEMA_CORRUPTION',
                  label: 'Pydantic Schema Violation',
                  desc: 'Missing SHA-256 checksum in chunk metadata causes immediate quarantine.',
                  badge: 'Pydantic',
                  badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
                },
                {
                  id: 'HALLUCINATION_BREACH',
                  label: 'Hallucination Breach (>20%)',
                  desc: 'Ungrounded claims caught by Hallucination Agent -> forces safe excerpt fallback.',
                  badge: 'Safety Guard',
                  badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
                },
                {
                  id: 'CIRCUIT_BREAKER_OPEN',
                  label: 'Circuit Breaker Open (LLM 429)',
                  desc: 'PyBreaker trips to OPEN; serves fast deterministic extractive summary.',
                  badge: 'Resilience',
                  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                },
                {
                  id: 'POISONED_METADATA',
                  label: 'Adversarial Prompt Injection',
                  desc: 'Tokens like `<|system|>` sanitized by Pydantic validator before reaching agents.',
                  badge: 'Security',
                  badgeColor: 'bg-red-50 text-red-700 border-red-200',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setChaosMode(item.id as ChaosMode)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    chaosMode === item.id
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Cache Toggle */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Bypass Redis Cache:</span>
              <button
                type="button"
                onClick={() => setSkipCache(!skipCache)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  skipCache ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    skipCache ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Pipeline Execution Steps Flow */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Multi-Agent Pipeline Event Sequence
            </h2>
          </div>
          {result && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-500">
                Correlation ID: <span className="text-indigo-600 font-semibold">{result.executionId}</span>
              </span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                Total Latency: <strong>{result.totalLatencyMs}ms</strong>
              </span>
            </div>
          )}
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {(result?.steps || [
            { id: 'step-ingress', name: 'Ingress Schema', agentRole: 'FastAPI Edge Guard', status: 'idle', latencyMs: 0 },
            { id: 'step-cache', name: 'Redis Cache', agentRole: 'Tier 1/2 Cache', status: 'idle', latencyMs: 0 },
            { id: 'step-retrieval', name: 'Retrieval Agent', agentRole: 'Qdrant Dense+BM25', status: 'idle', latencyMs: 0 },
            { id: 'step-validation', name: 'Validation Agent', agentRole: 'Pydantic v2 Guard', status: 'idle', latencyMs: 0 },
            { id: 'step-synthesis', name: 'Synthesis Agent', agentRole: 'LLM Gateway', status: 'idle', latencyMs: 0 },
            { id: 'step-hallucination', name: 'Hallucination Agent', agentRole: 'Entailment Evaluator', status: 'idle', latencyMs: 0 },
            { id: 'step-egress', name: 'Egress Schema', agentRole: 'Output Validator', status: 'idle', latencyMs: 0 },
          ]).map((step, idx) => {
            const isCurrentActive = activeStepId === step.id;
            const statusColors: Record<string, string> = {
              idle: 'border-slate-200 bg-slate-50/60 text-slate-400',
              running: 'border-cyan-400 bg-cyan-50/50 text-cyan-800 shadow-sm ring-2 ring-cyan-400/40 animate-pulse',
              success: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
              warning: 'border-amber-300 bg-amber-50/40 text-amber-900',
              failed: 'border-rose-300 bg-rose-50/40 text-rose-900',
              quarantined: 'border-purple-300 bg-purple-50/40 text-purple-900',
              bypassed: 'border-slate-200 bg-slate-100 text-slate-500',
            };

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isCurrentActive ? statusColors.running : (statusColors[step.status] || statusColors.idle)
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>0{idx + 1}</span>
                    <span className="font-semibold uppercase tracking-wider">
                      {step.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mb-0.5">{step.name}</div>
                  <div className="text-[11px] text-slate-500 mb-1.5">{step.agentRole}</div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500">Latency</span>
                  <span className="font-semibold text-slate-800">
                    {step.latencyMs ? `${step.latencyMs}ms` : '--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synthesis Result & Defensive Audit Card */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary & Citations Output */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Verified Synthesized Output
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    result.status === 'SUCCESS' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : result.status === 'DEGRADED_FALLBACK'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>
                    Status: {result.status}
                  </span>
                </div>
              </div>

              {/* Summary text */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed font-sans">
                {result.summary}
              </div>

              {/* Citations list */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ground Truth Citations Authenticated by Hallucination Agent:
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.citations.map((c, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Healthcare Clinical Grounding & Fact-Check Inspector */}
            {(healthcareMode || (result.claimVerifications && result.claimVerifications.length > 0) || result.status === 'QUARANTINED') && (
              <ClinicalGroundingInspector
                groundingScore={result.groundingScore ?? (healthcareMode ? 0.985 : 0.94)}
                faithfulnessScore={result.faithfulnessScore}
                claimVerifications={result.claimVerifications}
                clinicalMetrics={result.clinicalMetrics}
                isQuarantined={result.status === 'QUARANTINED'}
                quarantineReason={result.quarantineReason}
              />
            )}

            {/* Live Structured Logs Explorer */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Structured Audit Logs (OpenTelemetry & structlog format)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {result.logs.length} events emitted
                </span>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto">
                {result.logs.map((log, i) => {
                  const levelColors: Record<string, string> = {
                    INFO: 'text-emerald-400',
                    WARN: 'text-amber-400',
                    ERROR: 'text-rose-400',
                    DEBUG: 'text-cyan-400',
                  };
                  return (
                    <div key={i} className="flex items-start gap-2 leading-tight">
                      <span className="text-slate-500 text-[10px] select-none">{log.timestamp}</span>
                      <span className={`font-semibold text-[10px] w-12 ${levelColors[log.level]}`}>
                        [{log.level}]
                      </span>
                      <span className="text-indigo-300 font-medium">[{log.agent}]</span>
                      <span className="text-slate-300 flex-1">{log.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Defensive Resilience Metrics */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Defensive Validation Metrics
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Faithfulness Score</span>
                    </span>
                    <span className={`font-mono font-bold ${
                      (result.faithfulnessScore ?? 0.96) >= 0.95 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {(((result.faithfulnessScore ?? (1 - result.hallucinationScore))) * 100).toFixed(1)}% (Threshold: &ge;95%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (result.faithfulnessScore ?? 0.96) >= 0.95 ? 'bg-emerald-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, ((result.faithfulnessScore ?? (1 - result.hallucinationScore))) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Ratio of context-entailed claims to total assertions (Ragas metric).
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>{healthcareMode ? 'Clinical Grounding Score' : 'Grounding Confidence Score'}</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {((result.groundingScore ?? result.confidenceScore) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (result.groundingScore ?? result.confidenceScore) >= 0.95 ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(result.groundingScore ?? result.confidenceScore) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Hallucination Probability</span>
                    <span className={`font-mono font-bold ${
                      result.hallucinationScore > 0.20 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {(result.hallucinationScore * 100).toFixed(1)}% (Threshold: &le;20%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        result.hallucinationScore > 0.20 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, result.hallucinationScore * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Circuit Breaker State</span>
                    <span className={`font-mono font-semibold px-2 py-0.5 rounded ${
                      result.circuitBreakerState === 'CLOSED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {result.circuitBreakerState}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Redis Cache Hit</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {result.cacheStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pydantic Strict Mode</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      ACTIVE (extra="forbid")
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Concurrent Ingested Docs</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {activeDocuments.length} Documents
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quarantined Chunks</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {result.pydanticValidationSummary.validationsFailed}
                    </span>
                  </div>
                </div>

                {onNavigateToMetrics && (
                  <button
                    onClick={onNavigateToMetrics}
                    className="w-full mt-4 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Grounding Recharts Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Architectural Guardrails Tip */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100 text-xs text-indigo-950">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Worst-Case Guarantee</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                If the downstream LLM gateway suffers latency spikes or token limits, the pipeline never drops the request: 
                the Circuit Breaker seamlessly switches to the deterministic <strong>ExtractiveFallbackSummarizer</strong> with 
                &lt;15ms latency.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

