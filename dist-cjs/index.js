#!/usr/bin/env node
"use strict";
/**
 * Frontend AI Review - Main Entry Point (Optimized)
 * 支持并行处理、缓存、多AI提供商
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const picocolors_1 = __importDefault(require("picocolors"));
const analyzer_js_1 = require("./analyzer.js");
const index_js_1 = require("./config/index.js");
const index_js_2 = require("./utils/index.js");
// Version
const VERSION = '2.3.1';
// CLI argument validators
const VALID_OUTPUT = ['text', 'json', 'github'];
const VALID_SEVERITY = ['error', 'warning', 'suggestion'];
const VALID_AI_PROVIDER = ['openai', 'anthropic', 'gemini', 'azure', 'cohere', 'mistral', 'qwen'];
function validateOutput(value) {
    return VALID_OUTPUT.includes(value) ? value : 'text';
}
function validateSeverity(value) {
    return VALID_SEVERITY.includes(value) ? value : 'suggestion';
}
function validateAIProvider(value) {
    return VALID_AI_PROVIDER.includes(value) ? value : 'openai';
}
/**
 * Parse CLI arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
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
                (0, index_js_1.createDefaultConfig)(process.cwd());
                console.log(picocolors_1.default.green('✅ Created default config: .fairrc.json'));
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
function showHelp() {
    console.log(`
🤖 Frontend AI Review v${VERSION}
──────────────────────────────────────────────────

${picocolors_1.default.bold('Usage:')} fair [options] [path]

${picocolors_1.default.bold('Options:')}
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

${picocolors_1.default.bold('Examples:')}
  fair /path/to/project
  fair -s warning --ai
  fair --parallel --cache
  fair -o json -c security
  fair --git --staged
  fair --git --branch main
  fair --init

${picocolors_1.default.bold('Config:')}
  配置文件会自动读取: .fairrc.json, .fairrc, fair.config.json
  
${picocolors_1.default.bold('Environment Variables:')}
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
        console.log(`Rules: ${(await Promise.resolve().then(() => __importStar(require('./rules/index.js')))).getRuleStats().total}`);
        return;
    }
    // Help
    if (cliOptions.help) {
        showHelp();
        return;
    }
    console.log(picocolors_1.default.cyan(`\n🤖 Frontend AI Review v${VERSION}`));
    console.log(picocolors_1.default.dim('─'.repeat(50)));
    // Load config
    const config = (0, index_js_1.loadConfig)(cliOptions.projectPath);
    const options = (0, index_js_1.mergeOptions)(cliOptions, config);
    // Validate
    const validation = (0, index_js_1.validateConfig)(config);
    if (!validation.valid) {
        console.log(picocolors_1.default.red('Config errors:'));
        validation.errors.forEach(e => console.log(picocolors_1.default.red(`  - ${e}`)));
        process.exit(1);
    }
    // Package.json
    let pkg = {};
    try {
        pkg = JSON.parse(fs.readFileSync(path.join(options.projectPath, 'package.json'), 'utf-8'));
    }
    catch { }
    // Framework detection
    const framework = (0, index_js_2.detectFramework)(pkg);
    console.log(picocolors_1.default.gray(`Framework: ${framework}`));
    console.log(picocolors_1.default.gray(`Severity: ${options.severity}`));
    console.log(picocolors_1.default.gray(`Output: ${options.output}`));
    // Rules
    const analyzer = new analyzer_js_1.Analyzer(options);
    const ruleStats = analyzer.getRuleStats();
    console.log(picocolors_1.default.gray(`Rules: ${ruleStats.total} enabled`));
    // AI
    if (options.ai) {
        console.log(picocolors_1.default.gray(`AI: ${options.aiProvider} (${options.aiModel})`));
        const { LLMAnalyzer } = await Promise.resolve().then(() => __importStar(require('./llm/index.js')));
        const llm = new LLMAnalyzer({ model: options.aiModel, provider: options.aiProvider });
        const test = await llm.testConnection();
        if (test.success) {
            console.log(picocolors_1.default.green('✅ AI 连接成功'));
        }
        else {
            console.log(picocolors_1.default.red(`❌ AI 连接失败: ${test.error}`));
        }
    }
    // Options
    if (options.parallel)
        console.log(picocolors_1.default.gray('Parallel: Enabled'));
    if (options.cache)
        console.log(picocolors_1.default.gray('Cache: Enabled'));
    console.log();
    // Analyze
    const results = await analyzer.analyze();
    // Output
    analyzer.output(results);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map