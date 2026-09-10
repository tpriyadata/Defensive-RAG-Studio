import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Terminal, 
  Clock, 
  Eye, 
  EyeOff, 
  FileText,
  BadgeCheck,
  Fingerprint
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { UserRole, ApiKey } from '../types';

export const AuthRbacControl: React.FC = () => {
  const { 
    currentUser, 
    activeTenant, 
    apiKeys, 
    switchUserRole, 
    createApiKey, 
    revokeApiKey 
  } = useTenantAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<ApiKey['scopes']>(['rag:query', 'rag:eval']);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(600);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showJwtPayload, setShowJwtPayload] = useState(false);

  const availableRoles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'ORG_ADMIN', title: 'Organization Admin', desc: 'Full workspace authority, user management, billing & API keys' },
    { role: 'CLINICAL_REVIEWER', title: 'Chief Medical / Domain Reviewer', desc: 'Querying, clinical grounding inspection & quarantine override' },
    { role: 'MLOPS_ENGINEER', title: 'Lead MLOps Architect', desc: 'Model routing, latency budgets, circuit breaker & cache policies' },
    { role: 'AUDITOR', title: 'Compliance & SEC Auditor', desc: 'Read-only access to audit logs, traces, invoices & telemetry' },
  ];

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const res = createApiKey(newKeyName.trim(), newKeyScopes, newKeyRateLimit);
    setCreatedSecret(res.rawSecretToken);
    setNewKeyName('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const toggleScope = (scope: any) => {
    if (newKeyScopes.includes(scope)) {
      setNewKeyScopes(newKeyScopes.filter(s => s !== scope));
    } else {
      setNewKeyScopes([...newKeyScopes, scope]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              <KeyRound className="w-3.5 h-3.5" />
              Identity & Access Management (IAM)
            </span>
            <span className="text-xs text-slate-500">
              Role-Based Access Control (RBAC) & Scoped API Credentials
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Authentication, RBAC & API Keys</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Configure fine-grained permissions, inspect cryptographic JWT session tokens, and provision scoped 
            programmatic API keys for automated ingestion and agentic query egress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Scoped API Key</span>
        </button>
      </div>

      {/* Active User Session & JWT Claim Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Authenticated Persona
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              MFA Hardware Verified
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                <span>{currentUser.roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Simulate Role / Persona Switch:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {availableRoles.map(r => (
                <button
                  key={r.role}
                  onClick={() => switchUserRole(r.role)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all truncate ${
                    currentUser.role === r.role
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                  title={r.desc}
                >
                  {r.title}
                </button>
              ))}
            </div>
          </div>

          {/* JWT Inspector Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowJwtPayload(!showJwtPayload)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-indigo-500" />
                <span>{showJwtPayload ? 'Hide Decoded JWT Claims' : 'Inspect Decoded JWT Session Token'}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">RS256</span>
            </button>

            {showJwtPayload && (
              <div className="mt-2 p-3 bg-slate-950 text-slate-300 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 space-y-1">
                <div className="text-purple-400 font-bold">// Decoded JWT Claims Payload</div>
                <div>{`{`}</div>
                <div className="pl-3 text-slate-400">"iss": <span className="text-emerald-400">"https://auth.defensive-rag.internal"</span>,</div>
                <div className="pl-3 text-slate-400">"sub": <span className="text-cyan-400">"{currentUser.id}"</span>,</div>
                <div className="pl-3 text-slate-400">"tenant_id": <span className="text-amber-400">"{activeTenant.id}"</span>,</div>
                <div className="pl-3 text-slate-400">"role": <span className="text-indigo-400">"{currentUser.role}"</span>,</div>
                <div className="pl-3 text-slate-400">"vector_namespace": <span className="text-emerald-400">"{activeTenant.vectorNamespace}"</span>,</div>
                <div className="pl-3 text-slate-400">"mfa_verified": <span className="text-sky-400">true</span>,</div>
                <div className="pl-3 text-slate-400">"exp": <span className="text-amber-400">1789045200</span></div>
                <div>{`}`}</div>
              </div>
            )}
          </div>
        </div>

        {/* RBAC Permission Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Enterprise Policy v3.2
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">System Permission</th>
                  <th className="py-2.5 px-2 text-center">Org Admin</th>
                  <th className="py-2.5 px-2 text-center">Clinical Reviewer</th>
                  <th className="py-2.5 px-2 text-center">MLOps Eng</th>
                  <th className="py-2.5 px-2 text-center">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-medium">RAG Query Ingress & Synthesis</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">NLI Entailment & Grounding Verification</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Quarantine Override & Adjudication</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Circuit Breaker & Cache Policy Tuning</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">API Key Generation & Scoping</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">BYOK & Encryption Key Rotation</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Billing, Invoices & Quota Expansion</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">&mdash;</td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">&#10003;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Programmatic API Keys Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Scoped API Credentials ({activeTenant.name})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Credentials restricted exclusively to namespace <span className="font-mono text-slate-700 font-semibold">{activeTenant.vectorNamespace}</span>
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {apiKeys.length} Keys Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Key Name</th>
                <th className="py-3 px-3">Token Mask</th>
                <th className="py-3 px-3">Granted Scopes</th>
                <th className="py-3 px-3">Rate Limit</th>
                <th className="py-3 px-3">Last Used</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No active API keys found for this workspace. Click "Provision Scoped API Key" above.
                  </td>
                </tr>
              ) : (
                apiKeys.map(key => (
                  <tr key={key.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{key.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Created by {key.createdBy}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                      {key.fullKeyMasked}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map(s => (
                          <span 
                            key={s} 
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-[10px] px-1.5 py-0.2 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      {key.rateLimitPerMin} req/min
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {key.lastUsedAt || 'Never'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                        key.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${key.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {key.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {key.status === 'active' ? (
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <span>Provision Scoped API Token</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Workspace target: <span className="font-semibold text-slate-800">{activeTenant.name}</span>
            </p>

            {createdSecret ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>API Key Generated Successfully</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Make sure to copy your API secret now. For security purposes, you will not be able to view it again.
                  </p>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-300 font-mono text-xs text-slate-800">
                    <span className="truncate mr-2 font-bold">{createdSecret}</span>
                    <button
                      onClick={() => copyToClipboard(createdSecret)}
                      className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
                    >
                      {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCreatedSecret(null);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Description / Client Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EHR Ingestion Worker / EMR Hook"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Scopes
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'rag:query', label: 'rag:query (Inference)' },
                      { id: 'rag:ingest', label: 'rag:ingest (Chunk writes)' },
                      { id: 'rag:eval', label: 'rag:eval (NLI entailment)' },
                      { id: 'audit:read', label: 'audit:read (Logs)' },
                    ].map(scope => (
                      <label 
                        key={scope.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                          newKeyScopes.includes(scope.id as any) 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope.id as any)}
                          onChange={() => toggleScope(scope.id)}
                          className="accent-indigo-600 rounded"
                        />
                        <span className="font-mono text-[11px]">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Rate Limit Ceiling</span>
                    <span className="font-mono text-indigo-600 font-bold">{newKeyRateLimit} req/min</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="3000"
                    step="60"
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-xs"
                  >
                    Generate API Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
