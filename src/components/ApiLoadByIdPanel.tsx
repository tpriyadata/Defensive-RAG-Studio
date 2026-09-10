import React, { useState } from 'react';
import {
  Search,
  Database,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
} from 'lucide-react';
import { DocumentChunk, SupportedIdType, ApiLoadByIdResult } from '../types';

interface ApiLoadByIdPanelProps {
  onAddDocument: (doc: DocumentChunk) => void;
  rateLimiterEnabled?: boolean;
}

interface IdPreset {
  id: string;
  type: SupportedIdType;
  label: string;
  badge: string;
  description: string;
}

const ID_PRESETS: IdPreset[] = [
  {
    id: '31535829',
    type: 'pmid',
    label: 'DAPA-HF SGLT2 Trial',
    badge: 'PMID: 31535829',
    description: 'Dapagliflozin in HFrEF mortality reduction (N Engl J Med)',
  },
  {
    id: 'NCT03819153',
    type: 'nct',
    label: 'FLOW Semaglutide Trial',
    badge: 'NCT03819153',
    description: 'Renal outcomes in Type 2 Diabetes and CKD (ClinicalTrials.gov)',
  },
  {
    id: '10.1056/NEJMoa1911303',
    type: 'doi',
    label: 'DAPA-HF Digital Object Identifier',
    badge: 'DOI: 10.1056/...',
    description: 'Official publisher DOI resolution for DAPA-HF primary paper',
  },
  {
    id: 'NCT04381936',
    type: 'nct',
    label: 'RECOVERY Platform Trial',
    badge: 'NCT04381936',
    description: 'Tocilizumab in hospitalized hypoxic patients (Lancet)',
  },
  {
    id: 'aha-hf-2026',
    type: 'corpus_id',
    label: 'AHA/ACC GDMT 4 Pillars',
    badge: 'Corpus: aha-hf-2026',
    description: 'Guideline-Directed Medical Therapy quadruple regimen',
  },
  {
    id: 'raft-consensus',
    type: 'corpus_id',
    label: 'Raft Distributed Consensus',
    badge: 'Corpus: raft-consensus',
    description: 'Leader election and log replication quorum safety',
  },
];

