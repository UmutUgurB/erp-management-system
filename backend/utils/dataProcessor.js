const crypto = require('crypto');

class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
  }

  // Data validation and sanitization
  validateAndSanitize(data, schema) {
    try {
      const sanitized = {};
      
      for (const [key, config] of Object.entries(schema)) {
        if (data[key] !== undefined) {
          if (config.required && !data[key]) {
            throw new Error(`${key} is required`);
          }
          
          if (config.type && typeof data[key] !== config.type) {
            throw new Error(`${key} must be of type ${config.type}`);
          }
          
          if (config.pattern && !config.pattern.test(data[key])) {
            throw new Error(`${key} format is invalid`);
          }
          
          if (config.minLength && data[key].length < config.minLength) {
            throw new Error(`${key} must be at least ${config.minLength} characters`);
          }
          
          if (config.maxLength && data[key].length > config.maxLength) {
            throw new Error(`${key} must be no more than ${config.maxLength} characters`);
          }
          
          if (config.min && data[key] < config.min) {
            throw new Error(`${key} must be at least ${config.min}`);
          }
          
          if (config.max && data[key] > config.max) {
            throw new Error(`${key} must be no more than ${config.max}`);
          }
          
          // Sanitize based on type
          sanitized[key] = this.sanitizeValue(data[key], config);
        } else if (config.default !== undefined) {
          sanitized[key] = config.default;
        }
      }
      
      return sanitized;
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  // Sanitize individual values
  sanitizeValue(value, config) {
    if (config.sanitize) {
      return config.sanitize(value);
    }
    
    switch (config.type) {
      case 'string':
        return String(value).trim();
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'email':
        return String(value).toLowerCase().trim();
      case 'phone':
        return String(value).replace(/[^\d+\-\(\)\s]/g, '');
      case 'url':
        return String(value).trim();
      default:
        return value;
    }
  }

  // Data encryption
  encryptData(data, secretKey) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(secretKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipher(algorithm, key);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  // Data decryption
  decryptData(encryptedData, secretKey) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(secretKey, 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Data compression (simple implementation)
  compressData(data) {
    try {
      const jsonString = JSON.stringify(data);
      const compressed = Buffer.from(jsonString).toString('base64');
      
      return {
        compressed,
        originalSize: jsonString.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / jsonString.length) * 100
      };
    } catch (error) {
      throw new Error(`Compression failed: ${error.message}`);
    }
  }

  // Data decompression
  decompressData(compressedData) {
    try {
      const decompressed = Buffer.from(compressedData.compressed, 'base64').toString();
      return JSON.parse(decompressed);
    } catch (error) {
      throw new Error(`Decompression failed: ${error.message}`);
    }
  }

  // Batch processing with queue
  async processBatch(items, processor, batchSize = 10) {
    return new Promise((resolve, reject) => {
      const results = [];
      let currentIndex = 0;
      
      const processNextBatch = async () => {
        if (currentIndex >= items.length) {
          resolve(results);
          return;
        }
        
        const batch = items.slice(currentIndex, currentIndex + batchSize);
        currentIndex += batchSize;
        
        try {
          const batchResults = await Promise.all(
            batch.map(item => processor(item))
          );
          
          results.push(...batchResults);
          
          // Process next batch with a small delay
          setTimeout(processNextBatch, 100);
        } catch (error) {
          reject(error);
        }
      };
      
      processNextBatch();
    });
  }

  // Data aggregation
  aggregateData(data, groupBy, aggregations) {
    try {
      const grouped = {};
      
      data.forEach(item => {
        const groupKey = groupBy.map(key => item[key]).join('|');
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            group: groupBy.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {}),
            count: 0,
            values: {}
          };
          
          // Initialize aggregation values
          aggregations.forEach(agg => {
            grouped[groupKey].values[agg.field] = agg.initialValue;
          });
        }
        
        grouped[groupKey].count++;
        
        // Apply aggregations
        aggregations.forEach(agg => {
          const currentValue = grouped[groupKey].values[agg.field];
          const itemValue = item[agg.field];
          
          switch (agg.type) {
            case 'sum':
              grouped[groupKey].values[agg.field] = currentValue + (itemValue || 0);
              break;
            case 'avg':
              grouped[groupKey].values[agg.field] = (currentValue + (itemValue || 0)) / 2;
              break;
            case 'min':
              grouped[groupKey].values[agg.field] = Math.min(currentValue, itemValue || Infinity);
              break;
            case 'max':
              grouped[groupKey].values[agg.field] = Math.max(currentValue, itemValue || -Infinity);
              break;
            case 'count':
              grouped[groupKey].values[agg.field] = currentValue + 1;
              break;
          }
        });
      });
      
      return Object.values(grouped);
    } catch (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }
  }

  // Data transformation
  transformData(data, transformations) {
    try {
      return data.map(item => {
        const transformed = { ...item };
        
        transformations.forEach(transform => {
          switch (transform.type) {
            case 'rename':
              if (transformed[transform.from]) {
                transformed[transform.to] = transformed[transform.from];
                delete transformed[transform.from];
              }
              break;
              
            case 'calculate':
              if (transform.formula) {
                const formula = transform.formula.replace(/\{(\w+)\}/g, (match, field) => {
                  return transformed[field] || 0;
                });
                try {
                  transformed[transform.field] = eval(formula);
                } catch (e) {
                  transformed[transform.field] = 0;
                }
              }
              break;
              
            case 'format':
              if (transformed[transform.field]) {
                switch (transform.format) {
                  case 'currency':
                    transformed[transform.field] = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(transformed[transform.field]);
                    break;
                  case 'date':
                    transformed[transform.field] = new Date(transformed[transform.field]).toLocaleDateString();
                    break;
                  case 'uppercase':
                    transformed[transform.field] = String(transformed[transform.field]).toUpperCase();
                    break;
                  case 'lowercase':
                    transformed[transform.field] = String(transformed[transform.field]).toLowerCase();
                    break;
                }
              }
              break;
              
            case 'conditional':
              if (transform.condition) {
                const condition = transform.condition.replace(/\{(\w+)\}/g, (match, field) => {
                  return transformed[field] || '';
                });
                try {
                  if (eval(condition)) {
                    transformed[transform.field] = transform.trueValue;
                  } else {
                    transformed[transform.field] = transform.falseValue;
                  }
                } catch (e) {
                  transformed[transform.field] = transform.falseValue;
                }
              }
              break;
          }
        });
        
        return transformed;
      });
    } catch (error) {
      throw new Error(`Transformation failed: ${error.message}`);
    }
  }

  // Data deduplication
  deduplicateData(data, keyFields) {
    try {
      const seen = new Set();
      const unique = [];
      
      data.forEach(item => {
        const key = keyFields.map(field => item[field]).join('|');
        
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });
      
      return unique;
    } catch (error) {
      throw new Error(`Deduplication failed: ${error.message}`);
    }
  }

  // Data sampling
  sampleData(data, sampleSize, method = 'random') {
    try {
      if (sampleSize >= data.length) {
        return data;
      }
      
      switch (method) {
        case 'random':
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, sampleSize);
          
        case 'systematic':
          const step = Math.floor(data.length / sampleSize);
          const sample = [];
          for (let i = 0; i < sampleSize; i++) {
            sample.push(data[i * step]);
          }
          return sample;
          
        case 'stratified':
          // Simple stratified sampling
          const groups = {};
          data.forEach(item => {
            const group = item.category || 'default';
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
          });
          
          const sample = [];
          const groupSampleSize = Math.floor(sampleSize / Object.keys(groups).length);
          
          Object.values(groups).forEach(group => {
            const groupSample = this.sampleData(group, groupSampleSize, 'random');
            sample.push(...groupSample);
          });
          
          return sample.slice(0, sampleSize);
          
        default:
          throw new Error(`Unknown sampling method: ${method}`);
      }
    } catch (error) {
      throw new Error(`Sampling failed: ${error.message}`);
    }
  }

  // Cache management
  setCache(key, value, ttl = 3600000) { // Default 1 hour
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  clearCache() {
    this.cache.clear();
  }

  // Performance monitoring
  measurePerformance(fn, iterations = 1000) {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const averageTime = totalTime / iterations;
    
    return {
      totalTime,
      averageTime,
      iterations,
      operationsPerSecond: (iterations / totalTime) * 1000
    };
  }
}

module.exports = DataProcessor;
