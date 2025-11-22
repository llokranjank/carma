const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const analysisRouter = require('./routes/analysis');
const alternativesRouter = require('./routes/alternatives');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/analysis', analysisRouter);
app.use('/api/alternatives', alternativesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ========================================
    ¢arma - Ethical Shopping Assistant
    ========================================
    Server running on: http://localhost:${PORT}
    Health check: http://localhost:${PORT}/api/health
    ========================================
    `);
});

module.exports = app;
