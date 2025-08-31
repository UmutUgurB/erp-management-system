#!/usr/bin/env node

const { databaseManager } = require('../utils/databaseManager');
const { logger } = require('../utils/logger');
const { performanceMonitor } = require('../utils/performanceMonitor');

/**
 * Database Optimization Script
 * Optimizes database performance and indexes
 */

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

async function analyzeCollections() {
  try {
    console.log(`${COLORS.cyan}📊 Analyzing collections...${COLORS.reset}`);
    
    const collections = await databaseManager.connection.db.listCollections().toArray();
    const analysisResults = [];
    
    for (const collection of collections) {
      try {
        const stats = await databaseManager.connection.db.collection(collection.name).stats();
        
        analysisResults.push({
          name: collection.name,
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          storageSize: stats.storageSize,
          indexes: stats.nindexes,
          indexSize: stats.totalIndexSize
        });
        
        console.log(`   📁 ${collection.name}: ${stats.count} documents, ${Math.round(stats.size / 1024 / 1024)} MB`);
      } catch (error) {
        console.log(`   ❌ Error analyzing ${collection.name}: ${error.message}`);
      }
    }
    
    return analysisResults;
  } catch (error) {
    console.error(`${COLORS.red}❌ Error analyzing collections: ${error.message}${COLORS.reset}`);
    throw error;
  }
}

async function analyzeIndexes() {
  try {
    console.log(`\n${COLORS.cyan}🔍 Analyzing indexes...${COLORS.reset}`);
    
    const collections = await databaseManager.connection.db.listCollections().toArray();
    const indexResults = [];
    
    for (const collection of collections) {
      try {
        const indexes = await databaseManager.connection.db.collection(collection.name).indexes();
        
        indexResults.push({
          collection: collection.name,
          indexes: indexes.map(index => ({
            name: index.name,
            key: index.key,
            unique: index.unique || false,
            sparse: index.sparse || false,
            background: index.background || false
          }))
        });
        
        console.log(`   📍 ${collection.name}: ${indexes.length} indexes`);
        indexes.forEach(index => {
          console.log(`      - ${index.name}: ${JSON.stringify(index.key)}`);
        });
      } catch (error) {
        console.log(`   ❌ Error analyzing indexes for ${collection.name}: ${error.message}`);
      }
    }
    
    return indexResults;
  } catch (error) {
    console.error(`${COLORS.red}❌ Error analyzing indexes: ${error.message}${COLORS.reset}`);
    throw error;
  }
}

async function findSlowQueries() {
  try {
    console.log(`\n${COLORS.cyan}🐌 Finding slow queries...${COLORS.reset}`);
    
    // Get slow query logs from performance monitor
    const slowQueries = performanceMonitor.getSlowQueries();
    
    if (slowQueries.length === 0) {
      console.log(`   ✅ No slow queries found`);
      return [];
    }
    
    console.log(`   📊 Found ${slowQueries.length} slow queries:`);
    slowQueries.forEach((query, index) => {
      console.log(`      ${index + 1}. ${query.operation} on ${query.collection}: ${query.executionTime}ms`);
    });
    
    return slowQueries;
  } catch (error) {
    console.error(`${COLORS.red}❌ Error finding slow queries: ${error.message}${COLORS.reset}`);
    return [];
  }
}

