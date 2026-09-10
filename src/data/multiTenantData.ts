import { 
  Tenant, 
  AuthUser, 
  ApiKey, 
  TenantTelemetryPoint, 
  TraceRecord, 
  BillingUsage, 
  Invoice 
} from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_mayo_health',
    name: 'Mayo Clinic Health Network',
    slug: 'mayo-health',
    tier: 'enterprise_healthcare',
    tierLabel: 'Enterprise Healthcare (HIPAA)',
    vectorNamespace: 'chroma-ns-mayo-phi-01',
    qpsLimit: 120,
    monthlyTokenQuota: 10000000,
    tokensUsedThisMonth: 6420500,
    queriesThisMonth: 284100,
    hipaaCompliant: true,
    byokEnabled: true,
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
    primaryColor: '#0284c7', // Sky 600
    logoInitials: 'MC'
  },
  {
    id: 'tenant_fintech_wealth',
    name: 'Apex Global Wealth Management',
    slug: 'apex-wealth',
    tier: 'pro',
    tierLabel: 'Financial Services Pro (SOC-2)',
    vectorNamespace: 'qdrant-ns-apex-sec-04',
    qpsLimit: 60,
    monthlyTokenQuota: 4000000,
    tokensUsedThisMonth: 2180400,
    queriesThisMonth: 94800,
    hipaaCompliant: false,
    byokEnabled: true,
    status: 'active',
    createdAt: '2026-03-01T10:30:00Z',
    primaryColor: '#059669', // Emerald 600
    logoInitials: 'AW'
  },
  {
    id: 'tenant_cloudscale_dev',
    name: 'CloudScale AI Research Labs',
    slug: 'cloudscale-dev',
    tier: 'developer',
    tierLabel: 'Developer Sandbox (Shared)',
    vectorNamespace: 'pgvector-shared-cluster-09',
    qpsLimit: 15,
    monthlyTokenQuota: 1000000,
    tokensUsedThisMonth: 780200,
    queriesThisMonth: 29500,
    hipaaCompliant: false,
    byokEnabled: false,
    status: 'active',
    createdAt: '2026-06-12T14:15:00Z',
    primaryColor: '#8b5cf6', // Violet 500
    logoInitials: 'CS'
  }
];

export const INITIAL_USERS: AuthUser[] = [
  {
    id: 'usr_mayo_01',
    email: 'dr.sarah.chen@mayoclinic.org',
    name: 'Dr. Sarah Chen, MD, PhD',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    tenantId: 'tenant_mayo_health',
    role: 'ORG_ADMIN',
    roleLabel: 'Organization Admin & Chief Medical Reviewer',
    permissions: ['tenant:manage', 'rag:query', 'rag:eval', 'rag:override_quarantine', 'billing:view', 'keys:manage'],
    mfaEnabled: true,
    lastLogin: 'Just now'
  },
  {
    id: 'usr_apex_01',
    email: 'marcus.vance@apexwealth.com',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    tenantId: 'tenant_fintech_wealth',
    role: 'MLOPS_ENGINEER',
    roleLabel: 'Lead MLOps Architect',
    permissions: ['rag:query', 'rag:eval', 'circuit_breaker:manage', 'cache:purge', 'keys:read'],
    mfaEnabled: true,
    lastLogin: '2 hours ago'
  },
  {
    id: 'usr_cloudscale_01',
    email: 'elena.rostova@cloudscale.ai',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    tenantId: 'tenant_cloudscale_dev',
    role: 'CLINICAL_REVIEWER',
    roleLabel: 'Data Scientist & Benchmark Lead',
    permissions: ['rag:query', 'rag:eval', 'benchmark:run'],
    mfaEnabled: false,
    lastLogin: 'Yesterday'
  }
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key_live_mayo_prod',
    name: 'Production Ingestion & Query Ingress',
    prefix: 'sk_live_mayo',
    fullKeyMasked: 'sk_live_mayo_89f92...b84c',
    tenantId: 'tenant_mayo_health',
    createdBy: 'dr.sarah.chen@mayoclinic.org',
    createdAt: '2026-06-01T00:00:00Z',
    lastUsedAt: '2 mins ago',
    expiresAt: '2027-06-01T00:00:00Z',
    scopes: ['rag:query', 'rag:ingest', 'rag:eval'],
    rateLimitPerMin: 1200,
    status: 'active'
  },
  {
    id: 'key_live_mayo_audit',
    name: 'Epic EHR & HL7 Fast Healthcare FHIR Syncer',
    prefix: 'sk_live_mayo',
    fullKeyMasked: 'sk_live_mayo_24e10...77df',
    tenantId: 'tenant_mayo_health',
    createdBy: 'dr.sarah.chen@mayoclinic.org',
    createdAt: '2026-07-15T00:00:00Z',
    lastUsedAt: '12 mins ago',
    expiresAt: '2027-07-15T00:00:00Z',
    scopes: ['rag:query', 'audit:read'],
    rateLimitPerMin: 600,
    status: 'active'
  },
  {
    id: 'key_live_apex_prod',
    name: 'Bloomberg Terminal RRF Query Bridge',
    prefix: 'sk_live_apex',
    fullKeyMasked: 'sk_live_apex_33d71...e981',
    tenantId: 'tenant_fintech_wealth',
    createdBy: 'marcus.vance@apexwealth.com',
    createdAt: '2026-08-01T00:00:00Z',
    lastUsedAt: '5 mins ago',
    expiresAt: null,
    scopes: ['rag:query'],
    rateLimitPerMin: 800,
    status: 'active'
  }
];

