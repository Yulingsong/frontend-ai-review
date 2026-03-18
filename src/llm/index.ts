// LLM Analyzer for Frontend AI Review

import type { LLMResponse } from '../types/index.js';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'qwen' | 'azure' | 'cohere' | 'mistral';

export interface LLMConfig {
  model: string;
  provider: AIProvider;
  maxTokens?: number;
  temperature?: number;
  // Azure specific
  azureEndpoint?: string;
  azureApiVersion?: string;
}

// Type definitions for API responses
interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

interface AnthropicResponse {
  content?: Array<{ text?: string }>;
  error?: { message?: string };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

interface QwenResponse {
  output?: { text?: string };
  code?: number;
  message?: string;
}

interface AzureResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

interface CohereResponse {
  text?: string;
  error?: { message?: string };
}

interface MistralResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export class LLMAnalyzer {
  private apiKey: string;
  private model: string;
  private provider: AIProvider;
  private maxTokens: number;
  private temperature: number;
  // Azure config
  private azureEndpoint?: string;
  private azureApiVersion?: string;

  constructor(config: LLMConfig) {
    this.model = config.model || 'gpt-4o-mini';
    this.provider = config.provider || 'openai';
    this.maxTokens = config.maxTokens || 500;
    this.temperature = config.temperature || 0.7;
    this.azureEndpoint = config.azureEndpoint;
    this.azureApiVersion = config.azureApiVersion || '2024-02-15-preview';

    // Get API key based on provider
    this.apiKey = this.getApiKey(this.provider);
  }

  private getApiKey(provider: AIProvider): string {
    switch (provider) {
      case 'gemini':
        return process.env.GEMINI_API_KEY || '';
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY || '';
      case 'qwen':
        return process.env.QWEN_API_KEY || '';
      case 'azure':
        return process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
      case 'cohere':
        return process.env.COHERE_API_KEY || '';
      case 'mistral':
        return process.env.MISTRAL_API_KEY || '';
      default:
        return process.env.OPENAI_API_KEY || '';
    }
  }

  /**
   * Test connection to LLM API
   */
  async testConnection(): Promise<LLMResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: `请设置 ${this.provider.toUpperCase()}_API_KEY 环境变量`
      };
    }

    try {
      const result = await this.analyze('Hello');
      if (result.includes('请设置') || result.includes('失败') || result.includes('错误')) {
        return { success: false, error: result };
      }
      return { success: true, content: result };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  /**
   * Analyze code with LLM
   */
  async analyze(code: string): Promise<string> {
    if (!this.apiKey) {
      return `⚠️ 请设置 ${this.provider.toUpperCase()}_API_KEY 环境变量`;
    }

    const prompt = this.buildPrompt(code);

    try {
      switch (this.provider) {
        case 'gemini':
          return await this.callGemini(prompt);
        case 'anthropic':
          return await this.callAnthropic(prompt);
        case 'qwen':
          return await this.callQwen(prompt);
        case 'azure':
          return await this.callAzure(prompt);
        case 'cohere':
          return await this.callCohere(prompt);
        case 'mistral':
          return await this.callMistral(prompt);
        default:
          return await this.callOpenAI(prompt);
      }
    } catch (e) {
      return `AI 分析失败: ${e}`;
    }
  }

  /**
   * Analyze multiple files in batch
   */
  async analyzeBatch(files: Array<{ path: string; content: string }>): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Process in parallel with concurrency limit
    const concurrency = 3;
    const chunks = [];

    for (let i = 0; i < files.length; i += concurrency) {
      chunks.push(files.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (file) => {
        const analysis = await this.analyze(file.content);
        results.set(file.path, analysis);
      });
      await Promise.all(promises);
    }

    return results;
  }

  private buildPrompt(code: string): string {
    return `你是前端代码审查专家。请分析以下代码，用中文简洁回复。

重点关注：
1. 代码质量问题
2. 潜在 bug
3. 安全风险
4. 性能优化建议
5. 最佳实践

代码：
${code.slice(0, 3000)}`;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      })
    });

    const data = await res.json() as OpenAIResponse;

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices?.[0]?.message?.content || '';
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model || 'claude-3-haiku-20240307',
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json() as AnthropicResponse;

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.content?.[0]?.text || '';
  }

  private async callGemini(prompt: string): Promise<string> {
    const modelName = this.model || 'gemini-2.0-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: this.maxTokens,
            temperature: this.temperature
          }
        })
      }
    );

    const data = await res.json() as GeminiResponse;

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callQwen(prompt: string): Promise<string> {
    const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model || 'qwen-turbo',
        input: { messages: [{ role: 'user', content: prompt }] },
        parameters: {
          max_tokens: this.maxTokens,
          temperature: this.temperature
        }
      })
    });

    const data = await res.json() as QwenResponse;

    if (data.code) {
      throw new Error(data.message || 'Qwen API Error');
    }

    return data.output?.text || '';
  }

  private async callAzure(prompt: string): Promise<string> {
    if (!this.azureEndpoint) {
      throw new Error('Azure endpoint not configured');
    }

    const url = `${this.azureEndpoint}/openai/deployments/${this.model}/chat/completions?api-version=${this.azureApiVersion}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    const data = await res.json() as AzureResponse;

    if (data.error) {
      throw new Error(data.error.message || 'Azure OpenAI Error');
    }

    return data.choices?.[0]?.message?.content || '';
  }

  private async callCohere(prompt: string): Promise<string> {
    const res = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model || 'command-r-plus',
        message: prompt,
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    const data = await res.json() as CohereResponse;

    if (data.error) {
      throw new Error(data.error.message || 'Cohere API Error');
    }

    return data.text || '';
  }

  private async callMistral(prompt: string): Promise<string> {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model || 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    const data = await res.json() as MistralResponse;

    if (data.error) {
      throw new Error(data.error.message || 'Mistral API Error');
    }

    return data.choices?.[0]?.message?.content || '';
  }
}

export default LLMAnalyzer;
