/**
 * Main Application Controller for ¢arma
 */
class CarmaApp {
    constructor() {
        this.config = {
            apiProvider: 'claude',
            apiKey: '',
            ethicalPriorities: []
        };
        this.currentAnalysis = null;
        this.currentImageData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedConfig();
    }

    setupEventListeners() {
        // Configuration
        document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('testApiBtn').addEventListener('click', () => this.testApiConnection());

        // File Upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');

        // Drag and Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Analysis
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeProduct());
        document.getElementById('removeImageBtn').addEventListener('click', () => this.removeImage());
        document.getElementById('findAlternativesBtn').addEventListener('click', () => this.findAlternatives());
        document.getElementById('newAnalysisBtn').addEventListener('click', () => this.resetForNewAnalysis());
    }

    loadSavedConfig() {
        const savedConfig = localStorage.getItem('carmaConfig');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsed };

                // Populate form with saved values
                const providerRadio = document.querySelector(`input[name="aiProvider"][value="${this.config.apiProvider}"]`);
                if (providerRadio) providerRadio.checked = true;

                document.getElementById('apiKey').value = this.config.apiKey;

                // Check saved ethical priorities
                document.querySelectorAll('input[name="ethics"]').forEach(cb => {
                    cb.checked = this.config.ethicalPriorities.includes(cb.value);
                });

                // Show upload section if configured
                if (this.config.apiKey) {
                    this.showUploadSection();
                }
            } catch (e) {
                console.error('Failed to load saved config:', e);
            }
        }
    }

    async saveConfiguration() {
        // Get selected provider
        const selectedProvider = document.querySelector('input[name="aiProvider"]:checked');
        this.config.apiProvider = selectedProvider ? selectedProvider.value : 'claude';

        // Get API key
        this.config.apiKey = document.getElementById('apiKey').value.trim();

        // Get ethical priorities
        this.config.ethicalPriorities = Array.from(
            document.querySelectorAll('input[name="ethics"]:checked')
        ).map(cb => cb.value);

        // Validate
        if (!this.config.apiKey) {
            this.showStatus('apiStatus', 'Please enter your API key', 'error');
            return;
        }

        if (this.config.ethicalPriorities.length === 0) {
            this.showStatus('apiStatus', 'Please select at least one ethical priority', 'error');
            return;
        }

        // Save to localStorage
        localStorage.setItem('carmaConfig', JSON.stringify(this.config));

        // Show success and transition to upload section
        this.showStatus('apiStatus', 'Configuration saved successfully!', 'success');
        setTimeout(() => this.showUploadSection(), 1000);
    }

    async testApiConnection() {
        const selectedProvider = document.querySelector('input[name="aiProvider"]:checked');
        const provider = selectedProvider ? selectedProvider.value : 'claude';
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!apiKey) {
            this.showStatus('apiStatus', 'Please enter an API key', 'error');
            return;
        }

        this.showStatus('apiStatus', 'Testing connection...', '');

        try {
            const response = await ApiClient.testConnection(provider, apiKey);
            if (response.success) {
                this.showStatus('apiStatus', 'Connection successful!', 'success');
            } else {
                this.showStatus('apiStatus', 'Connection failed: ' + (response.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            this.showStatus('apiStatus', 'Connection failed: ' + error.message, 'error');
        }
    }

    showStatus(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = 'status-message ' + type;
        }
    }

    showUploadSection() {
        document.getElementById('configSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
    }

    handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Read and display preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            this.showImagePreview(e.target.result);
        };
        reader.onerror = () => {
            alert('Failed to read file');
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(imageSrc) {
        document.querySelector('.upload-prompt').style.display = 'none';
        document.getElementById('previewArea').style.display = 'block';
        document.getElementById('previewImage').src = imageSrc;
        document.getElementById('analyzeBtn').disabled = false;
    }

    removeImage() {
        this.currentImageData = null;
        document.querySelector('.upload-prompt').style.display = 'block';
        document.getElementById('previewArea').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = true;
        document.getElementById('fileInput').value = '';
    }

    async analyzeProduct() {
        if (!this.currentImageData) {
            alert('Please upload an image first');
            return;
        }

        // Show loading state
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';

        // Update loading steps
        const steps = [
            'Identifying product from screenshot...',
            'Analyzing supply chain components...',
            'Evaluating ethical concerns...',
            'Searching for recent news and reports...',
            'Comparing to alternative products...'
        ];

        let currentStep = 0;
        const stepElements = document.querySelectorAll('.loading-steps .step');

        const stepInterval = setInterval(() => {
            if (currentStep < steps.length) {
                document.getElementById('loadingStep').textContent = steps[currentStep];

                stepElements.forEach((step, index) => {
                    if (index < currentStep) {
                        step.classList.remove('active');
                        step.classList.add('completed');
                    } else if (index === currentStep) {
                        step.classList.add('active');
                        step.classList.remove('completed');
                    } else {
                        step.classList.remove('active', 'completed');
                    }
                });

                currentStep++;
            }
        }, 2000);

        try {
            // Call backend API
            const response = await ApiClient.analyzeProduct(
                this.currentImageData,
                this.config
            );

            clearInterval(stepInterval);

            if (response.success) {
                this.currentAnalysis = response.analysis;
                this.displayResults(response.analysis);
            } else {
                alert('Analysis failed: ' + (response.error || 'Unknown error'));
                this.resetForNewAnalysis();
            }
        } catch (error) {
            clearInterval(stepInterval);
            alert('Error during analysis: ' + error.message);
            this.resetForNewAnalysis();
        }
    }

    displayResults(analysis) {
        // Hide loading, show results
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        // Use UIController to populate all result sections
        UIController.displayProductInfo(analysis.product);
        UIController.displayEthicalScores(analysis.ethicalConcerns);
        UIController.displaySupplyChain(analysis.supplyChain);
        UIController.displayRecentNews(analysis.recentNews);
        UIController.displayComparison(analysis.comparison);
        UIController.displaySummary(analysis.summary);
    }

    async findAlternatives() {
        if (!this.currentAnalysis) return;

        // Show loading state for alternatives
        const alternativesSection = document.getElementById('alternativesSection');
        const alternativesGrid = document.getElementById('alternativesGrid');

        alternativesSection.style.display = 'block';
        alternativesGrid.innerHTML = '<div class="loading-card" style="padding: 20px; text-align: center;"><div class="spinner"></div><p>Finding ethical alternatives...</p></div>';

        try {
            const response = await ApiClient.findAlternatives(
                this.currentAnalysis,
                this.config
            );

            if (response.success) {
                UIController.displayAlternatives(response.alternatives);
            } else {
                alternativesGrid.innerHTML = '<p class="empty-state">Could not find alternatives: ' + (response.error || 'Unknown error') + '</p>';
            }
        } catch (error) {
            alternativesGrid.innerHTML = '<p class="empty-state">Error finding alternatives: ' + error.message + '</p>';
        }
    }

    resetForNewAnalysis() {
        // Reset all sections
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('alternativesSection').style.display = 'none';

        // Clear current data
        this.currentAnalysis = null;
        this.removeImage();

        // Reset loading steps
        document.querySelectorAll('.loading-steps .step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }

    /**
     * Reset to configuration screen
     */
    resetToConfig() {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('configSection').style.display = 'block';
        document.getElementById('alternativesSection').style.display = 'none';

        this.currentAnalysis = null;
        this.removeImage();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.carmaApp = new CarmaApp();
});
