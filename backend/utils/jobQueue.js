const Redis = require('ioredis');
const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');

// Job queue configuration
const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 2, // Use different DB for jobs
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keyPrefix: 'jobs:'
  },
  default: {
    priority: 5, // 1-10, 1 being highest priority
    attempts: 3,
    backoff: 'exponential', // exponential, linear, fixed
    timeout: 30000, // 30 seconds
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50 // Keep last 50 failed jobs
  }
};

// Job statuses
const JobStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled'
};

// Job priorities
const JobPriority = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 5,
  LOW: 8,
  BULK: 10
};

// Job types
const JobType = {
  EMAIL: 'email',
  EXPORT: 'export',
  CLEANUP: 'cleanup',
  NOTIFICATION: 'notification',
  REPORT: 'report',
  SYNC: 'sync',
  CUSTOM: 'custom'
};

// Job class
class Job {
  constructor(type, data, options = {}) {
    this.id = uuidv4();
    this.type = type;
    this.data = data;
    this.options = { ...config.default, ...options };
    this.status = JobStatus.PENDING;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.attempts = 0;
    this.maxAttempts = this.options.attempts;
    this.delay = options.delay || 0;
    this.priority = this.options.priority;
    this.timeout = this.options.timeout;
    this.result = null;
    this.error = null;
    this.progress = 0;
    this.metadata = options.metadata || {};
  }

  // Update job status
  updateStatus(status, data = {}) {
    this.status = status;
    this.updatedAt = Date.now();
    
    if (data.result !== undefined) this.result = data.result;
    if (data.error !== undefined) this.error = data.error;
    if (data.progress !== undefined) this.progress = data.progress;
    if (data.attempts !== undefined) this.attempts = data.attempts;
  }

  // Mark job as active
  markActive() {
    this.updateStatus(JobStatus.ACTIVE);
  }

  // Mark job as completed
  markCompleted(result) {
    this.updateStatus(JobStatus.COMPLETED, { result });
  }

  // Mark job as failed
  markFailed(error, incrementAttempts = true) {
    if (incrementAttempts) {
      this.attempts++;
    }
    
    this.updateStatus(JobStatus.FAILED, { error: error.message || error });
  }

  // Check if job can be retried
  canRetry() {
    return this.attempts < this.maxAttempts && this.status === JobStatus.FAILED;
  }

  // Get next retry delay
  getNextRetryDelay() {
    if (this.options.backoff === 'exponential') {
      return Math.min(1000 * Math.pow(2, this.attempts), 60000); // Max 1 minute
    } else if (this.options.backoff === 'linear') {
      return 1000 * this.attempts; // 1 second per attempt
    } else {
      return 5000; // Fixed 5 seconds
    }
  }

  // Serialize job for storage
  serialize() {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      data: this.data,
      options: this.options,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      delay: this.delay,
      priority: this.priority,
      timeout: this.timeout,
      result: this.result,
      error: this.error,
      progress: this.progress,
      metadata: this.metadata
    });
  }

  // Deserialize job from storage
  static deserialize(data) {
    try {
      const jobData = JSON.parse(data);
      const job = new Job(jobData.type, jobData.data, jobData.options);
      
      // Restore job state
      Object.assign(job, jobData);
      
      return job;
    } catch (error) {
      logger.error('Error deserializing job:', error);
      return null;
    }
  }
}

// Job Queue class
class JobQueue {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.workers = new Map();
    this.processors = new Map();
    this.scheduledJobs = new Map();
    
