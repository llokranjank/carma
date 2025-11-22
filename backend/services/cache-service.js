/**
 * Simple in-memory cache service for ¢arma
 * In production, consider using Redis or a similar solution
 */
class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Generate a cache key from image data
     */
    generateKey(imageData, priorities) {
        // Create a simple hash from the image data and priorities
        const crypto = require('crypto');
        const hash = crypto.createHash('md5');
        hash.update(imageData.substring(0, 1000)); // Use first 1000 chars for speed
        hash.update(priorities.sort().join(','));
        return hash.digest('hex');
    }

    /**
     * Get cached analysis
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set cached analysis
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    }

    /**
     * Delete cached entry
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create singleton instance
const cacheService = new CacheService();

// Run cleanup every 5 minutes
setInterval(() => {
    cacheService.cleanup();
}, 5 * 60 * 1000);

module.exports = cacheService;