export const ApiLoadByIdPanel: React.FC<ApiLoadByIdPanelProps> = ({
  onAddDocument,
  rateLimiterEnabled = true,
}) => {
  // Input State
  const [selectedIdType, setSelectedIdType] = useState<SupportedIdType>('auto');
  const [idInput, setIdInput] = useState('31535829');
  const [minReliability, setMinReliability] = useState(0.95);
  const [enrichMetadata, setEnrichMetadata] = useState(true);
  const [useVirtualQueue, setUseVirtualQueue] = useState(rateLimiterEnabled);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [loadResult, setLoadResult] = useState<ApiLoadByIdResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);

  // Dynamic placeholder based on selected ID type
  const getPlaceholder = (type: SupportedIdType) => {
    switch (type) {
      case 'pmid':
        return 'e.g., 31535829 or 38780522 (4-9 digits)';
      case 'nct':
        return 'e.g., NCT03036150 or NCT03819153';
      case 'doi':
        return 'e.g., 10.1056/NEJMoa1911303';
      case 'corpus_id':
        return 'e.g., dapa-hf, flow-trial, aha-hf-2026, raft-consensus';
      case 'auto':
      default:
        return 'Enter PMID, NCT ID, DOI, or Corpus ID (Smart auto-detected)';
    }
  };

  // Perform API Load
  const handleApiLoad = async (overrideId?: string, overrideType?: SupportedIdType) => {
    const targetId = (overrideId ?? idInput).trim();
    const targetType = overrideType ?? selectedIdType;

    if (!targetId) {
      setErrorMessage('Please enter an ID or select one of the presets.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadResult(null);
    setAddedSuccess(false);

    try {
      const response = await fetch('/api/rag/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetId,
          idType: targetType,
          rateLimited: useVirtualQueue,
          minReliability,
          enrichMetadata,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `HTTP ${response.status}: Failed to resolve document by ID`);
      }

      setLoadResult(data as ApiLoadByIdResult);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while loading document by ID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: IdPreset) => {
    setSelectedIdType(preset.type);
    setIdInput(preset.id);
    handleApiLoad(preset.id, preset.type);
  };

  const handleAddToCorpus = () => {
    if (loadResult?.chunk) {
      onAddDocument(loadResult.chunk);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  };

  const curlCommand = `curl -X POST http://localhost:3000/api/rag/load \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "${idInput.trim() || '31535829'}",
    "idType": "${selectedIdType}",
    "rateLimited": ${useVirtualQueue},
    "minReliability": ${minReliability},
    "enrichMetadata": ${enrichMetadata}
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header & Description */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">API Document Loader with ID Options</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold">
                  POST /api/rag/load
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Load documents programmatically using multiple ID standards (PMID, ClinicalTrials.gov NCT, DOI, or Internal Corpus Key).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowApiDocs(!showApiDocs)}
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs shrink-0 font-medium transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showApiDocs ? 'Hide cURL' : 'Show cURL'}</span>
            {showApiDocs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable cURL Preview */}
        {showApiDocs && (
          <div className="mt-3 pt-3 border-t border-blue-200/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-700">cURL API Ingestion Command</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded font-mono transition-colors"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
              {curlCommand}
            </pre>
          </div>
        )}
      </div>

      {/* Preset Quick Selectors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Quick ID Options Presets
          </span>
          <span className="text-[11px] text-slate-500">Click any preset to resolve via API</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ID_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-2.5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                    {preset.label}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-800 border border-slate-200 shrink-0">
                    {preset.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
              </div>
              <div className="mt-1.5 text-[10px] font-mono text-blue-600 font-medium truncate">
                {preset.badge}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Row 1: ID Options Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            1. Select ID Type Option (<code className="text-blue-600 font-mono">idType</code>)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { type: 'auto' as SupportedIdType, label: 'Auto-Detect', desc: 'Smart resolution' },
              { type: 'pmid' as SupportedIdType, label: 'PubMed ID', desc: 'NCBI 4-9 digits' },
              { type: 'nct' as SupportedIdType, label: 'ClinicalTrials', desc: 'NCT Identifier' },
              { type: 'doi' as SupportedIdType, label: 'DOI Identifier', desc: 'Publisher DOI' },
              { type: 'corpus_id' as SupportedIdType, label: 'Corpus Key', desc: 'Curated Slug' },
            ].map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => setSelectedIdType(option.type)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  selectedIdType === option.type
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{option.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Target ID Input Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            2. Enter Target Identifier (<code className="text-blue-600 font-mono">id</code>)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApiLoad()}
                placeholder={getPlaceholder(selectedIdType)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              disabled={isLoading || !idInput.trim()}
              onClick={() => handleApiLoad()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading API...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Load by ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 3: Config Options (Rate Limiter, Reliability, Enrichment) */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Virtual Queue / Rate Limiter */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold text-slate-800 block">NCBI Virtual Queue</span>
              <span className="text-[10px] text-slate-500">Pace 3 req/s (prevent 429)</span>
            </div>
            <input
              type="checkbox"
              checked={useVirtualQueue}
              onChange={(e) => setUseVirtualQueue(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          {/* Min Reliability */}
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-800">Min Reliability</span>
              <span className="font-mono text-blue-600 font-bold">{(minReliability * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.70"
              max="1.0"
              step="0.05"
              value={minReliability}
              onChange={(e) => setMinReliability(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Metadata Enrichment */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold text-slate-800 block">MeSH & Checksums</span>
              <span className="text-[10px] text-slate-500">Extract MeSH and SHA-256</span>
            </div>
            <input
              type="checkbox"
              checked={enrichMetadata}
              onChange={(e) => setEnrichMetadata(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Resolution Failed: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Loading Document Success / Result Card */}
      {loadResult && loadResult.chunk && (
        <div className="bg-white border border-emerald-300 rounded-2xl p-4 shadow-sm space-y-3 animate-fadeIn">
          {/* Success Banner */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800">
                    Document Resolved & Verified via API
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Type: {loadResult.idTypeDetected.toUpperCase()}
                  </span>
                  {loadResult.sourceDetails?.peerReviewed && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Peer-Reviewed
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Provider: {loadResult.sourceDetails?.provider || 'Verified Literature'} | Origin: {loadResult.sourceDetails?.origin || 'Medical Journal'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCorpus}
              disabled={addedSuccess}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Active Corpus!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Add to Active Corpus</span>
                </>
              )}
            </button>
          </div>

          {/* Document Content & Metadata */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 text-sm">{loadResult.chunk.title}</div>
            <div className="text-slate-500 font-mono text-[11px]">{loadResult.chunk.source}</div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
              {loadResult.chunk.content}
            </div>

            {/* Badges and Technical Specifications */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {loadResult.resolvedIdentifier.pmid && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px]">
                  PMID: {loadResult.resolvedIdentifier.pmid}
                </span>
              )}
              {loadResult.resolvedIdentifier.nct && (
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px]">
                  NCT: {loadResult.resolvedIdentifier.nct}
                </span>
              )}
              {loadResult.resolvedIdentifier.doi && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px]">
                  DOI: {loadResult.resolvedIdentifier.doi}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]">
                Reliability: {(loadResult.chunk.reliability * 100).toFixed(0)}%
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                Tokens: ~{loadResult.chunk.metadata?.tokenCount || 100}
              </span>
              {loadResult.rateLimiting?.applied && (
                <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono text-[10px]">
                  Virtual Queue: 3 req/s paced
                </span>
              )}
            </div>

            {/* MeSH Terms */}
            {loadResult.chunk.metadata?.meshTerms && loadResult.chunk.metadata.meshTerms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] font-semibold text-slate-400">MeSH Terms:</span>
                {loadResult.chunk.metadata.meshTerms.map((mesh, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {mesh}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
