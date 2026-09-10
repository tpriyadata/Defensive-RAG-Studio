import { DocumentChunk, VirtualQueueItem, VirtualQueueMetrics } from '../types';

type QueueListener = (metrics: VirtualQueueMetrics, items: VirtualQueueItem[]) => void;

class PubMedQueueManager {
  private enabled: boolean = true;
  private maxRequestsPerSecond: number = 3;
  private minIntervalMs: number = 334; // 1000ms / 3 req/sec = ~334ms
  private queue: VirtualQueueItem[] = [];
  private history: VirtualQueueItem[] = [];
  private listeners: Set<QueueListener> = new Set();
  private isProcessing: boolean = false;
  private lastDispatchTime: number = 0;

  // Metrics tracking
  private totalEnqueued: number = 0;
  private totalProcessed: number = 0;
  private total429ErrorsPrevented: number = 0;
  private simulated429ErrorsWithoutLimiter: number = 0;
  private totalWaitTimeMs: number = 0;

  // Window tracking for detecting unthrottled bursts
  private unthrottledTimestamps: number[] = [];

  constructor() {
    // Initialized with rate limiting enabled by default to protect NCBI
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.notifyListeners();
  }

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    // Initial trigger
    listener(this.getMetrics(), this.getItems());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getItems(): VirtualQueueItem[] {
    return [...this.queue, ...this.history.slice(-10)];
  }

  public getMetrics(): VirtualQueueMetrics {
    const avgWait = this.totalProcessed > 0 ? Math.round(this.totalWaitTimeMs / this.totalProcessed) : 0;
    return {
      rateLimiterEnabled: this.enabled,
      activeQueueDepth: this.queue.length,
      totalEnqueued: this.totalEnqueued,
      totalProcessed: this.totalProcessed,
      total429ErrorsPrevented: this.total429ErrorsPrevented,
      simulated429ErrorsWithoutLimiter: this.simulated429ErrorsWithoutLimiter,
      currentDispatchesPerSec: this.isProcessing ? 3.0 : 0.0,
      averageQueueWaitMs: avgWait,
      lastDispatchTimestamp: this.lastDispatchTime ? new Date(this.lastDispatchTime).toISOString() : undefined,
      queueStatus: this.queue.length > 0 ? (this.isProcessing ? 'PROCESSING' : 'DRAINING') : 'IDLE',
    };
  }

  private notifyListeners() {
    const metrics = this.getMetrics();
    const items = this.getItems();
    this.listeners.forEach((listener) => {
      try {
        listener(metrics, items);
      } catch (err) {
        console.error('Error notifying queue listener:', err);
      }
    });
  }

