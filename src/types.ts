export type AgentStepType = 
  | 'INGRESS_VALIDATION'
  | 'CACHE_CHECK'
  | 'RETRIEVAL_AGENT'
  | 'DEFENSIVE_VALIDATION'
  | 'HALLUCINATION_AGENT'
  | 'SYNTHESIS_AGENT'
  | 'EGRESS_VALIDATION'
  | 'CACHE_STORE';

export type AgentStatus = 'idle' | 'running' | 'success' | 'warning' | 'failed' | 'quarantined' | 'bypassed';

export interface PipelineStep {
  id: string;
  name: string;
  agentRole: string;
  type: AgentStepType;
  status: AgentStatus;
  latencyMs: number;
  details: string;
  logs: string[];
  metrics?: Record<string, any>;
  artifacts?: any;
}

export type ChaosMode = 
  | 'NONE'
  | 'RETRIEVAL_TIMEOUT'
  | 'SCHEMA_CORRUPTION'
  | 'HALLUCINATION_BREACH'
  | 'CIRCUIT_BREAKER_OPEN'
  | 'POISONED_METADATA';

export interface DocumentChunk {
  id: string;
  title: string;
  source: string;
  reliability: number; // 0.0 - 1.0
  content: string;
  metadata: {
    timestamp: string;
    category: string;
    tokenCount: number;
    checksum: string;
    pmid?: string;
    doi?: string;
    journal?: string;
    meshTerms?: string[];
    publicationDate?: string;
    authors?: string[];
  };
}

export interface ClaimVerification {
  id: string;
  claim: string;
  status: 'VERIFIED' | 'PARTIALLY_GROUNDED' | 'UNGROUNDED';
  confidenceScore: number;
  sourceId: string;
  sourceCitation: string;
  supportingQuote: string;
}

export interface ClinicalGroundingMetrics {
  overallGroundingScore: number; // 0.0 to 1.0 (e.g. 0.985)
  faithfulnessScore: number; // 0.0 to 1.0 (e.g. 0.994 - verified claims / total claims)
  claimCoveragePercent: number; // 0 to 100
  evidenceGrade: 'A (High-Certainty)' | 'B (Moderate)' | 'C (Low)';
  totalClaimsChecked: number;
  verifiedClaimsCount: number;
  unsupportedClaimsCount: number;
  pubmedCitationsCount: number;
}

export interface PipelineExecutionResult {
  executionId: string;
  timestamp: string;
  query: string;
  status: 'SUCCESS' | 'DEGRADED_FALLBACK' | 'QUARANTINED' | 'ERROR';
  quarantineReason?: string;
  summary: string;
  citations: string[];
  cacheStatus: 'HIT' | 'MISS' | 'BYPASSED';
  totalLatencyMs: number;
  hallucinationScore: number; // 0.0 to 1.0 (lower is better)
  confidenceScore: number;
  groundingScore?: number; // 0.0 to 1.0 (higher is better, critical for healthcare)
  faithfulnessScore?: number; // 0.0 to 1.0 (higher is better, ratio of verified factual claims to total claims)
  healthcareMode?: boolean;
  claimVerifications?: ClaimVerification[];
  clinicalMetrics?: ClinicalGroundingMetrics;
  circuitBreakerState: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  steps: PipelineStep[];
  logs: {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    agent: string;
    message: string;
    data?: any;
  }[];
  pydanticValidationSummary: {
    schemaVersion: string;
    strictMode: boolean;
    validationsPassed: number;
    validationsFailed: number;
    quarantinedFields: string[];
  };
}

export interface ServiceConfig {
  serviceName: string;
  category: 'API & Ingress' | 'Caching' | 'Message Queue & Workers' | 'Vector Store' | 'LLM & Resilience' | 'Observability';
  recommendedTool: string;
  alternatives: string[];
  role: string;
  latencyImpact: 'Ultra-low (<5ms)' | 'Low (<20ms)' | 'Medium (<100ms)' | 'High (LLM bound)';
  criticalParameters: {
    param: string;
    defaultValue: string;
    productionValue: string;
    rationale: string;
  }[];
  defensiveStrategy: string;
}

export interface RateLimiterConfig {
  enabled: boolean;
  maxRequestsPerSecond: number; // default 3 req/sec (NCBI guideline)
  minIntervalMs: number; // default 334ms
  retryOn429: boolean;
  maxRetries: number;
}

export interface VirtualQueueItem {
  id: string;
  pmid: string;
  enqueuedAt: number;
  scheduledDispatchAt: number;
  dispatchedAt?: number;
  completedAt?: number;
  status: 'QUEUED' | 'DISPATCHING' | 'SUCCESS' | 'RETRIED_429' | 'FAILED';
  retryCount: number;
  error?: string;
}

export interface VirtualQueueMetrics {
  rateLimiterEnabled: boolean;
  activeQueueDepth: number;
  totalEnqueued: number;
  totalProcessed: number;
  total429ErrorsPrevented: number;
  simulated429ErrorsWithoutLimiter: number;
  currentDispatchesPerSec: number;
  averageQueueWaitMs: number;
  lastDispatchTimestamp?: string;
  queueStatus: 'IDLE' | 'PROCESSING' | 'DRAINING' | 'PAUSED';
}

