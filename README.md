# Carma - Ethical Shopping Assistant

**Carma** (karma with a cent sign) is a web application that helps you make shopping choices that align with your values. Upload an Amazon product screenshot and get AI-powered analysis of the product's supply chain ethics, including environmental impact, labor practices, and more.

## Features

- **Screenshot Analysis**: Upload Amazon product screenshots for instant ethical analysis
- **Supply Chain Breakdown**: Understand where products come from and how they're made
- **Ethical Evaluation**: Get ratings on water usage, energy/carbon footprint, and labor rights
- **Recent News**: See relevant news about the brand's ethical track record
- **Category Comparison**: Compare products against category averages
- **Alternative Suggestions**: Find more ethical alternatives when issues are identified
- **Multiple AI Providers**: Choose between Claude (Anthropic) or Gemini (Google)

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- An API key from either:
  - [Anthropic](https://console.anthropic.com/) for Claude
  - [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd carma
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional):
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Development Mode

For hot-reloading during development:
```bash
npm run dev
```

## Usage

1. **Configure Your Preferences**
   - Select your AI provider (Claude or Gemini)
   - Enter your API key
   - Choose which ethical priorities matter most to you:
     - Water Usage & Conservation
     - Energy & Carbon Footprint
     - Workers Rights & Fair Labor

2. **Upload a Screenshot**
   - Take a screenshot of an Amazon product page
   - Drag and drop or browse to upload the image
   - Click "Analyze Product Ethics"

3. **Review the Analysis**
   - Product identification and details
   - Supply chain breakdown
   - Ethical concern ratings (LOW, MODERATE, HIGH, CRITICAL)
   - Recent news about the company
   - Comparison to category average
   - Overall rating and recommendation

4. **Find Alternatives**
   - Click "Find Better Alternatives" to get suggestions
   - View ethical alternatives with specific improvements noted

## Project Structure

```
carma/
├── frontend/
│   ├── index.html          # Main application page
│   ├── css/
│   │   └── styles.css      # Application styling
│   └── js/
│       ├── app.js          # Main application logic
│       ├── api-client.js   # Backend API communication
│       └── ui-controller.js # UI state management
├── backend/
│   ├── server.js           # Express server
│   ├── routes/
│   │   ├── analysis.js     # Product analysis endpoints
│   │   └── alternatives.js # Alternative search endpoints
│   ├── services/
│   │   ├── llm-service.js  # LLM API integration
│   │   ├── image-processor.js # Screenshot processing
│   │   └── cache-service.js # Results caching
│   └── prompts/
│       └── templates.js    # AI prompt templates
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### Test Connection
```
POST /api/analysis/test
Body: { "provider": "claude|gemini", "apiKey": "your-api-key" }
```
Tests the API connection with the selected provider.

### Analyze Product
```
POST /api/analysis/analyze
Body: {
  "image": "base64-encoded-image",
  "config": {
    "apiProvider": "claude|gemini",
    "apiKey": "your-api-key",
    "ethicalPriorities": ["water_usage", "energy_fossil", "labor_rights"]
  }
}
```
Analyzes a product screenshot and returns ethical evaluation.

### Find Alternatives
```
POST /api/alternatives/find
Body: {
  "analysis": { /* previous analysis result */ },
  "config": { /* same as above */ }
}
```
Finds ethical alternatives based on the analyzed product.

## Ethical Priorities Explained

### Water Usage & Conservation
Evaluates the water footprint of product manufacturing, including:
- Raw material extraction (cotton farming, mining, etc.)
- Manufacturing processes
- Textile dyeing and finishing
- Packaging production

### Energy & Carbon Footprint
Assesses fossil fuel consumption and emissions:
- Manufacturing energy sources
- Transportation distances and methods
- Packaging materials
- Product lifecycle emissions

### Workers Rights & Fair Labor
Examines labor practices in the supply chain:
- Factory working conditions
- Fair wage compliance
- Child labor risks
- Worker safety standards
- Unionization rights

## Deployment

### Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Deploy
git push heroku main
```

### Docker
```bash
# Build image
docker build -t carma .

# Run container
docker run -p 3000:3000 carma
```

### Vercel
The project includes a `vercel.json` configuration for easy deployment to Vercel.

## Security Notes

- API keys are stored in the browser's localStorage
- Keys are transmitted over HTTPS to the backend
- No API keys are stored on the server by default
- Consider implementing server-side key management for production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool provides AI-generated estimates and analysis based on publicly available information. Results should be used as one factor among many when making purchasing decisions. Always verify important claims through additional research.
