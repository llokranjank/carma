const axios = require('axios');
const promptTemplates = require('../prompts/templates');

class LLMService {
    constructor() {
        this.providers = {
            claude: {
                url: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-5-sonnet-20241022'
            },
            gemini: {
                url: 'https://generativelanguage.googleapis.com/v1beta/models',
                model: 'gemini-1.5-pro-latest'
            }
        };
    }

    /**
     * Analyze a product from a screenshot
     */
    async analyzeProduct(imageBase64, config) {
        const prompt = promptTemplates.buildAnalysisPrompt(config.ethicalPriorities);

        if (config.apiProvider === 'claude') {
            return this.callClaude(imageBase64, prompt, config.apiKey);
        } else if (config.apiProvider === 'gemini') {
            return this.callGemini(imageBase64, prompt, config.apiKey);
        }

        throw new Error('Invalid API provider: ' + config.apiProvider);
    }

    /**
     * Find ethical alternatives for a product
     */
    async findAlternatives(analysis, config) {
        const prompt = promptTemplates.buildAlternativesPrompt(analysis, config.ethicalPriorities);

        if (config.apiProvider === 'claude') {
            return this.callClaudeText(prompt, config.apiKey);
        } else if (config.apiProvider === 'gemini') {
            return this.callGeminiText(prompt, config.apiKey);
        }

        throw new Error('Invalid API provider: ' + config.apiProvider);
    }

    /**
     * Call Claude API with image
     */
    async callClaude(imageBase64, prompt, apiKey) {
        try {
            // Remove data URL prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            // Detect media type from data URL
            let mediaType = 'image/png';
            if (imageBase64.startsWith('data:image/jpeg')) {
                mediaType = 'image/jpeg';
            } else if (imageBase64.startsWith('data:image/gif')) {
                mediaType = 'image/gif';
            } else if (imageBase64.startsWith('data:image/webp')) {
                mediaType = 'image/webp';
            }

            const response = await axios.post(
                this.providers.claude.url,
                {
                    model: this.providers.claude.model,
                    max_tokens: 4096,
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: base64Data
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }]
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    timeout: 120000 // 2 minute timeout
                }
            );

            const content = response.data.content[0].text;
            return this.parseJsonResponse(content);
        } catch (error) {
            console.error('Claude API error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || error.message);
        }
    }

    /**
     * Call Claude API with text only
     */
    async callClaudeText(prompt, apiKey) {
        try {
            const response = await axios.post(
                this.providers.claude.url,
                {
                    model: this.providers.claude.model,
                    max_tokens: 4096,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    timeout: 120000
                }
            );

            const content = response.data.content[0].text;
            return this.parseJsonArrayResponse(content);
        } catch (error) {
            console.error('Claude API error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || error.message);
        }
    }

    /**
     * Call Gemini API with image
     */
    async callGemini(imageBase64, prompt, apiKey) {
        try {
            // Remove data URL prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            // Detect mime type
            let mimeType = 'image/png';
            if (imageBase64.startsWith('data:image/jpeg')) {
                mimeType = 'image/jpeg';
            } else if (imageBase64.startsWith('data:image/gif')) {
                mimeType = 'image/gif';
            } else if (imageBase64.startsWith('data:image/webp')) {
                mimeType = 'image/webp';
            }

            const url = `${this.providers.gemini.url}/${this.providers.gemini.model}:generateContent?key=${apiKey}`;

            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            },
                            {
                                text: prompt
                            }
                        ]
                    }],
                    generationConfig: {
                        maxOutputTokens: 4096,
                        temperature: 0.7
                    }
                },
                {
                    headers: {
                        'content-type': 'application/json'
                    },
                    timeout: 120000
                }
            );

            const content = response.data.candidates[0].content.parts[0].text;
            return this.parseJsonResponse(content);
        } catch (error) {
            console.error('Gemini API error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || error.message);
        }
    }

    /**
     * Call Gemini API with text only
     */
    async callGeminiText(prompt, apiKey) {
        try {
            const url = `${this.providers.gemini.url}/${this.providers.gemini.model}:generateContent?key=${apiKey}`;

            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 4096,
                        temperature: 0.7
                    }
                },
                {
                    headers: {
                        'content-type': 'application/json'
                    },
                    timeout: 120000
                }
            );

            const content = response.data.candidates[0].content.parts[0].text;
            return this.parseJsonArrayResponse(content);
        } catch (error) {
            console.error('Gemini API error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || error.message);
        }
    }

    /**
     * Test API connection
     */
    async testConnection(provider, apiKey) {
        try {
            if (provider === 'claude') {
                const response = await axios.post(
                    this.providers.claude.url,
                    {
                        model: this.providers.claude.model,
                        max_tokens: 10,
                        messages: [{
                            role: 'user',
                            content: 'Hi'
                        }]
                    },
                    {
                        headers: {
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
                return { success: true };
            } else if (provider === 'gemini') {
                const url = `${this.providers.gemini.url}/${this.providers.gemini.model}:generateContent?key=${apiKey}`;
                const response = await axios.post(
                    url,
                    {
                        contents: [{
                            parts: [{
                                text: 'Hi'
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 10
                        }
                    },
                    {
                        headers: {
                            'content-type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
                return { success: true };
            }

            return { success: false, error: 'Unknown provider' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    /**
     * Parse JSON response from LLM
     */
    parseJsonResponse(content) {
        try {
            // Try to find JSON object in the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        } catch (error) {
            console.error('JSON parse error:', error);
            console.error('Content:', content.substring(0, 500));

            // Return a default structure if parsing fails
            return this.getDefaultAnalysis();
        }
    }

    /**
     * Parse JSON array response from LLM
     */
    parseJsonArrayResponse(content) {
        try {
            // Try to find JSON array in the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON array found in response');
        } catch (error) {
            console.error('JSON array parse error:', error);
            return [];
        }
    }

    /**
     * Get default analysis structure for error cases
     */
    getDefaultAnalysis() {
        return {
            product: {
                name: 'Unknown Product',
                brand: 'Unknown',
                category: 'Unknown',
                price: 'N/A'
            },
            supplyChain: {
                materials: ['Unable to determine'],
                manufacturing: {
                    location: 'Unknown',
                    conditions: 'Unable to analyze'
                },
                transportation: {
                    method: 'Unknown',
                    distance: 'Unknown'
                },
                disposal: {
                    recyclable: false,
                    biodegradable: false,
                    specialHandling: 'Unknown'
                }
            },
            ethicalConcerns: {
                water_usage: {
                    rating: 'MODERATE',
                    details: 'Unable to fully analyze water usage concerns'
                },
                energy_fossil: {
                    rating: 'MODERATE',
                    details: 'Unable to fully analyze energy and carbon concerns'
                },
                labor_rights: {
                    rating: 'MODERATE',
                    details: 'Unable to fully analyze labor rights concerns'
                }
            },
            recentNews: [],
            comparison: {
                rating: 'SIMILAR',
                explanation: 'Unable to compare to category average'
            },
            summary: {
                pros: ['Unable to determine pros'],
                cons: ['Unable to determine cons'],
                overallRating: 2.5,
                recommendation: 'Analysis incomplete - please try again with a clearer image'
            }
        };
    }
}

module.exports = new LLMService();