async function optimizeIndexes() {
  try {
    console.log(`\n${COLORS.cyan}⚡ Optimizing indexes...${COLORS.reset}`);
    
    const collections = await databaseManager.connection.db.listCollections().toArray();
    const optimizationResults = [];
    
    for (const collection of collections) {
      try {
        console.log(`   🔧 Optimizing ${collection.name}...`);
        
        // Rebuild indexes
        await databaseManager.connection.db.collection(collection.name).reIndex();
        
        // Get updated stats
        const stats = await databaseManager.connection.db.collection(collection.name).stats();
        
        optimizationResults.push({
          collection: collection.name,
          status: 'optimized',
          indexCount: stats.nindexes,
          indexSize: stats.totalIndexSize
        });
        
        console.log(`      ✅ Optimized ${collection.name}: ${stats.nindexes} indexes`);
      } catch (error) {
        console.log(`      ❌ Error optimizing ${collection.name}: ${error.message}`);
        optimizationResults.push({
          collection: collection.name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return optimizationResults;
  } catch (error) {
    console.error(`${COLORS.red}❌ Error optimizing indexes: ${error.message}${COLORS.reset}`);
    throw error;
  }
}

async function analyzeQueryPatterns() {
  try {
    console.log(`\n${COLORS.cyan}📈 Analyzing query patterns...${COLORS.reset}`);
    
    // Get performance metrics
    const metrics = performanceMonitor.getMetrics();
    const dbMetrics = metrics.database || {};
    
    const patterns = {
      totalQueries: dbMetrics.totalQueries || 0,
      slowQueries: dbMetrics.slowQueries || 0,
      avgResponseTime: dbMetrics.avgResponseTime || 0,
      mostUsedCollections: dbMetrics.mostUsedCollections || [],
      mostUsedOperations: dbMetrics.mostUsedOperations || []
    };
    
    console.log(`   📊 Total Queries: ${patterns.totalQueries}`);
    console.log(`   🐌 Slow Queries: ${patterns.slowQueries}`);
    console.log(`   ⏱️  Average Response Time: ${patterns.avgResponseTime.toFixed(2)}ms`);
    
    if (patterns.mostUsedCollections.length > 0) {
      console.log(`   🔝 Most Used Collections:`);
      patterns.mostUsedCollections.forEach((collection, index) => {
        console.log(`      ${index + 1}. ${collection.name}: ${collection.count} queries`);
      });
    }
    
    if (patterns.mostUsedOperations.length > 0) {
      console.log(`   🔝 Most Used Operations:`);
      patterns.mostUsedOperations.forEach((operation, index) => {
        console.log(`      ${index + 1}. ${operation.name}: ${operation.count} times`);
      });
    }
    
    return patterns;
  } catch (error) {
    console.error(`${COLORS.red}❌ Error analyzing query patterns: ${error.message}${COLORS.reset}`);
    return {};
  }
}

async function generateOptimizationReport() {
  try {
    console.log(`\n${COLORS.cyan}📋 Generating optimization report...${COLORS.reset}`);
    
    const report = {
      timestamp: new Date().toISOString(),
      collections: await analyzeCollections(),
      indexes: await analyzeIndexes(),
      slowQueries: await findSlowQueries(),
      queryPatterns: await analyzeQueryPatterns()
    };
    
    // Calculate optimization score
    let score = 100;
    let recommendations = [];
    
    // Deduct points for issues
    if (report.slowQueries.length > 0) {
      score -= report.slowQueries.length * 5;
      recommendations.push('Consider adding indexes for slow queries');
    }
    
    if (report.collections.some(c => c.size > 100 * 1024 * 1024)) { // 100MB
      score -= 10;
      recommendations.push('Large collections detected - consider archiving old data');
    }
    
    if (report.indexes.some(i => i.indexes.length > 10)) {
      score -= 15;
      recommendations.push('Too many indexes - consider removing unused ones');
    }
    
    score = Math.max(0, score);
    
    report.optimizationScore = score;
    report.recommendations = recommendations;
    
    console.log(`\n${COLORS.bright}${COLORS.cyan}📊 Optimization Report${COLORS.reset}`);
    console.log(`   🎯 Optimization Score: ${score}/100`);
    
    if (recommendations.length > 0) {
      console.log(`   💡 Recommendations:`);
      recommendations.forEach((rec, index) => {
        console.log(`      ${index + 1}. ${rec}`);
      });
    } else {
      console.log(`   ✅ No optimization recommendations`);
    }
    
    return report;
  } catch (error) {
    console.error(`${COLORS.red}❌ Error generating report: ${error.message}${COLORS.reset}`);
    throw error;
  }
}

async function performOptimization() {
  try {
    console.log(`\n${COLORS.cyan}🚀 Performing database optimization...${COLORS.reset}`);
    
    // Generate report first
    const report = await generateOptimizationReport();
    
    // Perform optimizations
    if (report.recommendations.length > 0) {
      console.log(`\n${COLORS.yellow}⚠️  Manual optimization required based on recommendations${COLORS.reset}`);
    }
    
    // Optimize indexes
    const optimizationResults = await optimizeIndexes();
    
    // Final report
    console.log(`\n${COLORS.bright}${COLORS.green}✅ Database optimization completed!${COLORS.reset}`);
    console.log(`   📊 Collections analyzed: ${report.collections.length}`);
    console.log(`   🔍 Indexes analyzed: ${report.indexes.length}`);
    console.log(`   🐌 Slow queries found: ${report.slowQueries.length}`);
    console.log(`   ⚡ Indexes optimized: ${optimizationResults.filter(r => r.status === 'optimized').length}`);
    
    return {
      success: true,
      report,
      optimizationResults
    };
    
  } catch (error) {
    console.error(`${COLORS.red}❌ Database optimization failed: ${error.message}${COLORS.reset}`);
    throw error;
  }
}

async function main() {
  try {
    console.log(`${COLORS.bright}${COLORS.blue}🔧 ERP Database Optimization Tool${COLORS.reset}\n`);
    
    // Check if database is connected
    if (!databaseManager.isConnected) {
      console.log(`${COLORS.yellow}⚠️  Connecting to database...${COLORS.reset}`);
      await databaseManager.connect();
    }
    
    // Perform optimization
    const result = await performOptimization();
    
    console.log(`\n${COLORS.green}🎉 Optimization completed successfully!${COLORS.reset}`);
    
    // Log the optimization
    logger.info('Database optimization completed', {
      score: result.report.optimizationScore,
      collections: result.report.collections.length,
      recommendations: result.report.recommendations
    });
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Database optimization failed', {
      error: error.message,
      stack: error.stack
    });
    
    console.error(`\n${COLORS.red}❌ Optimization failed: ${error.message}${COLORS.reset}`);
    process.exit(1);
  }
}

// Run optimization
if (require.main === module) {
  main();
}

module.exports = { 
  main, 
  analyzeCollections, 
  analyzeIndexes, 
  findSlowQueries, 
  optimizeIndexes, 
  analyzeQueryPatterns, 
  generateOptimizationReport, 
  performOptimization 
};

