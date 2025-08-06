const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeAI();
  }

  initializeAI() {
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-001';
    try {
      this.genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: this.model,
      });
      // Add a small delay between requests to avoid rate limiting
      this.lastRequestTime = 0;
      this.minRequestInterval = 500; // 500ms between requests
      logger.info(`Google Gemini AI initialized with model: ${this.model}`);
    } catch (error) {
      logger.error('Failed to initialize Google Gemini AI:', error);
      this.genAI = null;
    }
  }

  isAvailable() {
    return this.genAI !== null;
  }

  async generateExample(word, definition, context = null) {
    if (!this.genAI) {
      throw new Error('AI service is not available');
    }

    const maxRetries = 3;
    const retryDelay = 1000; // Start with 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Rate limiting to prevent too many rapid requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
          await new Promise(resolve => 
            setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
          );
        }
        
        const prompt = this._buildExamplePrompt(word, definition, context);

        const response = await this.genAI.models.generateContent({
          model: this.model,
          contents: prompt,
        });
        const example = response.text;

        logger.info(`Generated example for word: ${word}`);
        this.lastRequestTime = Date.now();
        return example;
      } catch (error) {
        const isOverloaded = error.message?.includes('overloaded') || 
                           error.status === 'UNAVAILABLE' ||
                           error.code === 503;
        
        if (isOverloaded && attempt < maxRetries) {
          const waitTime = retryDelay * attempt;
          logger.warn(`AI model overloaded, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        logger.error(`Failed to generate example (attempt ${attempt}/${maxRetries}):`, error);
        
        // Provide user-friendly error message
        if (isOverloaded) {
          throw new Error('AI service is currently busy. Please try again in a few moments.');
        }
        throw new Error('Failed to generate example sentence');
      }
    }
  }

  _buildExamplePrompt(word, definition, context) {
    let prompt = `Generate a clear, natural example sentence using the word "${word}" (definition: ${definition}).`;

    if (context) {
      prompt += ` The sentence should be in the context of ${context}.`;
    }

    prompt += ` Requirements:
    - The sentence should clearly demonstrate the meaning of the word
    - Use simple, everyday language
    - Make it memorable and practical
    - The sentence should be between 10-20 words
    - Only return the example sentence, nothing else`;

    return prompt;
  }
}

module.exports = new AIService();
