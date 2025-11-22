/**
 * API Client for ¢arma backend communication
 */
class ApiClient {
    static baseURL = window.location.origin + '/api';

    /**
     * Test API connection with the selected provider
     */
    static async testConnection(provider, apiKey) {
        try {
            const response = await fetch(`${this.baseURL}/analysis/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, apiKey })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Connection test failed');
            }

            return response.json();
        } catch (error) {
            console.error('API test connection error:', error);
            throw error;
        }
    }

    /**
     * Analyze a product from an uploaded screenshot
     */
    static async analyzeProduct(imageData, config) {
        try {
            const response = await fetch(`${this.baseURL}/analysis/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    config: {
                        apiProvider: config.apiProvider,
                        apiKey: config.apiKey,
                        ethicalPriorities: config.ethicalPriorities
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Analysis failed');
            }

            return response.json();
        } catch (error) {
            console.error('API analyze product error:', error);
            throw error;
        }
    }

    /**
     * Find ethical alternatives for a product
     */
    static async findAlternatives(currentAnalysis, config) {
        try {
            const response = await fetch(`${this.baseURL}/alternatives/find`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis: currentAnalysis,
                    config: {
                        apiProvider: config.apiProvider,
                        apiKey: config.apiKey,
                        ethicalPriorities: config.ethicalPriorities
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to find alternatives');
            }

            return response.json();
        } catch (error) {
            console.error('API find alternatives error:', error);
            throw error;
        }
    }

    /**
     * Health check endpoint
     */
    static async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}