    this.initializeRedis();
  }

  // Initialize Redis connection
  async initializeRedis() {
    try {
      this.redis = new Redis(config.redis);
      
      this.redis.on('error', (err) => {
        logger.error('Redis job queue error:', err);
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis job queue connected successfully');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        this.isConnected = true;
      });

      // Test connection
      await this.redis.ping();
      this.isConnected = true;
      
    } catch (error) {
      logger.warn('Redis job queue not available:', error.message);
      this.isConnected = false;
    }
  }

  // Add job to queue
  async addJob(type, data, options = {}) {
    try {
      const job = new Job(type, data, options);
      
      if (job.delay > 0) {
        // Delayed job
        await this.addDelayedJob(job);
        return job;
      } else {
        // Immediate job
        await this.addImmediateJob(job);
        return job;
      }
    } catch (error) {
      logger.error('Error adding job to queue:', error);
      throw error;
    }
  }

  // Add immediate job
  async addImmediateJob(job) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const jobData = job.serialize();
    const priority = job.priority;
    
    // Add to priority queue
    await this.redis.zadd('jobs:pending', priority, job.id);
    
    // Store job data
    await this.redis.setex(`jobs:data:${job.id}`, 86400, jobData); // 24 hours TTL
    
    logger.info(`Job ${job.id} added to queue with priority ${priority}`);
  }

  // Add delayed job
  async addDelayedJob(job) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const jobData = job.serialize();
    const executeAt = Date.now() + job.delay;
    
    // Add to delayed jobs set
    await this.redis.zadd('jobs:delayed', executeAt, job.id);
    
    // Store job data
    await this.redis.setex(`jobs:data:${job.id}`, 86400, jobData);
    
    // Schedule execution
    this.scheduleJob(job.id, executeAt);
    
    logger.info(`Job ${job.id} scheduled for execution at ${new Date(executeAt)}`);
  }

  // Schedule job execution
  scheduleJob(jobId, executeAt) {
    const delay = executeAt - Date.now();
    
    if (delay <= 0) {
      this.processDelayedJob(jobId);
      return;
    }
    
    const timer = setTimeout(() => {
      this.processDelayedJob(jobId);
    }, delay);
    
    this.scheduledJobs.set(jobId, timer);
  }

  // Process delayed job
  async processDelayedJob(jobId) {
    try {
      if (!this.isConnected) return;
      
      // Remove from delayed set
      await this.redis.zrem('jobs:delayed', jobId);
      
      // Get job data
      const jobData = await this.redis.get(`jobs:data:${jobId}`);
      if (!jobData) return;
      
      const job = Job.deserialize(jobData);
      if (!job) return;
      
      // Add to immediate queue
      await this.addImmediateJob(job);
      
      // Clear scheduled timer
      if (this.scheduledJobs.has(jobId)) {
        clearTimeout(this.scheduledJobs.get(jobId));
        this.scheduledJobs.delete(jobId);
      }
      
    } catch (error) {
      logger.error('Error processing delayed job:', error);
    }
  }

  // Process next job
  async processNextJob() {
    try {
      if (!this.isConnected) return null;
      
      // Get highest priority job
      const jobIds = await this.redis.zrange('jobs:pending', 0, 0, 'WITHSCORES');
      if (jobIds.length === 0) return null;
      
      const jobId = jobIds[0];
      const priority = jobIds[1];
      
      // Remove from pending queue
      await this.redis.zrem('jobs:pending', jobId);
      
      // Get job data
      const jobData = await this.redis.get(`jobs:data:${jobId}`);
      if (!jobData) return null;
      
      const job = Job.deserialize(jobData);
      if (!job) return null;
      
      // Mark as active
      job.markActive();
      await this.updateJob(job);
      
      return job;
      
    } catch (error) {
      logger.error('Error processing next job:', error);
      return null;
    }
  }

  // Update job in storage
  async updateJob(job) {
    if (!this.isConnected) return;
    
    const jobData = job.serialize();
    await this.redis.setex(`jobs:data:${job.id}`, 86400, jobData);
  }

  // Complete job
  async completeJob(job, result) {
    try {
      job.markCompleted(result);
      await this.updateJob(job);
      
      // Move to completed set
      await this.redis.zadd('jobs:completed', Date.now(), job.id);
      
      // Cleanup old completed jobs
      await this.cleanupOldJobs('jobs:completed', this.options.removeOnComplete);
      
      logger.info(`Job ${job.id} completed successfully`);
      
    } catch (error) {
      logger.error('Error completing job:', error);
    }
  }

  // Fail job
  async failJob(job, error) {
    try {
      job.markFailed(error);
      await this.updateJob(job);
      
      if (job.canRetry()) {
        // Schedule retry
        const retryDelay = job.getNextRetryDelay();
        const retryAt = Date.now() + retryDelay;
        
        await this.redis.zadd('jobs:delayed', retryAt, job.id);
        this.scheduleJob(job.id, retryAt);
        
        logger.info(`Job ${job.id} scheduled for retry in ${retryDelay}ms`);
      } else {
        // Move to failed set
        await this.redis.zadd('jobs:failed', Date.now(), job.id);
        
        // Cleanup old failed jobs
        await this.cleanupOldJobs('jobs:failed', this.options.removeOnFail);
        
        logger.error(`Job ${job.id} failed permanently after ${job.attempts} attempts`);
      }
      
    } catch (error) {
      logger.error('Error failing job:', error);
    }
  }

  // Cleanup old jobs
  async cleanupOldJobs(setKey, maxCount) {
    try {
      const count = await this.redis.zcard(setKey);
      if (count > maxCount) {
        const toRemove = count - maxCount;
        const oldJobs = await this.redis.zrange(setKey, 0, toRemove - 1);
        
        for (const jobId of oldJobs) {
          await this.redis.zrem(setKey, jobId);
          await this.redis.del(`jobs:data:${jobId}`);
        }
        
        logger.info(`Cleaned up ${toRemove} old jobs from ${setKey}`);
      }
    } catch (error) {
      logger.error('Error cleaning up old jobs:', error);
    }
  }

  // Register job processor
  registerProcessor(type, processor) {
    this.processors.set(type, processor);
    logger.info(`Processor registered for job type: ${type}`);
  }

  // Start worker
  startWorker(name, concurrency = 1) {
    if (this.workers.has(name)) {
      logger.warn(`Worker ${name} is already running`);
      return;
    }
    
    const worker = {
      name,
      concurrency,
      isRunning: false,
      activeJobs: 0,
      processedJobs: 0,
      failedJobs: 0
    };
    
    this.workers.set(name, worker);
    this.startWorkerLoop(worker);
    
    logger.info(`Worker ${name} started with concurrency ${concurrency}`);
  }

  // Start worker loop
  startWorkerLoop(worker) {
    worker.isRunning = true;
    
    const processJobs = async () => {
      while (worker.isRunning && worker.activeJobs < worker.concurrency) {
        try {
          const job = await this.processNextJob();
          if (!job) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            continue;
          }
          
          worker.activeJobs++;
          
          // Process job
          this.processJob(job, worker).finally(() => {
            worker.activeJobs--;
          });
          
        } catch (error) {
          logger.error('Error in worker loop:', error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (worker.isRunning) {
        setTimeout(processJobs, 100); // Continue loop
      }
    };
    
    processJobs();
  }

  // Process individual job
  async processJob(job, worker) {
    try {
      const processor = this.processors.get(job.type);
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.type}`);
      }
      
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), job.timeout);
      });
      
      // Process job with timeout
      const result = await Promise.race([
        processor(job),
        timeoutPromise
      ]);
      
      await this.completeJob(job, result);
      worker.processedJobs++;
      
    } catch (error) {
      await this.failJob(job, error);
      worker.failedJobs++;
    }
  }

  // Stop worker
  stopWorker(name) {
    const worker = this.workers.get(name);
    if (!worker) {
      logger.warn(`Worker ${name} not found`);
      return;
    }
    
    worker.isRunning = false;
    this.workers.delete(name);
    
    logger.info(`Worker ${name} stopped`);
  }

  // Get queue statistics
  async getStats() {
    try {
      if (!this.isConnected) {
        return { error: 'Redis not connected' };
      }
      
      const stats = {
        pending: await this.redis.zcard('jobs:pending'),
        delayed: await this.redis.zcard('jobs:delayed'),
        completed: await this.redis.zcard('jobs:completed'),
        failed: await this.redis.zcard('jobs:failed'),
        workers: Array.from(this.workers.values()).map(worker => ({
          name: worker.name,
          concurrency: worker.concurrency,
          activeJobs: worker.activeJobs,
          processedJobs: worker.processedJobs,
          failedJobs: worker.failedJobs
        }))
      };
      
      return stats;
      
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      return { error: error.message };
    }
  }

  // Get job by ID
  async getJob(jobId) {
    try {
      if (!this.isConnected) return null;
      
      const jobData = await this.redis.get(`jobs:data:${jobId}`);
      if (!jobData) return null;
      
      return Job.deserialize(jobData);
      
    } catch (error) {
      logger.error('Error getting job:', error);
      return null;
    }
  }

  // Cancel job
  async cancelJob(jobId) {
    try {
      if (!this.isConnected) return false;
      
      // Remove from all queues
      await this.redis.zrem('jobs:pending', jobId);
      await this.redis.zrem('jobs:delayed', jobId);
      
      // Update job status
      const job = await this.getJob(jobId);
      if (job) {
        job.updateStatus(JobStatus.CANCELLED);
        await this.updateJob(job);
      }
      
      // Clear scheduled timer
      if (this.scheduledJobs.has(jobId)) {
        clearTimeout(this.scheduledJobs.get(jobId));
        this.scheduledJobs.delete(jobId);
      }
      
      logger.info(`Job ${jobId} cancelled`);
      return true;
      
    } catch (error) {
      logger.error('Error cancelling job:', error);
      return false;
    }
  }

  // Cleanup and disconnect
  async cleanup() {
    try {
      // Stop all workers
      for (const [name] of this.workers) {
        this.stopWorker(name);
      }
      
      // Clear scheduled jobs
      for (const timer of this.scheduledJobs.values()) {
        clearTimeout(timer);
      }
      this.scheduledJobs.clear();
      
      // Disconnect Redis
      if (this.redis) {
        await this.redis.disconnect();
        this.redis = null;
      }
      
      this.isConnected = false;
      logger.info('Job queue cleaned up successfully');
      
    } catch (error) {
      logger.error('Error cleaning up job queue:', error);
    }
  }
}

// Create singleton instance
const jobQueue = new JobQueue();

// Graceful shutdown
process.on('SIGTERM', () => jobQueue.cleanup());
process.on('SIGINT', () => jobQueue.cleanup());

module.exports = {
  JobQueue,
  Job,
  JobStatus,
  JobPriority,
  JobType,
  jobQueue
};
