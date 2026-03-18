// Core type definitions for Frontend AI Review

export type SeverityLevel = 'error' | 'warning' | 'suggestion';

export interface Location {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

export interface Issue {
  id: string;
  ruleId: string;
  message: string;
  severity: SeverityLevel;
  location: Location;
  fixable?: boolean;
  fix?: string;
}

export interface Rule {
  id: string;
  category: string;
  severity: SeverityLevel;
  name: string;
  description: string;
  fixable?: boolean;
  fix?: string;
  detect: (content: string, filePath: string) => Issue[];
}

export interface CLIOptions {
  projectPath: string;
  output: 'text' | 'json' | 'github';
  severity: SeverityLevel;
  category?: string[];
  exclude: string[];
  rules?: string[];
  ai: boolean;
  aiProvider: 'openai' | 'anthropic' | 'gemini' | 'azure' | 'cohere' | 'mistral' | 'qwen';
  aiModel: string;
  fix: boolean;
  help: boolean;
  version: boolean;
  parallel?: boolean;
  cache?: boolean;
  interactive?: boolean;
  // Git options
  git?: boolean;
  gitStaged?: boolean;
  gitBranch?: string;
  gitSince?: string;
}

export interface Config {
  severity?: SeverityLevel;
  output?: 'text' | 'json' | 'github';
  exclude?: string[];
  category?: string[];
  rules?: string[];
  ai?: boolean;
  aiModel?: string;
  aiProvider?: 'openai' | 'anthropic' | 'gemini' | 'azure' | 'cohere' | 'mistral' | 'qwen';
}

export interface AnalysisResult {
  file: string;
  issues: Issue[];
  analyzed: boolean;
  cached?: boolean;
}

export interface SummaryStats {
  totalFiles: number;
  analyzedFiles: number;
  filesWithIssues: number;
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
  byCategory: Record<string, number>;
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  error?: string;
}
