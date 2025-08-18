const { performance } = require('perf_hooks');

class AIAnalyticsMiddleware {
  constructor() {
    this.metrics = new Map();
    this.predictions = new Map();
    this.anomalies = new Map();
    this.insights = new Map();
  }

  // Performance monitoring
  monitorPerformance(req, res, next) {
    const start = performance.now();
    
    res.on('finish', () => {
      const duration = performance.now() - start;
      const endpoint = req.path;
      const method = req.method;
      const statusCode = res.statusCode;
      
      this.recordMetric('api_performance', {
        endpoint,
        method,
        statusCode,
        duration,
        timestamp: new Date().toISOString()
      });
      
      // Detect performance anomalies
      if (duration > 1000) { // > 1 second
        this.detectAnomaly('performance_degradation', {
          endpoint,
          duration,
          threshold: 1000,
          severity: duration > 5000 ? 'CRITICAL' : 'HIGH'
        });
      }
    });
    
    next();
  }

  // User behavior analysis
  analyzeUserBehavior(req, res, next) {
    const userAgent = req.get('User-Agent');
    const ip = req.ip;
    const timestamp = new Date().toISOString();
    
    // Track user patterns
    this.recordMetric('user_behavior', {
      ip,
      userAgent,
      endpoint: req.path,
      method: req.method,
      timestamp
    });
    
    // Detect suspicious patterns
    this.detectSuspiciousActivity(req);
    
    next();
  }

