"use strict";
// Interactive mode for Frontend AI Review
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
exports.runInteractive = runInteractive;
const readline = __importStar(require("readline"));
const picocolors_1 = __importDefault(require("picocolors"));
const index_js_1 = require("./rules/index.js");
// Validators
const VALID_SEVERITY = ['error', 'warning', 'suggestion'];
const VALID_OUTPUT = ['text', 'json', 'github'];
const VALID_AI_PROVIDER = ['openai', 'anthropic', 'gemini', 'azure', 'cohere', 'mistral', 'qwen'];
function validateSeverity(v) {
    return VALID_SEVERITY.includes(v) ? v : 'warning';
}
function validateOutput(v) {
    return VALID_OUTPUT.includes(v) ? v : 'text';
}
function validateAIProvider(v) {
    return VALID_AI_PROVIDER.includes(v) ? v : 'openai';
}
/**
 * Create readline interface
 */
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}
/**
 * Ask a question and get answer
 */
function ask(question) {
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
async function askDefault(question, defaultValue) {
    const answer = await ask(`${question} [${defaultValue}]: `);
    return answer.trim() || defaultValue;
}
/**
 * Ask yes/no question
 */
async function askYesNo(question, defaultYes = false) {
    const defaultStr = defaultYes ? 'Y/n' : 'y/N';
    const answer = await ask(`${question} [${defaultStr}]: `);
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed)
        return defaultYes;
    return trimmed === 'y' || trimmed === 'yes';
}
/**
 * Display header
 */
function displayHeader() {
    console.log(picocolors_1.default.cyan('\n🤖 Frontend AI Review - Interactive Mode'));
    console.log(picocolors_1.default.dim('─'.repeat(50)));
}
/**
 * Display categories
 */
function displayCategories() {
    const stats = (0, index_js_1.getRuleStats)();
    console.log(picocolors_1.default.bold('\n📂 Available Categories:'));
    for (const [cat, count] of Object.entries(stats.byCategory)) {
        const icon = getCategoryIcon(cat);
        console.log(`  ${icon} ${cat}: ${count} rules`);
    }
    console.log(picocolors_1.default.dim(`\n  Total: ${stats.total} rules`));
}
/**
 * Get icon for category
 */
function getCategoryIcon(category) {
    const icons = {
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
async function runInteractive() {
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
    console.log(picocolors_1.default.cyan('\n📋 Summary:'));
    console.log(`  Project: ${projectPath}`);
    console.log(`  Severity: ${severity}`);
    console.log(`  Categories: ${category ? category.join(', ') : 'all'}`);
    console.log(`  Output: ${output}`);
    console.log(`  AI: ${ai ? `${aiProvider}/${aiModel}` : 'disabled'}`);
    console.log(`  Parallel: ${parallel ? 'enabled' : 'disabled'}`);
    const confirm = await askYesNo('\n✅ Start analysis?');
    if (!confirm) {
        console.log(picocolors_1.default.yellow('\n👋 Cancelled.'));
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
exports.default = runInteractive;
//# sourceMappingURL=interactive.js.map