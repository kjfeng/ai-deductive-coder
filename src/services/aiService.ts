import axios from 'axios';
import { AIConfig, Tag } from '../types';

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async analyzeTag(document: string, tag: Tag): Promise<string[]> {
    const prompt = this.buildPrompt(document, tag);
    
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'anthropic':
          return await this.callAnthropic(prompt);
        case 'custom':
          return await this.callCustomEndpoint(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`Error analyzing tag "${tag.name}":`, error);
      throw error;
    }
  }

  private buildPrompt(document: string, tag: Tag): string {
    return `You are analyzing a document for qualitative coding. Please identify and extract relevant quotes from the document that closely relate to the following tag:

Tag: "${tag.name}"
Description: "${tag.description}"

Document:
${document}

Instructions:
1. Carefully read through the document
2. Identify any passages, sentences, or phrases that are closely relevant to the tag "${tag.name}"
3. Extract these relevant quotes exactly as they appear in the document.
4. Return only the relevant quotes, one per line
5. If no relevant content is found, return "NO_MATCHES"

Important: Only return direct quotes from the document. Do not paraphrase or summarize. Do not, under any circumstances, make up quotes that are not present in the document.`;
  }

  private async callOpenAI(prompt: string): Promise<string[]> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.config.model || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
        throw new Error('No content returned from the API. Please double-check for typos in your configuration!');
    }

    const content = response.data.choices[0]?.message?.content || '';
    return this.parseQuotes(content);
  }

  private async callAnthropic(prompt: string): Promise<string[]> {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.config.model || 'claude-sonnet-4-20250514',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
        throw new Error('No content returned from the API. Please double-check for typos in your configuration!');
    }

    const content = response.data.content[0]?.text || '';
    return this.parseQuotes(content);
  }

  private async callCustomEndpoint(prompt: string): Promise<string[]> {
    if (!this.config.endpoint) {
      throw new Error('Custom endpoint URL is required');
    }

    const response = await axios.post(
      this.config.endpoint,
      {
        prompt,
        model: this.config.model
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
        throw new Error('No content returned from the API. Please double-check for typos in your configuration!');
    }

    const content = response.data.response || response.data.content || '';
    return this.parseQuotes(content);
  }

  private parseQuotes(content: string): string[] {
    if (content.trim() === 'NO_MATCHES' || content.trim() === '') {
      return [];
    }

    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('NO_MATCHES'));
  }
}
