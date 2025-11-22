const express = require('express');
const router = express.Router();
const llmService = require('../services/llm-service');

/**
 * POST /api/alternatives/find
 * Find ethical alternatives for a product
 */
router.post('/find', async (req, res) => {
    try {
        const { analysis, config } = req.body;

        if (!analysis) {
            return res.status(400).json({
                success: false,
                error: 'Product analysis is required'
            });
        }

        if (!config || !config.apiKey) {
            return res.status(400).json({
                success: false,
                error: 'API configuration is required'
            });
        }

        console.log('Finding alternatives for:', analysis.product?.name);

        const alternatives = await llmService.findAlternatives(analysis, config);

        res.json({
            success: true,
            alternatives
        });
    } catch (error) {
        console.error('Find alternatives error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to find alternatives'
        });
    }
});

module.exports = router;
