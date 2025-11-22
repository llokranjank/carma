const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import services
const llmService = require('../backend/services/llm-service');

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Test API connection
app.post('/api/analysis/test', async (req, res) => {
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

// Analyze product
app.post('/api/analysis/analyze', async (req, res) => {
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

// Find alternatives
app.post('/api/alternatives/find', async (req, res) => {
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

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

module.exports = app;
