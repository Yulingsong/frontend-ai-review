#!/usr/bin/env node
/**
 * Frontend AI Review - Main Entry Point (Optimized)
 * 支持并行处理、缓存、多AI提供商
 */

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { Analyzer } from './analyzer.js';
import { loadConfig, mergeOptions, validateConfig, createDefaultConfig } from './config/index.js';
import { detectFramework } from './utils/index.js';
import type { CLIOptions, SeverityLevel } from './types/index.js';

// Version
const VERSION = '2.3.1';

// CLI argument validators
const VALID_OUTPUT = ['text', 'json', 'github'] as const;
const VALID_SEVERITY = ['error', 'warning', 'suggestion'] as const;
const VALID_AI_PROVIDER = ['openai', 'anthropic', 'gemini', 'azure', 'cohere', 'mistral', 'qwen'] as const;

function validateOutput(value: string): CLIOptions['output'] {
  return VALID_OUTPUT.includes(value as any) ? value as CLIOptions['output'] : 'text';
}

function validateSeverity(value: string): SeverityLevel {
  return VALID_SEVERITY.includes(value as any) ? value as SeverityLevel : 'suggestion';
}

function validateAIProvider(value: string): CLIOptions['aiProvider'] {
  return VALID_AI_PROVIDER.includes(value as any) ? value as CLIOptions['aiProvider'] : 'openai';
}

/**
 * Parse CLI arguments
 */
function parseArgs(): Partial<CLIOptions> {
  const args = process.argv.slice(2);
  const options: Partial<CLIOptions> = {
    projectPath: process.cwd()
  };
  
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    
    switch (a) {
      case '-o':
      case '--output':
        options.output = validateOutput(args[++i]);
        break;
      case '-s':
      case '--severity':
        options.severity = validateSeverity(args[++i]);
        break;
      case '-c':
      case '--category':
        options.category = args[++i].split(',');
        break;
      case '-e':
      case '--exclude':
        options.exclude = args[++i].split(',');
        break;
      case '-r':
      case '--rules':
        options.rules = args[++i].split(',');
        break;
      case '--ai':
        options.ai = true;
        break;
      case '--ai-model':
        options.aiModel = args[++i];
        break;
      case '--ai-provider':
        options.aiProvider = validateAIProvider(args[++i]);
        break;
      case '--fix':
        options.fix = true;
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--cache':
        options.cache = true;
        break;
      case '-i':
      case '--interactive':
        options.interactive = true;
        break;
      // Git options
      case '--git':
        options.git = true;
        break;
      case '--staged':
        options.gitStaged = true;
        break;
      case '--branch':
        options.gitBranch = args[++i];
        break;
      case '--since':
        options.gitSince = args[++i];
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--version':
        options.version = true;
        break;
      case '--init':
        // Create default config
        createDefaultConfig(process.cwd());
        console.log(pc.green('✅ Created default config: .fairrc.json'));
        process.exit(0);
        break;
      default:
        if (!a.startsWith('-')) {
          options.projectPath = a;
        }
    }
  }
  
  return options;
}

/**
 * Display help
 */
function showHelp(): void {
  console.log(`
🤖 Frontend AI Review v${VERSION}
──────────────────────────────────────────────────

${pc.bold('Usage:')} fair [options] [path]

${pc.bold('Options:')}
  -o, --output <format>      输出格式: text, json, github (default: text)
  -s, --severity <level>     最低严重程度: error, warning, suggestion (default: suggestion)
  -c, --category <cats>      类别: react,vue,typescript,security,performance,best-practice
  -e, --exclude <patterns>   排除文件 (逗号分隔)
  -r, --rules <rules>        只启用指定规则 (逗号分隔)
  
  --ai                        启用 AI 分析
  --ai-model <model>         AI 模型 (default: gpt-4o-mini)
  --ai-provider <provider>   AI 提供商: openai, anthropic, gemini, azure, cohere, mistral, qwen
  
  --fix                       自动修复可修复的问题
  --parallel                  启用并行分析 (提升速度)
  --cache                     启用缓存 (增量分析)
  -i, --interactive           交互式模式
  
  --git                       启用 Git 增量分析
  --staged                    只分析已暂存的更改
  --branch <branch>           与指定分支比较
  --since <commit>            分析指定提交之后的更改
  
  --init                      创建默认配置文件
  -h, --help                  显示帮助
  -v, --version               显示版本

${pc.bold('Examples:')}
  fair /path/to/project
  fair -s warning --ai
  fair --parallel --cache
  fair -o json -c security
  fair --git --staged
  fair --git --branch main
  fair --init

${pc.bold('Config:')}
  配置文件会自动读取: .fairrc.json, .fairrc, fair.config.json
  
${pc.bold('Environment Variables:')}
  OPENAI_API_KEY      OpenAI API Key
  ANTHROPIC_API_KEY   Anthropic API Key  
  GEMINI_API_KEY      Google Gemini API Key
  QWEN_API_KEY        阿里云 Qwen API Key
`);
}

/**
 * Main function
 */
async function main() {
  const cliOptions = parseArgs();
  
  // Version
  if (cliOptions.version) {
    console.log(`Frontend AI Review v${VERSION}`);
    console.log(`Rules: ${(await import('./rules/index.js')).getRuleStats().total}`);
    return;
  }
  
  // Help
  if (cliOptions.help) {
    showHelp();
    return;
  }
  
  console.log(pc.cyan(`\n🤖 Frontend AI Review v${VERSION}`));
  console.log(pc.dim('─'.repeat(50)));
  
  // Load config
  const config = loadConfig(cliOptions.projectPath!);
  const options = mergeOptions(cliOptions, config);
  
  // Validate
  const validation = validateConfig(config);
  if (!validation.valid) {
    console.log(pc.red('Config errors:'));
    validation.errors.forEach(e => console.log(pc.red(`  - ${e}`)));
    process.exit(1);
  }
  
  // Package.json
  let pkg: any = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(options.projectPath, 'package.json'), 'utf-8'));
  } catch {}
  
  // Framework detection
  const framework = detectFramework(pkg);
  console.log(pc.gray(`Framework: ${framework}`));
  console.log(pc.gray(`Severity: ${options.severity}`));
  console.log(pc.gray(`Output: ${options.output}`));
  
  // Rules
  const analyzer = new Analyzer(options);
  const ruleStats = analyzer.getRuleStats();
  console.log(pc.gray(`Rules: ${ruleStats.total} enabled`));
  
  // AI
  if (options.ai) {
    console.log(pc.gray(`AI: ${options.aiProvider} (${options.aiModel})`));
    const { LLMAnalyzer } = await import('./llm/index.js');
    const llm = new LLMAnalyzer({ model: options.aiModel, provider: options.aiProvider as any });
    const test = await llm.testConnection();
    if (test.success) {
      console.log(pc.green('✅ AI 连接成功'));
    } else {
      console.log(pc.red(`❌ AI 连接失败: ${test.error}`));
    }
  }
  
  // Options
  if (options.parallel) console.log(pc.gray('Parallel: Enabled'));
  if (options.cache) console.log(pc.gray('Cache: Enabled'));
  console.log();
  
  // Analyze
  const results = await analyzer.analyze();
  
  // Output
  analyzer.output(results);
}

main().catch(console.error);
