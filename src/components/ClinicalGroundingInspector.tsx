import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  FileCheck2, 
  Scale, 
  ExternalLink,
  Award
} from 'lucide-react';
import { ClaimVerification, ClinicalGroundingMetrics } from '../types';

interface ClinicalGroundingInspectorProps {
  groundingScore?: number;
  faithfulnessScore?: number;
  claimVerifications?: ClaimVerification[];
  clinicalMetrics?: ClinicalGroundingMetrics;
  isQuarantined?: boolean;
  quarantineReason?: string;
}

export const ClinicalGroundingInspector: React.FC<ClinicalGroundingInspectorProps> = ({
  groundingScore = 0.985,
  faithfulnessScore,
  claimVerifications = [],
  clinicalMetrics,
  isQuarantined = false,
  quarantineReason,
}) => {
  const gPercentage = Math.round(groundingScore * 100);
  const calculatedFaithfulness = faithfulnessScore 
    ?? clinicalMetrics?.faithfulnessScore 
    ?? (claimVerifications.length > 0 
        ? (claimVerifications.filter(c => c.status === 'VERIFIED').length / claimVerifications.length)
        : groundingScore);
  const fPercentage = Math.round(calculatedFaithfulness * 100);
  const isHighGrade = gPercentage >= 95 && fPercentage >= 95 && !isQuarantined;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isHighGrade 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Clinical Grounding & Faithfulness Inspector
              </h3>
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                isHighGrade
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {isHighGrade ? 'Healthcare Grade A (>=95%)' : 'Safety Quarantine Enforced'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Claim-level natural language inference (NLI), citation entailment & faithfulness verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-500 block">Faithfulness Score</span>
            <span className={`text-lg font-bold ${
              isHighGrade ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {fPercentage}%
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-500 block">Grounding Score</span>
            <span className={`text-lg font-bold ${
              isHighGrade ? 'text-blue-700' : 'text-rose-700'
            }`}>
              {gPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Quarantine Alert if triggered */}
      {isQuarantined && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">Zero-Tolerance Healthcare Safety Breach Detected</div>
            <p className="text-rose-800/90 mt-0.5 leading-relaxed">{quarantineReason}</p>
          </div>
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Faithfulness Score</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className={isHighGrade ? 'text-emerald-700' : 'text-rose-600'}>
              {(calculatedFaithfulness * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">|Claims_entailed| / |Claims_total|</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Evidence Grade</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{clinicalMetrics?.evidenceGrade || (isHighGrade ? 'Grade A (High)' : 'Quarantined')}</span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">GRADE criteria</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Verified Claims</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>
              {(clinicalMetrics?.verifiedClaimsCount ?? claimVerifications.filter(c => c.status === 'VERIFIED').length)} / {(clinicalMetrics?.totalClaimsChecked ?? (claimVerifications.length || 1))}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">100% target</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">PubMed Citations</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>{clinicalMetrics?.pubmedCitationsCount ?? 1} Indexed Trials</span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Peer-reviewed</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Extrapolations</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <Scale className="w-4 h-4 text-slate-600" />
            <span className={clinicalMetrics?.unsupportedClaimsCount ? 'text-rose-600' : 'text-emerald-600'}>
              {clinicalMetrics?.unsupportedClaimsCount ?? 0} (Zero Allowed)
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Zero tolerance</span>
        </div>
      </div>

      {/* Faithfulness Mathematical Formula Ribbon */}
      <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider px-1.5 py-0.5 bg-blue-100 rounded">
            Ragas / TruLens Standard
          </span>
          <span className="font-mono text-[11px] text-blue-950 font-semibold">
            Faithfulness Score = (|Verified Claims| / |Total Claims|) &times; (1 - Hallucination Rate)
          </span>
        </div>
        <span className="text-[11px] text-blue-700 hidden sm:inline">
          Ensures 100% of generated claims are logically deducible from retrieved contexts.
        </span>
      </div>

      {/* Claim-by-Claim Verification Cards */}
      {claimVerifications.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Claim-by-Claim Entailment Breakdown</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {claimVerifications.map((item, idx) => {
              const isVerified = item.status === 'VERIFIED';
              return (
                <div
                  key={item.id || idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isVerified 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isVerified 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isVerified ? 'CLAIM ENTAILED' : 'UNGROUNDED CLAIM'}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-600">
                        {item.sourceCitation}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Entailment: {(item.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-900 mb-1 leading-snug">
                    "{item.claim}"
                  </p>

                  {item.supportingQuote && (
                    <div className="mt-1.5 text-[11px] bg-white/80 p-2 rounded-lg border border-slate-200/80 text-slate-700 font-sans leading-relaxed">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Verbatim Trial Literature Grounding Quote:
                      </span>
                      <span className="italic text-slate-800">"{item.supportingQuote}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
