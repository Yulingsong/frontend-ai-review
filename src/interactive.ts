// Interactive mode for Frontend AI Review

import * as readline from 'readline';
import pc from 'picocolors';
import { getRuleStats } from './rules/index.js';
import type { CLIOptions, SeverityLevel } from './types/index.js';

// Validators
const VALID_SEVERITY = ['error', 'warning', 'suggestion'] as const;
const VALID_OUTPUT = ['text', 'json', 'github'] as const;
const VALID_AI_PROVIDER = ['openai', 'anthropic', 'gemini', 'azure', 'cohere', 'mistral', 'qwen'] as const;

function validateSeverity(v: string): SeverityLevel {
  return VALID_SEVERITY.includes(v as any) ? v as SeverityLevel : 'warning';
}

function validateOutput(v: string): CLIOptions['output'] {
  return VALID_OUTPUT.includes(v as any) ? v as CLIOptions['output'] : 'text';
}

function validateAIProvider(v: string): CLIOptions['aiProvider'] {
  return VALID_AI_PROVIDER.includes(v as any) ? v as CLIOptions['aiProvider'] : 'openai';
}

export interface InteractiveAnswers {
  projectPath: string;
  severity: string;
  category: string[];
  output: string;
  ai: boolean;
  aiProvider: string;
  parallel: boolean;
}

/**
 * Create readline interface
 */
function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and get answer
 */
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface();
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Ask with default value
 */
async function askDefault(question: string, defaultValue: string): Promise<string> {
  const answer = await ask(`${question} [${defaultValue}]: `);
  return answer.trim() || defaultValue;
}

/**
 * Ask yes/no question
 */
async function askYesNo(question: string, defaultYes: boolean = false): Promise<boolean> {
  const defaultStr = defaultYes ? 'Y/n' : 'y/N';
  const answer = await ask(`${question} [${defaultStr}]: `);
  const trimmed = answer.trim().toLowerCase();
  
  if (!trimmed) return defaultYes;
  return trimmed === 'y' || trimmed === 'yes';
}

/**
 * Display header
 */
function displayHeader(): void {
  console.log(pc.cyan('\n🤖 Frontend AI Review - Interactive Mode'));
  console.log(pc.dim('─'.repeat(50)));
}

/**
 * Display categories
 */
function displayCategories(): void {
  const stats = getRuleStats();
  console.log(pc.bold('\n📂 Available Categories:'));
  
  for (const [cat, count] of Object.entries(stats.byCategory)) {
    const icon = getCategoryIcon(cat);
    console.log(`  ${icon} ${cat}: ${count} rules`);
  }
  
  console.log(pc.dim(`\n  Total: ${stats.total} rules`));
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'react': '⚛️',
    'vue': '💚',
    'typescript': '💙',
    'security': '🔒',
    'performance': '⚡',
    'best-practice': '📝'
  };
  return icons[category] || '📄';
}

/**
 * Run interactive mode
 */
export async function runInteractive(): Promise<Partial<CLIOptions>> {
  displayHeader();
  
  // Project path
  const projectPath = await askDefault('\n📁 Project path', process.cwd());
  
  // Severity
  const severity = await askDefault('\n🎯 Minimum severity (error/warning/suggestion)', 'warning');
  
  // Categories
  displayCategories();
  const categoriesAnswer = await ask('\n📂 Categories (comma-separated, empty for all): ');
  const category = categoriesAnswer.trim() ? categoriesAnswer.split(',').map(c => c.trim()) : undefined;
  
  // Output format
  const output = await askDefault('\n📄 Output format (text/json/github)', 'text');
  
  // AI
  const ai = await askYesNo('\n🤖 Enable AI analysis?');
  
  let aiProvider = 'openai';
  let aiModel = 'gpt-4o-mini';
  
  if (ai) {
    aiProvider = await askDefault('\n🔌 AI provider (openai/anthropic/gemini/qwen)', 'openai');
    aiModel = await askDefault('\n🤖 AI model', 'gpt-4o-mini');
  }
  
  // Parallel
  const parallel = await askYesNo('\n⚡ Enable parallel processing?');
  
  // Summary
  console.log(pc.cyan('\n📋 Summary:'));
  console.log(`  Project: ${projectPath}`);
  console.log(`  Severity: ${severity}`);
  console.log(`  Categories: ${category ? category.join(', ') : 'all'}`);
  console.log(`  Output: ${output}`);
  console.log(`  AI: ${ai ? `${aiProvider}/${aiModel}` : 'disabled'}`);
  console.log(`  Parallel: ${parallel ? 'enabled' : 'disabled'}`);
  
  const confirm = await askYesNo('\n✅ Start analysis?');
  
  if (!confirm) {
    console.log(pc.yellow('\n👋 Cancelled.'));
    process.exit(0);
  }
  
  return {
    projectPath,
    severity: validateSeverity(severity),
    category,
    output: validateOutput(output),
    ai,
    aiProvider: validateAIProvider(aiProvider),
    aiModel,
    parallel,
    interactive: true
  };
}

export default runInteractive;
