import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Printer, 
  X,
  Layers,
  HardDrive
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { TENANT_BILLING_USAGE, TENANT_INVOICES } from '../data/multiTenantData';
import { Invoice } from '../types';

export const BillingUsageDashboard: React.FC = () => {
  const { activeTenant, addQuotaTopUp } = useTenantAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  const usage = TENANT_BILLING_USAGE[activeTenant.id] || TENANT_BILLING_USAGE['tenant_mayo_health'];
  const invoices = TENANT_INVOICES[activeTenant.id] || TENANT_INVOICES['tenant_mayo_health'];

  const spendPct = Math.min(100, Math.round((usage.totalCurrentMonth / usage.spendingLimit) * 100));

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    addQuotaTopUp(topUpAmount);
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setIsTopUpOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              <CreditCard className="w-3.5 h-3.5" />
              Stripe Metered Billing Engine
            </span>
            <span className="text-xs text-slate-500">
              Sub-cent Micro-billing & Quota Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Usage Metering, Quotas & Invoices</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Real-time tracking of NLI claim verification passes, vector partition footprint, and token consumption 
            with automated monthly invoice generation and Stripe customer portal integration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Top Up Quota Credits</span>
          </button>
        </div>
      </div>

      {/* Spend & Quota Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Current Cycle Spend
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ${usage.totalCurrentMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cycle: <span className="font-semibold text-slate-700">{usage.billingPeriod}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Budget Spending Cap
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ${usage.spendingLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {spendPct}% allocated ({100 - spendPct}% headroom)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Available Credit Balance
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ${usage.creditBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Auto-deducted before card charge
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Active Tier
          </span>
          <div className="text-lg font-bold text-indigo-700 truncate">
            {activeTenant.tierLabel}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Base: ${usage.baseFee}/mo · 99.99% SLA
          </div>
        </div>
      </div>

      {/* Itemized Usage Metering & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Usage Meter breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Metered Usage Breakdown ({activeTenant.name})</span>
              </h3>
              <p className="text-xs text-slate-500">Live aggregated meters calculated at current billing epoch</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              Invoice #{invoices[0]?.invoiceNumber || 'PENDING'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Base Platform Subscription */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  Base Tier Allocation ({activeTenant.tierLabel})
                </span>
                <span className="text-slate-500">Includes dedicated high-availability VPC ingress, HIPAA BAA and 24/7 on-call SLA</span>
              </div>
              <div className="text-right font-mono text-sm font-bold text-slate-900">
                ${usage.baseFee.toFixed(2)}
              </div>
            </div>

            {/* NLI Fact-Checking Meter */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Natural Language Inference (NLI) Grounding Passes
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-1.5 py-0.2 rounded">
                    $0.0015 / check
                  </span>
                </div>
                <span className="text-slate-500">
                  {usage.nliChecks.toLocaleString()} atomic clinical claims verified against PubMed & ground truth
                </span>
              </div>
              <div className="text-right font-mono text-sm font-bold text-slate-900">
                ${usage.nliCheckCost.toFixed(2)}
              </div>
            </div>

            {/* Dedicated Vector Storage Partition */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Isolated Vector Cluster Partition ({usage.vectorStorageGb} GB)
                  </span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-mono px-1.5 py-0.2 rounded">
                    $0.50 / GB-mo
                  </span>
                </div>
                <span className="text-slate-500">
                  Assigned namespace: <code className="font-mono text-slate-700">{activeTenant.vectorNamespace}</code> with NVMe SSD backing
                </span>
              </div>
              <div className="text-right font-mono text-sm font-bold text-slate-900">
                ${usage.vectorStorageCost.toFixed(2)}
              </div>
            </div>

            {/* Token Generation Meter */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  Gemini API Generation & Embedding Throughput
                </span>
                <span className="text-slate-500 block">
                  {(usage.inputTokens / 1000000).toFixed(2)}M prompt tokens · {(usage.outputTokens / 1000000).toFixed(2)}M synthesis tokens
                </span>
              </div>
              <div className="text-right font-mono text-sm font-bold text-slate-900">
                ${(usage.inputTokenCost + usage.outputTokenCost).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900">Current Balance Due at Cycle End:</span>
            <span className="text-xl font-bold text-indigo-700 font-mono">
              ${usage.totalCurrentMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right Col: Spending Limit Progress & Payment Method */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Budget Spending Guard</span>
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Budget Limit Allocated</span>
                <span className="font-mono text-slate-900">{spendPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    spendPct > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${spendPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>${usage.totalCurrentMonth.toFixed(2)} billed</span>
                <span>${usage.spendingLimit.toFixed(2)} cap</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If metered usage reaches 95% of the spending cap, automated alerts are dispatched to <code className="text-indigo-600 font-mono">dr.sarah.chen@mayoclinic.org</code> to prevent unexpected throttling.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Default Payment Method
            </span>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-[10px]">
                  ACH
                </div>
                <div>
                  <div className="font-bold text-slate-900">Corporate Wells Fargo ACH</div>
                  <div className="text-slate-500 text-[11px]">Routing: •••• 9104 · Verified</div>
                </div>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                Primary
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>Billing Invoices & Receipts</span>
            </h3>
            <p className="text-xs text-slate-500">Historical statements with downloadable audit documentation</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Invoice ID</th>
                <th className="py-3 px-3">Billing Date</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{inv.date}</td>
                  <td className="py-3 px-3 text-slate-600">{inv.dueDate}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{inv.paymentMethod}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Paid
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1 ml-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Statement</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedInvoice.invoiceNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Billed To:</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{activeTenant.name}</div>
                <div className="text-slate-500">Tenant ID: {activeTenant.id}</div>
                <div className="text-slate-500">Tax ID: US-EIN 41-0712901</div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold block">Issued By:</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">Defensive RAG Studio, Inc.</div>
                <div className="text-slate-500">100 Enterprise Way, Suite 400</div>
                <div className="text-slate-500">Date: {selectedInvoice.date}</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        ${item.unitPrice.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Payment processed via {selectedInvoice.paymentMethod}
              </span>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Total Paid</span>
                <span className="text-2xl font-bold font-mono text-slate-900">
                  ${selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Top Up Token Quota Balance</span>
            </h3>
            <p className="text-xs text-slate-500">
              Add prepaid credit to <span className="font-semibold text-slate-800">{activeTenant.name}</span> to expand monthly generation limits.
            </p>

            {topUpSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>${topUpAmount} added to balance successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleTopUp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Select Top-Up Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 2000].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 rounded-xl border font-bold font-mono transition-all ${
                          topUpAmount === amt
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Additional Token Quota:</span>
                    <span className="font-mono font-bold text-slate-900">
                      +{(topUpAmount * 20000).toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billed to:</span>
                    <span className="font-semibold text-slate-800">Corporate Wells Fargo ACH</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xs"
                  >
                    Confirm Payment
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