export interface ScaffoldFile {
  filename: string;
  path: string;
  language: 'python' | 'yaml' | 'json' | 'hcl';
  description: string;
  code: string;
}

export type SupportedIdType = 'auto' | 'pmid' | 'nct' | 'doi' | 'corpus_id';

export interface ApiLoadIdOptions {
  id: string;
  idType?: SupportedIdType;
  rateLimited?: boolean;
  minReliability?: number;
  enrichMetadata?: boolean;
  targetCategory?: string;
  autoIngest?: boolean;
}

export interface ApiLoadByIdResult {
  status: 'success' | 'not_found' | 'error';
  idTypeDetected: SupportedIdType;
  requestedId: string;
  resolvedIdentifier: {
    primaryId: string;
    type: SupportedIdType;
    pmid?: string;
    nct?: string;
    doi?: string;
    corpusId?: string;
  };
  chunk: DocumentChunk;
  rateLimiting: {
    applied: boolean;
    queueDelayMs: number;
    http429Risk: 'mitigated' | 'none' | 'high';
  };
  sourceDetails: {
    origin: string;
    provider: 'NCBI PubMed' | 'ClinicalTrials.gov' | 'Crossref / DOI' | 'Internal Curated Corpus';
    peerReviewed: boolean;
    verificationChecksum: string;
  };
  availableIdOptions: {
    type: SupportedIdType;
    name: string;
    example: string;
    format: string;
  }[];
}

export interface GroundingMetricDataPoint {
  date: string;
  timestamp: string;
  version: string;
  groundingScore: number; // 0-100 %
  faithfulnessScore: number; // 0-100 % (ratio of claims entailed by context)
  hallucinationRate: number; // 0-100 %
  citationPrecision: number; // 0-100 %
  contextRecall: number; // 0-100 %
  p99LatencyMs: number;
  workload: 'healthcare' | 'distributed-systems' | 'infra' | 'mixed';
  mode: 'baseline' | 'hybrid-rrf' | 'defensive-agentic' | 'healthcare-zero-tolerance';
  runCount: number;
}

export interface HallucinationErrorDistribution {
  category: string;
  baselineErrors: number;
  defensiveErrors: number;
  reductionPercentage: number;
  description: string;
}

export interface RadarPerformanceMetric {
  subject: string;
  baselineRag: number;
  defensiveRag: number;
  healthcareMode: number;
  fullMark: number;
}

export interface PipelineBenchmarkRun {
  id: string;
  timestamp: string;
  query: string;
  category: string;
  groundingScore: number;
  faithfulnessScore: number;
  hallucinationScore: number;
  p99LatencyMs: number;
  mode: string;
  documentsGrounded: number;
  status: 'passed' | 'warning' | 'quarantined';
}

// ----------------------------------------------------------------------------
// Multi-Tenancy, Auth, Monitoring & Billing Types
// ----------------------------------------------------------------------------

export type TenantTier = 'developer' | 'pro' | 'enterprise_healthcare';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: TenantTier;
  tierLabel: string;
  vectorNamespace: string;
  qpsLimit: number;
  monthlyTokenQuota: number;
  tokensUsedThisMonth: number;
  queriesThisMonth: number;
  hipaaCompliant: boolean;
  byokEnabled: boolean; // Bring Your Own Key encryption
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  primaryColor: string;
  logoInitials: string;
}

export type UserRole = 'ORG_ADMIN' | 'MLOPS_ENGINEER' | 'CLINICAL_REVIEWER' | 'AUDITOR';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  tenantId: string;
  role: UserRole;
  roleLabel: string;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  fullKeyMasked: string;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  scopes: ('rag:query' | 'rag:ingest' | 'rag:eval' | 'audit:read' | 'billing:read' | 'admin')[];
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
}

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  name: string;
  service: string;
  startTime: number;
  durationMs: number;
  status: 'ok' | 'error' | 'quarantined';
  attributes: Record<string, string | number | boolean>;
}

export interface TraceRecord {
  traceId: string;
  correlationId: string;
  tenantId: string;
  timestamp: string;
  query: string;
  totalDurationMs: number;
  status: 'ok' | 'degraded' | 'quarantined';
  spans: TraceSpan[];
}

export interface TenantTelemetryPoint {
  timestamp: string;
  timeLabel: string;
  tenantId: string;
  qps: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errorRate: number; // 0-100 %
  tokensPerSec: number;
  cacheHitRate: number; // 0-100 %
}

export interface BillingUsage {
  tenantId: string;
  billingPeriod: string;
  baseFee: number;
  inputTokens: number;
  inputTokenCost: number;
  outputTokens: number;
  outputTokenCost: number;
  nliChecks: number;
  nliCheckCost: number;
  vectorStorageGb: number;
  vectorStorageCost: number;
  totalCurrentMonth: number;
  spendingLimit: number;
  creditBalance: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  lineItems: {
    description: string;
    quantity: string | number;
    unitPrice: number;
    total: number;
  }[];
}

