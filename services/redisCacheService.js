const redis = require('redis');
const config = require('../config/production');

class RedisCacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initializeClient();
  }

  initializeClient() {
    try {
      this.client = redis.createClient({
        url: config.redis.url,
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
    }
  }

  // Set cache with TTL
  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      
      return true;
    } catch (error) {
      console.error(`Failed to set cache key ${key}:`, error);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const value = await this.client.get(key);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  // Delete cache key
  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check cache key ${key}:`, error);
      return false;
    }
  }

  // Set TTL for key
  async expire(key, ttl) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error(`Failed to set TTL for cache key ${key}:`, error);
      return false;
    }
  }

  // Get TTL for key
  async ttl(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Failed to get TTL for cache key ${key}:`, error);
      return -1;
    }
  }

  // Increment counter
  async incr(key, increment = 1) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      return await this.client.incrBy(key, increment);
    } catch (error) {
      console.error(`Failed to increment cache key ${key}:`, error);
      return null;
    }
  }

  // Decrement counter
  async decr(key, decrement = 1) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      return await this.client.decrBy(key, decrement);
    } catch (error) {
      console.error(`Failed to decrement cache key ${key}:`, error);
      return null;
    }
  }

  // Set hash field
  async hset(key, field, value) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const serializedValue = JSON.stringify(value);
      return await this.client.hSet(key, field, serializedValue);
    } catch (error) {
      console.error(`Failed to set hash field ${key}.${field}:`, error);
      return false;
    }
  }

  // Get hash field
  async hget(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const value = await this.client.hGet(key, field);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to get hash field ${key}.${field}:`, error);
      return null;
    }
  }

  // Get all hash fields
  async hgetall(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const hash = await this.client.hGetAll(key);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }

      return result;
    } catch (error) {
      console.error(`Failed to get all hash fields for ${key}:`, error);
      return {};
    }
  }

  // Delete hash field
  async hdel(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const result = await this.client.hDel(key, field);
      return result > 0;
    } catch (error) {
      console.error(`Failed to delete hash field ${key}.${field}:`, error);
      return false;
    }
  }

  // Add to set
  async sadd(key, ...members) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      return await this.client.sAdd(key, members);
    } catch (error) {
      console.error(`Failed to add to set ${key}:`, error);
      return 0;
    }
  }

  // Get set members
  async smembers(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      return await this.client.sMembers(key);
    } catch (error) {
      console.error(`Failed to get set members for ${key}:`, error);
      return [];
    }
  }

  // Remove from set
  async srem(key, ...members) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      return await this.client.sRem(key, members);
    } catch (error) {
      console.error(`Failed to remove from set ${key}:`, error);
      return 0;
    }
  }

  // Push to list
  async lpush(key, ...values) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.client.lPush(key, serializedValues);
    } catch (error) {
      console.error(`Failed to push to list ${key}:`, error);
      return 0;
    }
  }

  // Pop from list
  async rpop(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const value = await this.client.rPop(key);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to pop from list ${key}:`, error);
      return null;
    }
  }

  // Get list range
  async lrange(key, start, stop) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const values = await this.client.lRange(key, start, stop);
      return values.map(v => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      });
    } catch (error) {
      console.error(`Failed to get list range for ${key}:`, error);
      return [];
    }
  }

  // Clear all cache
  async flushall() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Failed to flush all cache:', error);
      return false;
    }
  }

  // Get cache info
  async info() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const info = await this.client.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return null;
    }
  }

  // Parse Redis info string
  parseRedisInfo(infoString) {
    const info = {};
    const lines = infoString.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        info[key] = value;
      }
    }
    
    return info;
  }

  // Cache middleware for Express
  cacheMiddleware(ttl = 3600, keyGenerator = null) {
    return async (req, res, next) => {
      try {
        const key = keyGenerator ? keyGenerator(req) : `cache:${req.method}:${req.url}`;
        
        const cached = await this.get(key);
        if (cached !== null) {
          res.set('X-Cache', 'HIT');
          return res.json(cached);
        }
        
        res.set('X-Cache', 'MISS');
        
        const originalJson = res.json;
        res.json = function(data) {
          this.set(key, data, ttl);
          return originalJson.call(this, data);
        };
        
        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Close Redis connection
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
      }
    } catch (error) {
      console.error('Failed to close Redis connection:', error);
    }
  }
}

// Create singleton instance
const redisCacheService = new RedisCacheService();

module.exports = redisCacheService;
