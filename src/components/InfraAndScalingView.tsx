import React from 'react';
import { 
  CloudLightning, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Server, 
  Activity, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  GitBranch,
  Gauge
} from 'lucide-react';

export const InfraAndScalingView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                Cloud-Native Resilience
              </span>
              <span className="text-xs text-slate-500">
                AWS ALB · Auto-Scaling Group · Zero-Downtime Multi-AZ
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Primary Load Balancer & Auto-Scaling Group Strategy
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Deep-dive architectural explanation and production configurations for Application Load Balancing (ALB), 
              Target Tracking Auto-Scaling Groups (ASG), and multi-tier fault isolation.
            </p>
          </div>
        </div>
      </div>

      {/* Part 1: Primary Load Balancer (ALB) Strategy */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              1. Application Load Balancer (ALB) Architecture & Strategy
            </h2>
            <p className="text-xs text-slate-500">
              High-throughput edge routing, connection draining, and cross-zone traffic distribution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Deregistration Delay (30s)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When an instance is scheduled for termination (scale-in or deployment), ALB enters <strong>connection draining</strong>. Setting this to 30s allows in-flight multi-agent synthesis requests to complete cleanly while rejecting new traffic.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Health Check Tuning</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Path: <code className="text-blue-700 bg-white px-1 py-0.5 rounded border border-slate-200">/api/health</code>. 
              Interval: <strong>10s</strong>. Timeout: <strong>3s</strong>. Healthy Threshold: <strong>2</strong>. Unhealthy Threshold: <strong>3</strong>. Ensures failing pods are quarantined within 30 seconds.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Keep-Alive Alignment (65s)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ALB idle timeout is 60s. The backend Uvicorn keep-alive MUST be configured to <strong>65s</strong>. If the backend closes connections before ALB, ALB throws intermittent <strong>502 Bad Gateway</strong> errors under load.
            </p>
          </div>
        </div>

        {/* ALB Configuration Checklist */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-1.5 border border-slate-800">
          <div className="text-cyan-400 font-bold mb-1">// Production ALB Target Group Settings (Terraform Reference)</div>
          <div>deregistration_delay.timeout_seconds = "30"</div>
          <div>health_check.interval_seconds        = "10"</div>
          <div>health_check.timeout_seconds         = "3"</div>
          <div>health_check.healthy_threshold       = "2"</div>
          <div>health_check.unhealthy_threshold     = "3"</div>
          <div>stickiness.enabled                   = "false"  <span className="text-slate-500"># Pure stateless round-robin across worker fleet</span></div>
        </div>
      </div>

      {/* Part 2: Auto-Scaling Group (ASG) Strategy */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              2. Auto-Scaling Group (ASG) Dual-Metric Scaling Strategy
            </h2>
            <p className="text-xs text-slate-500">
              Proactive scaling driven by ALB Request Count Per Target and SQS Message Queue Backlog
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy 1: Target Tracking */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Policy 1: Ingress Target Tracking
              </span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                ALBRequestCountPerTarget
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target Value: <strong>600 requests / target / minute</strong> (10 req/sec per container). 
              When incoming traffic spikes, ASG automatically launches additional instances to keep latency below 850ms.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Scale-out cooldown: <strong>60s</strong> | Scale-in cooldown: <strong>300s</strong> (prevents thrashing)
            </div>
          </div>

          {/* Policy 2: Queue Backlog Step Scaling */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Policy 2: Queue Backlog Step Scaling
              </span>
              <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                ApproximateNumberOfMessagesVisible
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For asynchronous agent workers, CPU utilization is a lagging indicator. ASG monitors the message queue depth:
              if backlog &gt; <strong>50 tasks for 1 minute</strong>, immediately step-scale by +3 worker nodes.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              CloudWatch Alarm: BacklogPerWorker &gt; 5 tasks/worker
            </div>
          </div>
        </div>

        {/* Mixed Instances & Spot Optimization */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-700" />
            <span>Mixed Instances Architecture (Cost Optimization & Fault Tolerance)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block mb-1">On-Demand Baseline</strong>
              <p className="text-slate-600 text-[11px]">
                Maintain <strong>3 On-Demand nodes</strong> across AZs (us-east-1a, 1b, 1c) to guarantee zero downtime even during extreme Spot market reclamation.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block mb-1">70% Spot Pool</strong>
              <p className="text-slate-600 text-[11px]">
                Scale out with Spot instances using <code className="text-indigo-600">price-capacity-optimized</code> allocation to minimize eviction frequency and save ~70% compute costs.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block mb-1">Pre-Warmed Containers</strong>
              <p className="text-slate-600 text-[11px]">
                ASG Warm Pool keeps container images and embedding models pre-loaded in RAM, slashing initialization cold-starts from 90s to <strong>&lt;5s</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Part 3: Integration Best Practices & CI/CD Deployment */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              3. Integration Best Practices & Zero-Downtime Deployment
            </h2>
            <p className="text-xs text-slate-500">
              Defensive operational principles for distributed agent environments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold block mb-0.5">Distributed Tracing & Correlation IDs</strong>
              <span className="text-slate-600">
                Every request receives a unique <code className="font-mono text-indigo-700">X-Correlation-ID</code> header at the ALB/FastAPI ingress. 
                This ID is injected into Kafka messages, Celery tasks, and structlog events for instantaneous distributed root-cause debugging.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold block mb-0.5">Dead-Letter Queue (DLQ) Quarantine</strong>
              <span className="text-slate-600">
                Unprocessable payloads (e.g. malformed files or persistent LLM format failures) are routed to a DLQ after 3 retries. 
                This isolates poison messages and prevents pipeline queue head-of-line blocking.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold block mb-0.5">Zero-Downtime Canary Deployments</strong>
              <span className="text-slate-600">
                ALB Weighted Target Group routing shifts 10% of production traffic to the new revision for 10 minutes. 
                If error rates exceed 0.1% or P99 latency spikes above 2500ms, automated rollback immediately shifts traffic back to 0%.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold block mb-0.5">Strict Contract Testing in CI</strong>
              <span className="text-slate-600">
                The GitHub Actions CI pipeline enforces <code className="font-mono text-indigo-700">mypy --strict</code> and executes boundary unit tests against corrupted chunks, token overflows, and prompt injection attacks before container images are tagged.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
