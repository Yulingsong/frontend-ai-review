// Configuration handler for Frontend AI Review

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import type { Config, CLIOptions } from '../types/index.js';
import { validateConfig as validate } from './schema.js';

const DEFAULT_CONFIG: Config = {
  severity: 'suggestion',
  output: 'text',
  exclude: ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.git/**', 'coverage/**'],
  category: undefined,
  rules: undefined,
  ai: false,
  aiModel: 'gpt-4o-mini',
  aiProvider: 'openai'
};

const CONFIG_FILES = [
  '.fairrc.json',
  '.fairrc',
  'fair.config.json',
  'fair.config.js'
];

const IGNORE_FILES = [
  '.fairignore',
  '.fairignore.txt'
];

/**
 * Load ignore patterns from .fairignore file
 */
export function loadIgnorePatterns(projectPath: string): string[] {
  const patterns: string[] = [];
  
  for (const ignoreFile of IGNORE_FILES) {
    const ignorePath = path.join(projectPath, ignoreFile);
    if (fs.existsSync(ignorePath)) {
      try {
        const content = fs.readFileSync(ignorePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          // Skip comments and empty lines
          if (trimmed && !trimmed.startsWith('#')) {
            patterns.push(trimmed);
          }
        }
      } catch (e) {
        console.warn(pc.yellow(`⚠ Failed to load ${ignoreFile}: ${e}`));
      }
    }
  }
  
  return patterns;
}

/**
 * Load configuration from file
 */
export function loadConfig(projectPath: string): Config {
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(projectPath, configFile);
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        if (configFile.endsWith('.js')) {
          // For JS config files, return defaults (would need dynamic import)
          console.warn(pc.yellow('⚠ JS config files are not yet supported'));
          return DEFAULT_CONFIG;
        }
        
        const parsed = JSON.parse(content);
        
        // Validate config
        const validation = validate(parsed);
        if (!validation.valid) {
          console.warn(pc.yellow(`⚠ Config validation errors in ${configFile}:`));
          validation.errors.forEach(e => console.warn(pc.yellow(`  - ${e}`)));
        }
        
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        console.warn(pc.yellow(`⚠ Failed to load config from ${configFile}: ${e}`));
      }
    }
  }
  return DEFAULT_CONFIG;
}

/**
 * Merge CLI options with config
 */
export function mergeOptions(cliOptions: Partial<CLIOptions>, config: Config): CLIOptions {
  return {
    projectPath: cliOptions.projectPath || process.cwd(),
    output: cliOptions.output || config.output || 'text',
    severity: cliOptions.severity || config.severity || 'suggestion',
    category: cliOptions.category || config.category,
    exclude: [...(config.exclude || []), ...(cliOptions.exclude || [])],
    rules: cliOptions.rules || config.rules,
    ai: cliOptions.ai ?? config.ai ?? false,
    aiProvider: (cliOptions as any).aiProvider || config.aiProvider || 'openai',
    aiModel: cliOptions.aiModel || config.aiModel || 'gpt-4o-mini',
    fix: cliOptions.fix || false,
    help: cliOptions.help || false,
    version: cliOptions.version || false,
    parallel: cliOptions.parallel,
    cache: cliOptions.cache,
    interactive: cliOptions.interactive
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.severity && !['error', 'warning', 'suggestion'].includes(config.severity)) {
    errors.push(`Invalid severity: ${config.severity}`);
  }
  
  if (config.output && !['text', 'json', 'github'].includes(config.output)) {
    errors.push(`Invalid output: ${config.output}`);
  }
  
  if (config.category) {
    const validCategories = ['react', 'vue', 'typescript', 'security', 'performance', 'best-practice'];
    const invalid = config.category.filter(c => !validCategories.includes(c));
    if (invalid.length > 0) {
      errors.push(`Invalid categories: ${invalid.join(', ')}`);
    }
  }
  
  if (config.aiProvider && !['openai', 'anthropic', 'gemini', 'qwen'].includes(config.aiProvider)) {
    errors.push(`Invalid AI provider: ${config.aiProvider}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get default config path
 */
export function getConfigPath(projectPath: string): string | null {
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(projectPath, configFile);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

/**
 * Create default config file
 */
export function createDefaultConfig(projectPath: string, configPath?: string): string {
  const targetPath = configPath || path.join(projectPath, '.fairrc.json');
  fs.writeFileSync(targetPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  return targetPath;
}

export { DEFAULT_CONFIG };