export const TENANT_TELEMETRY: Record<string, TenantTelemetryPoint[]> = {
  tenant_mayo_health: [
    { timestamp: '2026-09-10T12:00:00Z', timeLabel: '12:00', tenantId: 'tenant_mayo_health', qps: 42, p50Ms: 240, p95Ms: 510, p99Ms: 620, errorRate: 0.02, tokensPerSec: 1840, cacheHitRate: 84 },
    { timestamp: '2026-09-10T12:10:00Z', timeLabel: '12:10', tenantId: 'tenant_mayo_health', qps: 58, p50Ms: 260, p95Ms: 530, p99Ms: 640, errorRate: 0.01, tokensPerSec: 2490, cacheHitRate: 88 },
    { timestamp: '2026-09-10T12:20:00Z', timeLabel: '12:20', tenantId: 'tenant_mayo_health', qps: 79, p50Ms: 280, p95Ms: 550, p99Ms: 680, errorRate: 0.04, tokensPerSec: 3410, cacheHitRate: 82 },
    { timestamp: '2026-09-10T12:30:00Z', timeLabel: '12:30', tenantId: 'tenant_mayo_health', qps: 94, p50Ms: 310, p95Ms: 580, p99Ms: 710, errorRate: 0.03, tokensPerSec: 4120, cacheHitRate: 89 },
    { timestamp: '2026-09-10T12:40:00Z', timeLabel: '12:40', tenantId: 'tenant_mayo_health', qps: 88, p50Ms: 290, p95Ms: 540, p99Ms: 670, errorRate: 0.02, tokensPerSec: 3880, cacheHitRate: 91 },
    { timestamp: '2026-09-10T12:50:00Z', timeLabel: '12:50', tenantId: 'tenant_mayo_health', qps: 104, p50Ms: 320, p95Ms: 590, p99Ms: 730, errorRate: 0.01, tokensPerSec: 4560, cacheHitRate: 93 },
    { timestamp: '2026-09-10T13:00:00Z', timeLabel: '13:00', tenantId: 'tenant_mayo_health', qps: 112, p50Ms: 340, p95Ms: 610, p99Ms: 750, errorRate: 0.02, tokensPerSec: 4920, cacheHitRate: 90 }
  ],
  tenant_fintech_wealth: [
    { timestamp: '2026-09-10T12:00:00Z', timeLabel: '12:00', tenantId: 'tenant_fintech_wealth', qps: 18, p50Ms: 210, p95Ms: 440, p99Ms: 530, errorRate: 0.01, tokensPerSec: 920, cacheHitRate: 76 },
    { timestamp: '2026-09-10T12:10:00Z', timeLabel: '12:10', tenantId: 'tenant_fintech_wealth', qps: 24, p50Ms: 220, p95Ms: 460, p99Ms: 550, errorRate: 0.02, tokensPerSec: 1150, cacheHitRate: 79 },
    { timestamp: '2026-09-10T12:20:00Z', timeLabel: '12:20', tenantId: 'tenant_fintech_wealth', qps: 38, p50Ms: 245, p95Ms: 490, p99Ms: 590, errorRate: 0.03, tokensPerSec: 1820, cacheHitRate: 83 },
    { timestamp: '2026-09-10T12:30:00Z', timeLabel: '12:30', tenantId: 'tenant_fintech_wealth', qps: 45, p50Ms: 260, p95Ms: 520, p99Ms: 620, errorRate: 0.01, tokensPerSec: 2190, cacheHitRate: 85 },
    { timestamp: '2026-09-10T12:40:00Z', timeLabel: '12:40', tenantId: 'tenant_fintech_wealth', qps: 52, p50Ms: 275, p95Ms: 540, p99Ms: 650, errorRate: 0.02, tokensPerSec: 2480, cacheHitRate: 82 },
    { timestamp: '2026-09-10T12:50:00Z', timeLabel: '12:50', tenantId: 'tenant_fintech_wealth', qps: 48, p50Ms: 265, p95Ms: 530, p99Ms: 630, errorRate: 0.01, tokensPerSec: 2310, cacheHitRate: 86 },
    { timestamp: '2026-09-10T13:00:00Z', timeLabel: '13:00', tenantId: 'tenant_fintech_wealth', qps: 56, p50Ms: 280, p95Ms: 560, p99Ms: 670, errorRate: 0.02, tokensPerSec: 2750, cacheHitRate: 87 }
  ],
  tenant_cloudscale_dev: [
    { timestamp: '2026-09-10T12:00:00Z', timeLabel: '12:00', tenantId: 'tenant_cloudscale_dev', qps: 4, p50Ms: 190, p95Ms: 380, p99Ms: 460, errorRate: 0.05, tokensPerSec: 240, cacheHitRate: 64 },
    { timestamp: '2026-09-10T12:10:00Z', timeLabel: '12:10', tenantId: 'tenant_cloudscale_dev', qps: 7, p50Ms: 200, p95Ms: 410, p99Ms: 490, errorRate: 0.02, tokensPerSec: 390, cacheHitRate: 69 },
    { timestamp: '2026-09-10T12:20:00Z', timeLabel: '12:20', tenantId: 'tenant_cloudscale_dev', qps: 11, p50Ms: 220, p95Ms: 430, p99Ms: 510, errorRate: 0.03, tokensPerSec: 610, cacheHitRate: 72 },
    { timestamp: '2026-09-10T12:30:00Z', timeLabel: '12:30', tenantId: 'tenant_cloudscale_dev', qps: 14, p50Ms: 230, p95Ms: 450, p99Ms: 540, errorRate: 0.08, tokensPerSec: 740, cacheHitRate: 70 },
    { timestamp: '2026-09-10T12:40:00Z', timeLabel: '12:40', tenantId: 'tenant_cloudscale_dev', qps: 13, p50Ms: 225, p95Ms: 440, p99Ms: 530, errorRate: 0.04, tokensPerSec: 710, cacheHitRate: 74 },
    { timestamp: '2026-09-10T12:50:00Z', timeLabel: '12:50', tenantId: 'tenant_cloudscale_dev', qps: 12, p50Ms: 215, p95Ms: 430, p99Ms: 520, errorRate: 0.02, tokensPerSec: 680, cacheHitRate: 76 },
    { timestamp: '2026-09-10T13:00:00Z', timeLabel: '13:00', tenantId: 'tenant_cloudscale_dev', qps: 15, p50Ms: 240, p95Ms: 470, p99Ms: 560, errorRate: 0.06, tokensPerSec: 810, cacheHitRate: 75 }
  ]
};

