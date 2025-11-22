/**
 * Prompt templates for ¢arma LLM interactions
 */

const priorityDescriptions = {
    water_usage: 'Water usage and conservation in production',
    energy_fossil: 'Fossil fuel consumption and renewable energy use',
    labor_rights: 'Worker conditions, fair wages, and labor practices'
};

const priorityIcons = {
    water_usage: 'Water',
    energy_fossil: 'Energy',
    labor_rights: 'Labor'
};

/**
 * Build the main product analysis prompt
 */
function buildAnalysisPrompt(priorities) {
    const selectedPriorities = priorities
        .map(p => `- ${priorityDescriptions[p] || p}`)
        .join('\n');

    return `You are an expert ethical shopping assistant analyzing an Amazon product screenshot.

ANALYSIS INSTRUCTIONS:

1. PRODUCT IDENTIFICATION
Identify from the screenshot:
- Product name and brand
- Category/type
- Price (if visible)
- Key materials/components mentioned

2. SUPPLY CHAIN ANALYSIS
Think through the complete supply chain:
- Raw materials: What are the likely sources and extraction methods?
- Manufacturing: Where is it likely made? What are typical factory conditions?
- Transportation: What shipping methods and distances are involved?
- End-of-life: Is it recyclable? Biodegradable? Requires special disposal?

3. ETHICAL EVALUATION
Evaluate these specific concerns based on the user's priorities:
${selectedPriorities}

For each concern:
- Identify specific supply chain issues
- Rate concern level: LOW, MODERATE, HIGH, or CRITICAL
- Provide evidence-based reasoning

Rating Guidelines:
- LOW: Minimal negative impact, good practices observed
- MODERATE: Some concerns but industry standard
- HIGH: Significant concerns that warrant caution
- CRITICAL: Severe issues that strongly discourage purchase

4. RECENT NEWS RESEARCH
Based on your knowledge, identify any relevant news from the last 12 months about:
- The company's ethical track record
- Supply chain scandals or improvements
- Labor disputes or certifications
- Environmental incidents or initiatives

5. COMPARATIVE ANALYSIS
Compare to typical products in this category:
- Rate as WORSE, SIMILAR, or BETTER than average
- Explain specific differentiators

6. FINAL SUMMARY
Provide:
- Top 3 pros (positive aspects, if any)
- Top 3 cons (negative aspects, if any)
- Overall rating (1-5 stars, be honest)
- One-sentence recommendation

Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "product": {
    "name": "string",
    "brand": "string",
    "category": "string",
    "price": "string"
  },
  "supplyChain": {
    "materials": ["string array of main materials"],
    "manufacturing": {
      "location": "string - likely manufacturing location",
      "conditions": "string - brief description of likely conditions"
    },
    "transportation": {
      "method": "string - shipping methods",
      "distance": "string - approximate distance/carbon footprint"
    },
    "disposal": {
      "recyclable": true/false,
      "biodegradable": true/false,
      "specialHandling": "string or null"
    }
  },
  "ethicalConcerns": {
    "water_usage": {
      "rating": "LOW|MODERATE|HIGH|CRITICAL",
      "details": "string explanation"
    },
    "energy_fossil": {
      "rating": "LOW|MODERATE|HIGH|CRITICAL",
      "details": "string explanation"
    },
    "labor_rights": {
      "rating": "LOW|MODERATE|HIGH|CRITICAL",
      "details": "string explanation"
    }
  },
  "recentNews": [
    {
      "date": "string - approximate date or timeframe",
      "headline": "string - news headline",
      "summary": "string - brief summary",
      "impact": "positive|negative|neutral"
    }
  ],
  "comparison": {
    "rating": "WORSE|SIMILAR|BETTER",
    "explanation": "string - why this rating"
  },
  "summary": {
    "pros": ["string array - max 3 items"],
    "cons": ["string array - max 3 items"],
    "overallRating": number between 1 and 5,
    "recommendation": "string - one sentence recommendation"
  }
}`;
}

/**
 * Build the alternatives search prompt
 */
function buildAlternativesPrompt(analysis, priorities) {
    const productInfo = analysis.product || {};
    const concerns = analysis.ethicalConcerns || {};

    // Identify the main concerns
    const highConcerns = [];
    for (const [key, value] of Object.entries(concerns)) {
        if (value && (value.rating === 'HIGH' || value.rating === 'CRITICAL')) {
            highConcerns.push(priorityDescriptions[key] || key);
        }
    }

    return `You are an ethical shopping assistant helping find better alternatives.

ORIGINAL PRODUCT:
- Name: ${productInfo.name || 'Unknown'}
- Brand: ${productInfo.brand || 'Unknown'}
- Category: ${productInfo.category || 'Unknown'}
- Price: ${productInfo.price || 'Unknown'}

MAIN ETHICAL CONCERNS IDENTIFIED:
${highConcerns.length > 0 ? highConcerns.map(c => `- ${c}`).join('\n') : '- General sustainability concerns'}

USER PRIORITIES:
${priorities.map(p => `- ${priorityDescriptions[p] || p}`).join('\n')}

TASK:
Suggest 3-5 ethical alternatives to this product that address the identified concerns. Focus on:
1. Products from companies with better ethical track records
2. Products made with more sustainable materials or processes
3. Products with better labor practices in their supply chain
4. Similar functionality and reasonable price range

For each alternative, explain specifically why it's a better choice ethically.

Return ONLY a valid JSON array (no markdown, no explanation outside JSON):
[
  {
    "name": "string - product name",
    "brand": "string - brand name",
    "price": "string - approximate price or price range",
    "improvements": ["string array - 2-3 specific improvements over original"],
    "certifications": ["string array - relevant certifications like B-Corp, Fair Trade, etc."],
    "link": null
  }
]

Important:
- Be specific about WHY each alternative is better
- Include real brands known for ethical practices
- Consider similar price points when possible
- Focus on the user's stated priorities`;
}

/**
 * Build a prompt for follow-up questions
 */
function buildFollowUpPrompt(analysis, question) {
    return `Based on this product analysis:

Product: ${analysis.product?.name || 'Unknown'}
Brand: ${analysis.product?.brand || 'Unknown'}

Previous Analysis Summary:
${JSON.stringify(analysis.summary, null, 2)}

User Question: ${question}

Please provide a helpful, informative answer focused on ethical shopping considerations.`;
}

module.exports = {
    buildAnalysisPrompt,
    buildAlternativesPrompt,
    buildFollowUpPrompt,
    priorityDescriptions,
    priorityIcons
};
