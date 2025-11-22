/**
 * UI Controller for ¢arma - manages DOM updates and display logic
 */
class UIController {
    /**
     * Display product information
     */
    static displayProductInfo(product) {
        const container = document.getElementById('productInfo');
        if (!product) {
            container.innerHTML = '<p class="empty-state">No product information available</p>';
            return;
        }

        container.innerHTML = `
            <div class="product-details">
                <h2>${this.escapeHtml(product.name || 'Unknown Product')}</h2>
                <p class="product-meta">
                    <strong>Brand:</strong> ${this.escapeHtml(product.brand || 'Unknown')}<br>
                    <strong>Category:</strong> ${this.escapeHtml(product.category || 'Unknown')}<br>
                    <strong>Price:</strong> ${this.escapeHtml(product.price || 'N/A')}
                </p>
            </div>
        `;
    }

    /**
     * Display ethical scores/concerns
     */
    static displayEthicalScores(concerns) {
        const container = document.getElementById('scoreItems');
        if (!concerns) {
            container.innerHTML = '<p class="empty-state">No ethical evaluation available</p>';
            return;
        }

        const priorityLabels = {
            water_usage: 'Water Usage & Conservation',
            energy_fossil: 'Energy & Carbon Footprint',
            labor_rights: 'Workers Rights & Fair Labor'
        };

        const priorityIcons = {
            water_usage: '💧',
            energy_fossil: '⚡',
            labor_rights: '👥'
        };

        let html = '';
        for (const [key, data] of Object.entries(concerns)) {
            if (!data) continue;

            const rating = (data.rating || 'unknown').toLowerCase();
            const ratingClass = rating === 'low' ? 'low' :
                              rating === 'moderate' ? 'moderate' :
                              rating === 'high' ? 'high' :
                              rating === 'critical' ? 'critical' : '';

            html += `
                <div class="score-item ${ratingClass}">
                    <div class="score-header">
                        <span class="score-title">${priorityIcons[key] || ''} ${priorityLabels[key] || key}</span>
                        <span class="score-badge ${ratingClass}">${this.escapeHtml(data.rating || 'Unknown')}</span>
                    </div>
                    <p>${this.escapeHtml(data.details || 'No details available')}</p>
                </div>
            `;
        }

        container.innerHTML = html || '<p class="empty-state">No ethical concerns evaluated</p>';
    }

    /**
     * Display supply chain breakdown
     */
    static displaySupplyChain(supplyChain) {
        const container = document.getElementById('supplyChainItems');
        if (!supplyChain) {
            container.innerHTML = '<p class="empty-state">No supply chain information available</p>';
            return;
        }

        let html = '';

        // Materials
        if (supplyChain.materials && supplyChain.materials.length > 0) {
            html += `
                <div class="supply-chain-item">
                    <h4>Raw Materials</h4>
                    <p>${supplyChain.materials.map(m => this.escapeHtml(m)).join(', ')}</p>
                </div>
            `;
        }

        // Manufacturing
        if (supplyChain.manufacturing) {
            html += `
                <div class="supply-chain-item">
                    <h4>Manufacturing</h4>
                    <p><strong>Location:</strong> ${this.escapeHtml(supplyChain.manufacturing.location || 'Unknown')}</p>
                    <p><strong>Conditions:</strong> ${this.escapeHtml(supplyChain.manufacturing.conditions || 'Unknown')}</p>
                </div>
            `;
        }

        // Transportation
        if (supplyChain.transportation) {
            html += `
                <div class="supply-chain-item">
                    <h4>Transportation</h4>
                    <p><strong>Method:</strong> ${this.escapeHtml(supplyChain.transportation.method || 'Unknown')}</p>
                    <p><strong>Distance:</strong> ${this.escapeHtml(supplyChain.transportation.distance || 'Unknown')}</p>
                </div>
            `;
        }

        // Disposal
        if (supplyChain.disposal) {
            const recyclable = supplyChain.disposal.recyclable ? 'Yes' : 'No';
            const biodegradable = supplyChain.disposal.biodegradable ? 'Yes' : 'No';
            html += `
                <div class="supply-chain-item">
                    <h4>End of Life</h4>
                    <p><strong>Recyclable:</strong> ${recyclable}</p>
                    <p><strong>Biodegradable:</strong> ${biodegradable}</p>
                    ${supplyChain.disposal.specialHandling ? `<p><strong>Special Handling:</strong> ${this.escapeHtml(supplyChain.disposal.specialHandling)}</p>` : ''}
                </div>
            `;
        }

        container.innerHTML = html || '<p class="empty-state">No supply chain information available</p>';
    }