export const RECENT_TRACES: TraceRecord[] = [
  {
    traceId: 'trace-mayo-9941a',
    correlationId: 'req-phi-84192',
    tenantId: 'tenant_mayo_health',
    timestamp: '2 mins ago',
    query: 'What was the primary composite outcome in DAPA-HF (PMID 31535829)?',
    totalDurationMs: 542,
    status: 'ok',
    spans: [
      { spanId: 'span-01', name: 'api_ingress_token_bucket', service: 'envoy-gateway', startTime: 0, durationMs: 14, status: 'ok', attributes: { tenant: 'mayo_health', rate_limit_remaining: 118 } },
      { spanId: 'span-02', parentSpanId: 'span-01', name: 'pydantic_schema_validation', service: 'defensive-ingress', startTime: 14, durationMs: 18, status: 'ok', attributes: { schema: 'ClinicalQueryRequestV2' } },
      { spanId: 'span-03', parentSpanId: 'span-02', name: 'hybrid_rrf_retrieval', service: 'vector-chroma-mayo', startTime: 32, durationMs: 185, status: 'ok', attributes: { top_k: 8, rrf_k: 60, vector_namespace: 'chroma-ns-mayo-phi-01' } },
      { spanId: 'span-04', parentSpanId: 'span-03', name: 'gemini_flash_synthesis', service: 'gemini-api', startTime: 217, durationMs: 210, status: 'ok', attributes: { model: 'gemini-2.5-flash', tokens: 490 } },
      { spanId: 'span-05', parentSpanId: 'span-04', name: 'nli_entailment_verifier', service: 'hallucination-guard', startTime: 427, durationMs: 95, status: 'ok', attributes: { claims_checked: 4, verified: 4, faithfulness: 0.995 } },
      { spanId: 'span-06', parentSpanId: 'span-05', name: 'egress_pydantic_serialization', service: 'defensive-egress', startTime: 522, durationMs: 20, status: 'ok', attributes: { valid: true } }
    ]
  },
  {
    traceId: 'trace-apex-8812c',
    correlationId: 'req-sec-51092',
    tenantId: 'tenant_fintech_wealth',
    timestamp: '7 mins ago',
    query: 'Evaluate risk weight capital requirement under Basel IV output floor.',
    totalDurationMs: 489,
    status: 'ok',
    spans: [
      { spanId: 'span-10', name: 'api_ingress_token_bucket', service: 'envoy-gateway', startTime: 0, durationMs: 12, status: 'ok', attributes: { tenant: 'apex_wealth' } },
      { spanId: 'span-11', parentSpanId: 'span-10', name: 'pydantic_schema_validation', service: 'defensive-ingress', startTime: 12, durationMs: 15, status: 'ok', attributes: { schema: 'FinQueryRequestV1' } },
      { spanId: 'span-12', parentSpanId: 'span-11', name: 'hybrid_rrf_retrieval', service: 'vector-qdrant-apex', startTime: 27, durationMs: 160, status: 'ok', attributes: { top_k: 6, vector_namespace: 'qdrant-ns-apex-sec-04' } },
      { spanId: 'span-13', parentSpanId: 'span-12', name: 'gemini_flash_synthesis', service: 'gemini-api', startTime: 187, durationMs: 220, status: 'ok', attributes: { model: 'gemini-2.5-flash', tokens: 410 } },
      { spanId: 'span-14', parentSpanId: 'span-13', name: 'nli_entailment_verifier', service: 'hallucination-guard', startTime: 407, durationMs: 65, status: 'ok', attributes: { claims_checked: 3, verified: 3, faithfulness: 0.985 } },
      { spanId: 'span-15', parentSpanId: 'span-14', name: 'egress_pydantic_serialization', service: 'defensive-egress', startTime: 472, durationMs: 17, status: 'ok', attributes: { valid: true } }
    ]
  },
  {
    traceId: 'trace-mayo-7731f',
    correlationId: 'req-phi-71083',
    tenantId: 'tenant_mayo_health',
    timestamp: '15 mins ago',
    query: 'Unverified dosage injection test for dapagliflozin in pediatric heart failure.',
    totalDurationMs: 380,
    status: 'quarantined',
    spans: [
      { spanId: 'span-20', name: 'api_ingress_token_bucket', service: 'envoy-gateway', startTime: 0, durationMs: 11, status: 'ok', attributes: { tenant: 'mayo_health' } },
      { spanId: 'span-21', parentSpanId: 'span-20', name: 'pydantic_schema_validation', service: 'defensive-ingress', startTime: 11, durationMs: 16, status: 'ok', attributes: { schema: 'ClinicalQueryRequestV2' } },
      { spanId: 'span-22', parentSpanId: 'span-21', name: 'hybrid_rrf_retrieval', service: 'vector-chroma-mayo', startTime: 27, durationMs: 170, status: 'ok', attributes: { top_k: 8 } },
      { spanId: 'span-23', parentSpanId: 'span-22', name: 'gemini_flash_synthesis', service: 'gemini-api', startTime: 197, durationMs: 110, status: 'ok', attributes: { model: 'gemini-2.5-flash' } },
      { spanId: 'span-24', parentSpanId: 'span-23', name: 'nli_entailment_verifier', service: 'hallucination-guard', startTime: 307, durationMs: 60, status: 'quarantined', attributes: { reason: 'Ungrounded pediatric claim flagged (0.78 score > 0.20 threshold)' } },
      { spanId: 'span-25', parentSpanId: 'span-24', name: 'quarantine_fallback_enforcer', service: 'defensive-egress', startTime: 367, durationMs: 13, status: 'ok', attributes: { action: 'quarantine_payload_returned' } }
    ]
  }
];