  // Business intelligence gathering
  gatherBusinessIntelligence(req, res, next) {
    const { method, path, body, query } = req;
    
    // Track business operations
    if (method === 'POST' || method === 'PUT') {
      this.recordMetric('business_operations', {
        operation: `${method}_${path}`,
        data: this.sanitizeData(body),
        timestamp: new Date().toISOString()
      });
    }
    
    // Track search patterns
    if (query.search || query.q) {
      this.recordMetric('search_patterns', {
        query: query.search || query.q,
        filters: query,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  }

  // Predictive analytics
  generatePredictions() {
    const predictions = {};
    
    // Sales forecasting
    predictions.sales = this.forecastSales();
    
    // Inventory predictions
    predictions.inventory = this.predictInventory();
    
    // Customer behavior predictions
    predictions.customerBehavior = this.predictCustomerBehavior();
    
    // Risk assessment
    predictions.risks = this.assessRisks();
    
    return predictions;
  }

  // Sales forecasting using historical data
  forecastSales() {
    const salesData = this.getMetricHistory('business_operations');
    if (!salesData || salesData.length < 10) return null;
    
    // Simple moving average for demonstration
    const recentSales = salesData
      .filter(d => d.operation.includes('POST_orders'))
      .slice(-10);
    
    if (recentSales.length === 0) return null;
    
    const totalSales = recentSales.reduce((sum, sale) => sum + (sale.data?.totalAmount || 0), 0);
    const averageSales = totalSales / recentSales.length;
    
    return {
      currentPeriod: averageSales,
      nextPeriod: averageSales * 1.05, // 5% growth assumption
      confidence: 0.75,
      factors: ['historical_trend', 'seasonality', 'market_conditions']
    };
  }

  // Inventory prediction
  predictInventory() {
    const inventoryData = this.getMetricHistory('business_operations');
    if (!inventoryData) return [];
    
    const inventoryOps = inventoryData
      .filter(d => d.operation.includes('inventory') || d.operation.includes('stock'));
    
    return inventoryOps.map(op => ({
      productId: op.data?.productId || 'unknown',
      predictedDemand: Math.floor(Math.random() * 100) + 50, // Mock prediction
      reorderPoint: 20,
      suggestedOrderQuantity: Math.floor(Math.random() * 200) + 100,
      confidence: 0.8
    }));
  }

  // Customer behavior prediction
  predictCustomerBehavior() {
    const behaviorData = this.getMetricHistory('user_behavior');
    if (!behaviorData) return [];
    
    // Group by IP to identify user patterns
    const userPatterns = new Map();
    behaviorData.forEach(record => {
      const ip = record.ip;
      if (!userPatterns.has(ip)) {
        userPatterns.set(ip, []);
      }
      userPatterns.get(ip).push(record);
    });
    
    return Array.from(userPatterns.entries()).map(([ip, patterns]) => ({
      customerId: ip,
      pattern: this.identifyPattern(patterns),
      confidence: 0.7,
      nextAction: this.predictNextAction(patterns),
      probability: 0.8
    }));
  }

  // Risk assessment
  assessRisks() {
    const risks = [];
    
    // Performance risks
    const performanceData = this.getMetricHistory('api_performance');
    if (performanceData) {
      const slowEndpoints = performanceData.filter(d => d.duration > 2000);
      if (slowEndpoints.length > 5) {
        risks.push({
          factor: 'API Performance Degradation',
          riskLevel: 'HIGH',
          impact: 'User experience degradation, potential revenue loss',
          mitigation: 'Optimize slow endpoints, implement caching',
          probability: 0.6
        });
      }
    }
    
    // Security risks
    const suspiciousActivity = this.getMetricHistory('suspicious_activity');
    if (suspiciousActivity && suspiciousActivity.length > 0) {
      risks.push({
        factor: 'Suspicious User Activity',
        riskLevel: 'MEDIUM',
        impact: 'Potential security breach, data compromise',
        mitigation: 'Implement rate limiting, enhance authentication',
        probability: 0.4
      });
    }
    
    return risks;
  }

  // Helper methods
  recordMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    this.metrics.get(type).push(data);
    
    // Keep only last 1000 records per metric type
    if (this.metrics.get(type).length > 1000) {
      this.metrics.get(type).shift();
    }
  }

  getMetricHistory(type) {
    return this.metrics.get(type) || [];
  }

  detectAnomaly(type, data) {
    if (!this.anomalies.has(type)) {
      this.anomalies.set(type, []);
    }
    this.anomalies.get(type).push({
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  detectSuspiciousActivity(req) {
    const ip = req.ip;
    const now = Date.now();
    
    // Simple rate limiting detection
    const recentRequests = this.getMetricHistory('user_behavior')
      .filter(r => r.ip === ip && (now - new Date(r.timestamp).getTime()) < 60000); // Last minute
    
    if (recentRequests.length > 100) { // More than 100 requests per minute
      this.recordMetric('suspicious_activity', {
        ip,
        type: 'rate_limit_exceeded',
        requestCount: recentRequests.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  identifyPattern(patterns) {
    const endpoints = patterns.map(p => p.endpoint);
    const uniqueEndpoints = [...new Set(endpoints)];
    
    if (uniqueEndpoints.length === 1) {
      return 'focused_user';
    } else if (uniqueEndpoints.length > 5) {
      return 'exploratory_user';
    } else {
      return 'regular_user';
    }
  }

  predictNextAction(patterns) {
    const recentPatterns = patterns.slice(-5);
    const endpointCounts = {};
    
    recentPatterns.forEach(p => {
      endpointCounts[p.endpoint] = (endpointCounts[p.endpoint] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(endpointCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostFrequent ? mostFrequent[0] : 'unknown';
  }

  sanitizeData(data) {
    if (!data) return {};
    
    // Remove sensitive information
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      metrics: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([key, value]) => [key, value.length])
      ),
      anomalies: Object.fromEntries(
        Array.from(this.anomalies.entries()).map(([key, value]) => [key, value.length])
      ),
      predictions: this.generatePredictions(),
      insights: this.generateInsights(),
      timestamp: new Date().toISOString()
    };
  }

  // Generate business insights
  generateInsights() {
    const insights = [];
    
    // Performance insights
    const performanceData = this.getMetricHistory('api_performance');
    if (performanceData && performanceData.length > 0) {
      const avgResponseTime = performanceData.reduce((sum, p) => sum + p.duration, 0) / performanceData.length;
      
      if (avgResponseTime > 500) {
        insights.push({
          type: 'PERFORMANCE',
          title: 'API Response Time Optimization Needed',
          description: `Average response time is ${avgResponseTime.toFixed(2)}ms, consider optimization`,
          impact: 'MEDIUM',
          confidence: 0.8,
          actionable: true
        });
      }
    }
    
    // User behavior insights
    const behaviorData = this.getMetricHistory('user_behavior');
    if (behaviorData && behaviorData.length > 0) {
      const uniqueUsers = new Set(behaviorData.map(b => b.ip)).size;
      const totalRequests = behaviorData.length;
      
      if (totalRequests > 0) {
        const requestsPerUser = totalRequests / uniqueUsers;
        
        if (requestsPerUser > 50) {
          insights.push({
            type: 'CUSTOMER',
            title: 'High User Engagement Detected',
            description: `Users are making ${requestsPerUser.toFixed(1)} requests on average`,
            impact: 'LOW',
            confidence: 0.9,
            actionable: false
          });
        }
      }
    }
    
    return insights;
  }
}

// Create singleton instance
const aiAnalytics = new AIAnalyticsMiddleware();

// Export middleware functions
module.exports = {
  monitorPerformance: (req, res, next) => aiAnalytics.monitorPerformance(req, res, next),
  analyzeUserBehavior: (req, res, next) => aiAnalytics.analyzeUserBehavior(req, res, next),
  gatherBusinessIntelligence: (req, res, next) => aiAnalytics.gatherBusinessIntelligence(req, res, next),
  getAnalytics: () => aiAnalytics.getAnalyticsSummary(),
  generatePredictions: () => aiAnalytics.generatePredictions()
};