    /**
     * Display recent news items
     */
    static displayRecentNews(news) {
        const container = document.getElementById('newsItems');
        if (!news || news.length === 0) {
            container.innerHTML = '<p class="empty-state">No recent news found</p>';
            return;
        }

        let html = '';
        for (const item of news) {
            const impact = (item.impact || 'neutral').toLowerCase();
            html += `
                <div class="news-item ${impact}">
                    <div class="news-date">${this.escapeHtml(item.date || 'Unknown date')}</div>
                    <div class="news-headline">${this.escapeHtml(item.headline || 'No headline')}</div>
                    <div class="news-summary">${this.escapeHtml(item.summary || '')}</div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Display comparison to category average
     */
    static displayComparison(comparison) {
        const container = document.getElementById('comparisonDisplay');
        if (!comparison) {
            container.innerHTML = '<p class="empty-state">No comparison data available</p>';
            return;
        }

        const rating = (comparison.rating || 'similar').toLowerCase();
        const ratingClass = rating === 'better' ? 'better' :
                          rating === 'worse' ? 'worse' : 'similar';

        const ratingText = rating === 'better' ? 'Better Than Average' :
                          rating === 'worse' ? 'Worse Than Average' : 'Similar to Average';

        container.innerHTML = `
            <div class="comparison-rating ${ratingClass}">${ratingText}</div>
            <p class="comparison-explanation">${this.escapeHtml(comparison.explanation || '')}</p>
        `;
    }

    /**
     * Display summary with pros, cons, rating, and recommendation
     */
    static displaySummary(summary) {
        if (!summary) return;

        // Pros
        const prosContainer = document.getElementById('prosList');
        if (summary.pros && summary.pros.length > 0) {
            prosContainer.innerHTML = `
                <h3>Pros</h3>
                <ul>
                    ${summary.pros.map(pro => `<li>${this.escapeHtml(pro)}</li>`).join('')}
                </ul>
            `;
        } else {
            prosContainer.innerHTML = '<h3>Pros</h3><p class="empty-state">No pros identified</p>';
        }

        // Cons
        const consContainer = document.getElementById('consList');
        if (summary.cons && summary.cons.length > 0) {
            consContainer.innerHTML = `
                <h3>Cons</h3>
                <ul>
                    ${summary.cons.map(con => `<li>${this.escapeHtml(con)}</li>`).join('')}
                </ul>
            `;
        } else {
            consContainer.innerHTML = '<h3>Cons</h3><p class="empty-state">No cons identified</p>';
        }

        // Overall Rating
        const ratingContainer = document.getElementById('overallRating');
        const rating = parseFloat(summary.overallRating) || 0;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (halfStar) stars += '☆';
        for (let i = 0; i < emptyStars; i++) stars += '☆';

        ratingContainer.innerHTML = `
            <div class="rating-stars">${stars}</div>
            <div class="rating-text">${rating.toFixed(1)} out of 5</div>
        `;

        // Recommendation
        const recommendationContainer = document.getElementById('recommendation');
        recommendationContainer.innerHTML = this.escapeHtml(summary.recommendation || 'No recommendation available');
    }

    /**
     * Display alternative products
     */
    static displayAlternatives(alternatives) {
        const section = document.getElementById('alternativesSection');
        const grid = document.getElementById('alternativesGrid');

        if (!alternatives || alternatives.length === 0) {
            section.style.display = 'block';
            grid.innerHTML = '<p class="empty-state">No alternatives found</p>';
            return;
        }

        let html = '';
        for (const alt of alternatives) {
            html += `
                <div class="alternative-card">
                    <div class="alternative-name">${this.escapeHtml(alt.name || 'Unknown Product')}</div>
                    <div class="alternative-brand">${this.escapeHtml(alt.brand || 'Unknown Brand')}</div>
                    <div class="alternative-price">${this.escapeHtml(alt.price || 'Price not available')}</div>
                    ${alt.improvements && alt.improvements.length > 0 ? `
                        <div class="improvements">
                            <h4>Why It's Better</h4>
                            <ul>
                                ${alt.improvements.map(imp => `<li>${this.escapeHtml(imp)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${alt.link ? `<a href="${this.escapeHtml(alt.link)}" target="_blank" class="btn-secondary" style="display: inline-block; margin-top: 10px;">View Product</a>` : ''}
                </div>
            `;
        }

        section.style.display = 'block';
        grid.innerHTML = html;
    }

    /**
     * Escape HTML to prevent XSS
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show a notification message
     */
    static showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a toast library
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'error' ? '#D32F2F' : type === 'success' ? '#4CAF50' : '#2196F3'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