export const TENANT_BILLING_USAGE: Record<string, BillingUsage> = {
  tenant_mayo_health: {
    tenantId: 'tenant_mayo_health',
    billingPeriod: 'September 2026',
    baseFee: 2499.00, // Enterprise Healthcare Plan
    inputTokens: 4120500,
    inputTokenCost: 6.18, // $1.50 per 1M tokens
    outputTokens: 2300000,
    outputTokenCost: 6.90, // $3.00 per 1M tokens
    nliChecks: 284100,
    nliCheckCost: 426.15, // $0.0015 per NLI verification pass
    vectorStorageGb: 145.2,
    vectorStorageCost: 72.60, // $0.50 per GB-mo
    totalCurrentMonth: 3010.83,
    spendingLimit: 5000.00,
    creditBalance: 1250.00
  },
  tenant_fintech_wealth: {
    tenantId: 'tenant_fintech_wealth',
    billingPeriod: 'September 2026',
    baseFee: 499.00, // Pro Plan
    inputTokens: 1420000,
    inputTokenCost: 2.13,
    outputTokens: 760400,
    outputTokenCost: 2.28,
    nliChecks: 94800,
    nliCheckCost: 142.20,
    vectorStorageGb: 58.4,
    vectorStorageCost: 29.20,
    totalCurrentMonth: 674.81,
    spendingLimit: 1500.00,
    creditBalance: 200.00
  },
  tenant_cloudscale_dev: {
    tenantId: 'tenant_cloudscale_dev',
    billingPeriod: 'September 2026',
    baseFee: 0.00, // Developer Tier (Free)
    inputTokens: 520200,
    inputTokenCost: 0.78,
    outputTokens: 260000,
    outputTokenCost: 0.78,
    nliChecks: 29500,
    nliCheckCost: 44.25,
    vectorStorageGb: 12.1,
    vectorStorageCost: 6.05,
    totalCurrentMonth: 51.86,
    spendingLimit: 200.00,
    creditBalance: 50.00
  }
};

