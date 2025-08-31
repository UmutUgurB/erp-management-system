#!/usr/bin/env node

const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Health Check Script
 * Checks the health of all ERP services
 */

const SERVICES = [
  { name: 'Main Server', url: 'http://localhost:5000/health' },
  { name: 'Test Server', url: 'http://localhost:5001/test/health' },
  { name: 'API Health', url: 'http://localhost:5000/api/health' },
  { name: 'API Stats', url: 'http://localhost:5000/api/stats' }
];

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function checkService(service) {
  try {
    const startTime = Date.now();
    const response = await axios.get(service.url, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      name: service.name,
      status: 'healthy',
      responseTime,
      statusCode: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      error: error.message,
      statusCode: error.response?.status || 'N/A'
    };
  }
}

async function checkDatabase() {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      name: 'MongoDB',
      status: connectionState === 1 ? 'healthy' : 'unhealthy',
      state: states[connectionState] || 'unknown',
      readyState: connectionState
    };
  } catch (error) {
    return {
      name: 'MongoDB',
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkRedis() {
  try {
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      lazyConnect: true
    });
    
    await redis.ping();
    await redis.quit();
    
    return {
      name: 'Redis',
      status: 'healthy',
      message: 'Connection successful'
    };
  } catch (error) {
    return {
      name: 'Redis',
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkSystemResources() {
  const os = require('os');
  
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
  
  const loadAverage = os.loadavg();
  const cpuCount = os.cpus().length;
  
  return {
    name: 'System Resources',
    status: memoryUsagePercent > 90 ? 'warning' : 'healthy',
    memory: {
      total: `${Math.round(totalMemory / 1024 / 1024 / 1024)} GB`,
      used: `${Math.round(usedMemory / 1024 / 1024 / 1024)} GB`,
      free: `${Math.round(freeMemory / 1024 / 1024 / 1024)} GB`,
      usagePercent: memoryUsagePercent
    },
    cpu: {
      count: cpuCount,
      loadAverage: loadAverage.map(load => load.toFixed(2)),
      loadAveragePercent: ((loadAverage[0] / cpuCount) * 100).toFixed(2)
    },
    uptime: `${Math.round(os.uptime() / 3600)} hours`
  };
}

function displayResults(results) {
  console.log(`\n${COLORS.bright}${COLORS.cyan}🏥 ERP System Health Check Results${COLORS.reset}\n`);
  console.log(`${COLORS.bright}Timestamp:${COLORS.reset} ${new Date().toISOString()}\n`);
  
  let healthyCount = 0;
  let unhealthyCount = 0;
  let warningCount = 0;
  
  results.forEach(result => {
    const statusColor = result.status === 'healthy' ? COLORS.green : 
                       result.status === 'warning' ? COLORS.yellow : COLORS.red;
    
    const statusIcon = result.status === 'healthy' ? '✅' : 
                      result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} ${COLORS.bright}${result.name}:${COLORS.reset} ${statusColor}${result.status.toUpperCase()}${COLORS.reset}`);
    
    if (result.status === 'healthy') {
      healthyCount++;
    } else if (result.status === 'warning') {
      warningCount++;
    } else {
      unhealthyCount++;
    }
    
    // Display additional details
    if (result.responseTime) {
      console.log(`   ⏱️  Response Time: ${result.responseTime}ms`);
    }
    
    if (result.statusCode) {
      console.log(`   📊 Status Code: ${result.statusCode}`);
    }
    
    if (result.state) {
      console.log(`   🔌 State: ${result.state}`);
    }
    
    if (result.memory) {
      console.log(`   💾 Memory: ${result.memory.used} / ${result.memory.total} (${result.memory.usagePercent}%)`);
    }
    
    if (result.cpu) {
      console.log(`   🖥️  CPU Load: ${result.cpu.loadAveragePercent}% (${result.cpu.loadAverage.join(', ')})`);
    }
    
    if (result.uptime) {
      console.log(`   ⏰ Uptime: ${result.uptime}`);
    }
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
    
    console.log('');
  });
  
  // Summary
  console.log(`${COLORS.bright}${COLORS.cyan}📊 Summary:${COLORS.reset}`);
  console.log(`   ${COLORS.green}✅ Healthy: ${healthyCount}${COLORS.reset}`);
  console.log(`   ${COLORS.yellow}⚠️  Warning: ${warningCount}${COLORS.reset}`);
  console.log(`   ${COLORS.red}❌ Unhealthy: ${unhealthyCount}${COLORS.reset}`);
  
  const overallStatus = unhealthyCount === 0 ? 'healthy' : unhealthyCount > 2 ? 'critical' : 'degraded';
  const overallColor = overallStatus === 'healthy' ? COLORS.green : 
                      overallStatus === 'degraded' ? COLORS.yellow : COLORS.red;
  
  console.log(`\n${COLORS.bright}Overall Status: ${overallColor}${overallStatus.toUpperCase()}${COLORS.reset}`);
  
  if (unhealthyCount > 0) {
    console.log(`\n${COLORS.red}⚠️  Some services are unhealthy. Please check the logs for more details.${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${COLORS.green}🎉 All services are healthy!${COLORS.reset}`);
    process.exit(0);
  }
}

async function main() {
  try {
    console.log(`${COLORS.bright}${COLORS.blue}🔍 Starting ERP System Health Check...${COLORS.reset}\n`);
    
    const results = [];
    
    // Check HTTP services
    for (const service of SERVICES) {
      const result = await checkService(service);
      results.push(result);
    }
    
    // Check database
    const dbResult = await checkDatabase();
    results.push(dbResult);
    
    // Check Redis
    const redisResult = await checkRedis();
    results.push(redisResult);
    
    // Check system resources
    const systemResult = await checkSystemResources();
    results.push(systemResult);
    
    // Display results
    displayResults(results);
    
  } catch (error) {
    logger.error('Health check script failed', {
      error: error.message,
      stack: error.stack
    });
    
    console.error(`${COLORS.red}❌ Health check failed: ${error.message}${COLORS.reset}`);
    process.exit(1);
  }
}

// Run health check
if (require.main === module) {
  main();
}

module.exports = { main, checkService, checkDatabase, checkRedis, checkSystemResources };

