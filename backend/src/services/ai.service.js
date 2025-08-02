const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');
require('dotenv').config();

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

    try {
      const prompt = this._buildExamplePrompt(word, definition, context);

      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: prompt,
      });
      const example = response.text;

      logger.info(`Generated example for word: ${word}`);
      return example;
    } catch (error) {
      logger.error('Failed to generate example:', error);
      throw new Error('Failed to generate example sentence');
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
