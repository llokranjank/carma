const express = require('express');
const router = express.Router();
const llmService = require('../services/llm-service');

/**
 * POST /api/analysis/test
 * Test API connection with the selected provider
 */
router.post('/test', async (req, res) => {
    try {
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({
                success: false,
                error: 'Provider and API key are required'
            });
        }

        const result = await llmService.testConnection(provider, apiKey);
        res.json(result);
    } catch (error) {
        console.error('Test connection error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to test connection'
        });
    }
});

/**
 * POST /api/analysis/analyze
 * Analyze a product from an uploaded screenshot
 */
router.post('/analyze', async (req, res) => {
    try {
        const { image, config } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'Image data is required'
            });
        }

        if (!config || !config.apiKey) {
            return res.status(400).json({
                success: false,
                error: 'API configuration is required'
            });
        }

        if (!config.ethicalPriorities || config.ethicalPriorities.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one ethical priority must be selected'
            });
        }

        console.log('Starting product analysis...');
        console.log('Provider:', config.apiProvider);
        console.log('Priorities:', config.ethicalPriorities);

        const analysis = await llmService.analyzeProduct(image, config);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze product'
        });
    }
});

module.exports = router;