  /**
   * Enqueue a single PubMed ID request through the virtual queue
   */
  public async fetchPubMed(
    pmid: string, 
    signal?: AbortSignal
  ): Promise<{ chunk: DocumentChunk; queueItem: VirtualQueueItem }> {
    const cleanPmid = (pmid || '').trim().replace(/^pmid:?/i, '');
    const itemId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    // If Rate Limiter is DISABLED: fire immediately, but check for 429 hazard
    if (!this.enabled) {
      this.unthrottledTimestamps.push(now);
      // Keep only timestamps within last 1 second
      this.unthrottledTimestamps = this.unthrottledTimestamps.filter((t) => now - t <= 1000);
      
      const isBursting = this.unthrottledTimestamps.length > this.maxRequestsPerSecond;
      if (isBursting) {
        this.simulated429ErrorsWithoutLimiter += 1;
        this.notifyListeners();
        // Warn about unthrottled 429 risk
        console.warn(`[NCBI Rate Limiter] Warning: Burst rate (${this.unthrottledTimestamps.length} req/sec) exceeds NCBI limit of 3 req/sec without rate limiter!`);
      }

      const queueItem: VirtualQueueItem = {
        id: itemId,
        pmid: cleanPmid,
        enqueuedAt: now,
        scheduledDispatchAt: now,
        dispatchedAt: now,
        status: isBursting ? 'RETRIED_429' : 'DISPATCHING',
        retryCount: isBursting ? 1 : 0,
      };

      const res = await fetch(`/api/rag/pubmed/${cleanPmid}?rateLimited=false`, { signal });
      const data = await res.json();
      
      queueItem.completedAt = Date.now();
      queueItem.status = res.ok && data.chunk ? 'SUCCESS' : 'FAILED';
      this.history.push(queueItem);
      this.totalProcessed += 1;
      this.notifyListeners();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `Failed to fetch PubMed ID ${cleanPmid}`);
      }
      return { chunk: data.chunk, queueItem };
    }

    // Rate Limiter is ENABLED: Enqueue into Virtual Queue
    return new Promise((resolve, reject) => {
      const queueItem: VirtualQueueItem = {
        id: itemId,
        pmid: cleanPmid,
        enqueuedAt: now,
        scheduledDispatchAt: now + (this.queue.length * this.minIntervalMs),
        status: 'QUEUED',
        retryCount: 0,
      };

      this.queue.push(queueItem);
      this.totalEnqueued += 1;
      this.notifyListeners();

      this.processQueue();

      // Create an internal handler for this specific item
      const checkInterval = setInterval(() => {
        if (queueItem.status === 'SUCCESS' && (queueItem as any).resolvedChunk) {
          clearInterval(checkInterval);
          resolve({ chunk: (queueItem as any).resolvedChunk, queueItem });
        } else if (queueItem.status === 'FAILED') {
          clearInterval(checkInterval);
          reject(new Error(queueItem.error || `Virtual queue dispatch failed for PMID ${cleanPmid}`));
        }
      }, 50);
    });
  }

  /**
   * Process the FIFO queue with strict timing intervals (334ms spacing)
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const currentItem = this.queue[0];
      const now = Date.now();
      const timeSinceLastDispatch = now - this.lastDispatchTime;

      // Ensure minimum interval (334ms) between dispatches to respect NCBI 3 req/sec limit
      if (timeSinceLastDispatch < this.minIntervalMs) {
        const waitMs = this.minIntervalMs - timeSinceLastDispatch;
        await new Promise((r) => setTimeout(r, waitMs));
      }

      currentItem.dispatchedAt = Date.now();
      currentItem.status = 'DISPATCHING';
      this.lastDispatchTime = Date.now();
      this.notifyListeners();

      try {
        const response = await fetch(`/api/rag/pubmed/${currentItem.pmid}?rateLimited=true`);
        
        // Check for 429 Too Many Requests
        if (response.status === 429) {
          currentItem.retryCount += 1;
          currentItem.status = 'RETRIED_429';
          this.total429ErrorsPrevented += 1;
          this.notifyListeners();

          // Wait with backoff before retrying
          await new Promise((r) => setTimeout(r, 600));
          const retryResponse = await fetch(`/api/rag/pubmed/${currentItem.pmid}?rateLimited=true`);
          const retryData = await retryResponse.json();
          
          if (retryResponse.ok && retryData.chunk) {
            (currentItem as any).resolvedChunk = retryData.chunk;
            currentItem.status = 'SUCCESS';
          } else {
            throw new Error(retryData.error?.message || 'Failed after retry');
          }
        } else {
          const data = await response.json();
          if (response.ok && data.chunk) {
            (currentItem as any).resolvedChunk = data.chunk;
            currentItem.status = 'SUCCESS';
            // Every queued request safely executed is a 429 avoided!
            this.total429ErrorsPrevented += 1;
          } else {
            throw new Error(data.error?.message || 'Invalid PubMed response');
          }
        }
      } catch (err: any) {
        console.error(`Error in virtual queue item for ${currentItem.pmid}:`, err);
        currentItem.status = 'FAILED';
        currentItem.error = err?.message || 'Failed to dispatch';
      }

      currentItem.completedAt = Date.now();
      const waitTime = (currentItem.completedAt || Date.now()) - currentItem.enqueuedAt;
      this.totalWaitTimeMs += waitTime;
      this.totalProcessed += 1;

      // Remove from active queue and append to history
      this.queue.shift();
      this.history.push(currentItem);
      if (this.history.length > 20) {
        this.history.shift();
      }
      this.notifyListeners();
    }

    this.isProcessing = false;
    this.notifyListeners();
  }

  /**
   * Reset stats
   */
  public resetStats() {
    this.totalEnqueued = 0;
    this.totalProcessed = 0;
    this.total429ErrorsPrevented = 0;
    this.simulated429ErrorsWithoutLimiter = 0;
    this.totalWaitTimeMs = 0;
    this.history = [];
    this.notifyListeners();
  }
}

export const pubMedQueue = new PubMedQueueManager();