export const TENANT_INVOICES: Record<string, Invoice[]> = {
  tenant_mayo_health: [
    {
      id: 'inv_mayo_2026_08',
      tenantId: 'tenant_mayo_health',
      invoiceNumber: 'INV-2026-08-MYH',
      date: '2026-08-31',
      dueDate: '2026-09-30',
      amount: 2984.50,
      status: 'paid',
      paymentMethod: 'Corporate ACH Direct Debit (•••• 9104)',
      lineItems: [
        { description: 'Enterprise Healthcare Dedicated Tier (HIPAA BAA + 99.99% SLA)', quantity: 1, unitPrice: 2499.00, total: 2499.00 },
        { description: 'Natural Language Inference (NLI) Grounding Passes', quantity: '264,200 calls', unitPrice: 0.0015, total: 396.30 },
        { description: 'High-Availability Chroma Isolated Dedicated Cluster (140 GB)', quantity: '140 GB', unitPrice: 0.50, total: 70.00 },
        { description: 'Token Ingestion & Generation Usage (Gemini 2.5 Flash)', quantity: '5.8M tokens', unitPrice: 0.0000033, total: 19.20 }
      ]
    },
    {
      id: 'inv_mayo_2026_07',
      tenantId: 'tenant_mayo_health',
      invoiceNumber: 'INV-2026-07-MYH',
      date: '2026-07-31',
      dueDate: '2026-08-31',
      amount: 2890.10,
      status: 'paid',
      paymentMethod: 'Corporate ACH Direct Debit (•••• 9104)',
      lineItems: [
        { description: 'Enterprise Healthcare Dedicated Tier (HIPAA BAA + 99.99% SLA)', quantity: 1, unitPrice: 2499.00, total: 2499.00 },
        { description: 'Natural Language Inference (NLI) Grounding Passes', quantity: '215,000 calls', unitPrice: 0.0015, total: 322.50 },
        { description: 'High-Availability Chroma Isolated Dedicated Cluster (135 GB)', quantity: '135 GB', unitPrice: 0.50, total: 67.50 },
        { description: 'Token Ingestion & Generation Usage (Gemini 2.5 Flash)', quantity: '3.4M tokens', unitPrice: 0.0000033, total: 1.10 }
      ]
    }
  ],
  tenant_fintech_wealth: [
    {
      id: 'inv_apex_2026_08',
      tenantId: 'tenant_fintech_wealth',
      invoiceNumber: 'INV-2026-08-APX',
      date: '2026-08-31',
      dueDate: '2026-09-30',
      amount: 642.10,
      status: 'paid',
      paymentMethod: 'Amex Business Elite (•••• 4002)',
      lineItems: [
        { description: 'Financial Services Pro Tier Subscription', quantity: 1, unitPrice: 499.00, total: 499.00 },
        { description: 'NLI Entailment Grounding Checks', quantity: '78,400 calls', unitPrice: 0.0015, total: 117.60 },
        { description: 'Dedicated Qdrant Vector Partition (51 GB)', quantity: '51 GB', unitPrice: 0.50, total: 25.50 }
      ]
    }
  ],
  tenant_cloudscale_dev: [
    {
      id: 'inv_cs_2026_08',
      tenantId: 'tenant_cloudscale_dev',
      invoiceNumber: 'INV-2026-08-CSD',
      date: '2026-08-31',
      dueDate: '2026-09-30',
      amount: 38.40,
      status: 'paid',
      paymentMethod: 'Visa Debit (•••• 1189)',
      lineItems: [
        { description: 'Developer Tier Free Base Plan', quantity: 1, unitPrice: 0.00, total: 0.00 },
        { description: 'Overage NLI Calls (above 10k free tier)', quantity: '19,500 calls', unitPrice: 0.0015, total: 29.25 },
        { description: 'Additional Shared Storage overage (12 GB)', quantity: '12 GB', unitPrice: 0.50, total: 6.00 },
        { description: 'Excess Token Allowance (Gemini API)', quantity: '950k tokens', unitPrice: 0.0000033, total: 3.15 }
      ]
    }
  ]
};
