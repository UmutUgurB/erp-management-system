const cron = require('node-cron');
const { logger } = require('./logger');
const { databaseManager } = require('./databaseManager');
const { cacheManager } = require('./cacheManager');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
    this.jobHistory = [];
  }

  /**
   * Initialize the job scheduler
   */
  async initialize() {
    try {
      logger.info('Initializing job scheduler...');
      
      // Register default jobs
      this.registerDefaultJobs();
      
      this.isRunning = true;
      logger.info('Job scheduler initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize job scheduler:', error);
      throw error;
    }
  }

  /**
   * Register default system jobs
   */
  registerDefaultJobs() {
    // Database backup job - Daily at 2 AM
    this.scheduleJob('database-backup', '0 2 * * *', async () => {
      await this.performDatabaseBackup();
    });

    // Cache cleanup job - Every 6 hours
    this.scheduleJob('cache-cleanup', '0 */6 * * *', async () => {
      await this.performCacheCleanup();
    });

    // Performance report job - Weekly on Monday at 9 AM
    this.scheduleJob('performance-report', '0 9 * * 1', async () => {
      await this.generatePerformanceReport();
    });

    // Inventory check job - Every 4 hours
    this.scheduleJob('inventory-check', '0 */4 * * *', async () => {
      await this.checkInventoryLevels();
    });

    // System health check job - Every 30 minutes
    this.scheduleJob('health-check', '*/30 * * * *', async () => {
      await this.performSystemHealthCheck();
    });

    // Data archiving job - Monthly on 1st at 3 AM
    this.scheduleJob('data-archiving', '0 3 1 * *', async () => {
      await this.archiveOldData();
    });

    // Email digest job - Daily at 8 AM
    this.scheduleJob('email-digest', '0 8 * * *', async () => {
      await this.sendDailyEmailDigest();
    });

    // Analytics aggregation job - Every hour
    this.scheduleJob('analytics-aggregation', '0 * * * *', async () => {
      await this.aggregateAnalyticsData();
    });
  }

  /**
   * Schedule a new job
   * @param {string} name - Job name
   * @param {string} cronExpression - Cron expression
   * @param {Function} task - Task function to execute
   * @param {Object} options - Additional options
   */
  scheduleJob(name, cronExpression, task, options = {}) {
    try {
      if (this.jobs.has(name)) {
        logger.warn(`Job ${name} already exists, stopping previous instance`);
        this.stopJob(name);
      }

      const job = cron.schedule(cronExpression, async () => {
        await this.executeJob(name, task);
      }, {
        scheduled: false,
        timezone: options.timezone || 'UTC',
        ...options
      });

      this.jobs.set(name, {
        job,
        cronExpression,
        task,
        options,
        lastRun: null,
        nextRun: job.nextDate().toDate(),
        runCount: 0,
        status: 'scheduled'
      });

      job.start();
      logger.info(`Job ${name} scheduled successfully`, { cronExpression, nextRun: job.nextDate().toDate() });
      
      return true;
    } catch (error) {
      logger.error(`Failed to schedule job ${name}:`, error);
      return false;
    }
  }

  /**
   * Execute a scheduled job
   * @param {string} name - Job name
   * @param {Function} task - Task function
   */
  async executeJob(name, task) {
    const jobInfo = this.jobs.get(name);
    if (!jobInfo) return;

    const startTime = Date.now();
    jobInfo.status = 'running';
    jobInfo.lastRun = new Date();

    try {
      logger.info(`Starting job execution: ${name}`);
      
      await task();
      
      const executionTime = Date.now() - startTime;
      jobInfo.runCount++;
      jobInfo.status = 'completed';
      jobInfo.lastExecutionTime = executionTime;

      // Update next run time
      if (jobInfo.job) {
        jobInfo.nextRun = jobInfo.job.nextDate().toDate();
      }

      logger.info(`Job ${name} completed successfully`, { 
        executionTime: `${executionTime}ms`,
        runCount: jobInfo.runCount 
      });

      // Add to history
      this.addToHistory(name, 'success', executionTime);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      jobInfo.status = 'failed';
      jobInfo.lastError = error.message;
      jobInfo.lastExecutionTime = executionTime;

      logger.error(`Job ${name} failed:`, error);
      
      // Add to history
      this.addToHistory(name, 'error', executionTime, error.message);

      // Retry logic for failed jobs
      if (jobInfo.options.retries && jobInfo.options.retries > 0) {
        await this.retryJob(name, jobInfo.options.retries);
      }
    }
  }

  /**
   * Retry a failed job
   * @param {string} name - Job name
   * @param {number} maxRetries - Maximum retry attempts
   */
  async retryJob(name, maxRetries) {
    const jobInfo = this.jobs.get(name);
    if (!jobInfo || jobInfo.retryCount >= maxRetries) return;

    jobInfo.retryCount = (jobInfo.retryCount || 0) + 1;
    logger.info(`Retrying job ${name}, attempt ${jobInfo.retryCount}/${maxRetries}`);

    // Wait before retry (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, jobInfo.retryCount - 1), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Re-execute the job
    await this.executeJob(name, jobInfo.task);
  }

  /**
   * Stop a scheduled job
   * @param {string} name - Job name
   */
  stopJob(name) {
    const jobInfo = this.jobs.get(name);
    if (jobInfo && jobInfo.job) {
      jobInfo.job.stop();
      jobInfo.status = 'stopped';
      logger.info(`Job ${name} stopped successfully`);
      return true;
    }
    return false;
  }

  /**
   * Stop all jobs
   */
  stopAllJobs() {
    logger.info('Stopping all scheduled jobs...');
    for (const [name] of this.jobs) {
      this.stopJob(name);
    }
    this.isRunning = false;
  }

  /**
   * Get job status
   * @param {string} name - Job name
   */
  getJobStatus(name) {
    return this.jobs.get(name) || null;
  }

  /**
   * Get all jobs status
   */
  getAllJobsStatus() {
    const status = {};
    for (const [name, jobInfo] of this.jobs) {
      status[name] = {
        name,
        cronExpression: jobInfo.cronExpression,
        status: jobInfo.status,
        lastRun: jobInfo.lastRun,
        nextRun: jobInfo.nextRun,
        runCount: jobInfo.runCount,
        lastExecutionTime: jobInfo.lastExecutionTime,
        lastError: jobInfo.lastError
      };
    }
    return status;
  }

  /**
   * Add job execution to history
   * @param {string} name - Job name
   * @param {string} status - Execution status
   * @param {number} executionTime - Execution time in ms
   * @param {string} error - Error message if any
   */
  addToHistory(name, status, executionTime, error = null) {
    const historyEntry = {
      jobName: name,
      status,
      executionTime,
      error,
      timestamp: new Date()
    };

    this.jobHistory.push(historyEntry);
    
    // Keep only last 1000 entries
    if (this.jobHistory.length > 1000) {
      this.jobHistory = this.jobHistory.slice(-1000);
    }
  }

  /**
   * Get job execution history
   * @param {number} limit - Number of entries to return
   */
  getJobHistory(limit = 100) {
    return this.jobHistory.slice(-limit);
  }

  // Default job implementations
  async performDatabaseBackup() {
    logger.info('Performing database backup...');
    // Implementation for database backup
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate backup
    logger.info('Database backup completed');
  }

  async performCacheCleanup() {
    logger.info('Performing cache cleanup...');
    // Implementation for cache cleanup
    await cacheManager.cleanup();
    logger.info('Cache cleanup completed');
  }

  async generatePerformanceReport() {
    logger.info('Generating performance report...');
    // Implementation for performance report generation
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate report generation
    logger.info('Performance report generated');
  }

  async checkInventoryLevels() {
    logger.info('Checking inventory levels...');
    // Implementation for inventory level checking
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate inventory check
    logger.info('Inventory levels checked');
  }

  async performSystemHealthCheck() {
    logger.info('Performing system health check...');
    // Implementation for system health check
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate health check
    logger.info('System health check completed');
  }

  async archiveOldData() {
    logger.info('Archiving old data...');
    // Implementation for data archiving
    await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate archiving
    logger.info('Data archiving completed');
  }

  async sendDailyEmailDigest() {
    logger.info('Sending daily email digest...');
    // Implementation for email digest
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate email sending
    logger.info('Daily email digest sent');
  }

  async aggregateAnalyticsData() {
    logger.info('Aggregating analytics data...');
    // Implementation for analytics aggregation
    await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate aggregation
    logger.info('Analytics data aggregated');
  }
}

// Create singleton instance
const jobScheduler = new JobScheduler();

module.exports = { jobScheduler, JobScheduler };
