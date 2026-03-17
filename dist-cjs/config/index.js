"use strict";
// Configuration handler for Frontend AI Review
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
exports.DEFAULT_CONFIG = void 0;
exports.loadIgnorePatterns = loadIgnorePatterns;
exports.loadConfig = loadConfig;
exports.mergeOptions = mergeOptions;
exports.validateConfig = validateConfig;
exports.getConfigPath = getConfigPath;
exports.createDefaultConfig = createDefaultConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const picocolors_1 = __importDefault(require("picocolors"));
const schema_js_1 = require("./schema.js");
const DEFAULT_CONFIG = {
    severity: 'suggestion',
    output: 'text',
    exclude: ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.git/**', 'coverage/**'],
    category: undefined,
    rules: undefined,
    ai: false,
    aiModel: 'gpt-4o-mini',
    aiProvider: 'openai'
};
exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
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
function loadIgnorePatterns(projectPath) {
    const patterns = [];
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
            }
            catch (e) {
                console.warn(picocolors_1.default.yellow(`⚠ Failed to load ${ignoreFile}: ${e}`));
            }
        }
    }
    return patterns;
}
/**
 * Load configuration from file
 */
function loadConfig(projectPath) {
    for (const configFile of CONFIG_FILES) {
        const configPath = path.join(projectPath, configFile);
        if (fs.existsSync(configPath)) {
            try {
                const content = fs.readFileSync(configPath, 'utf-8');
                if (configFile.endsWith('.js')) {
                    // For JS config files, return defaults (would need dynamic import)
                    console.warn(picocolors_1.default.yellow('⚠ JS config files are not yet supported'));
                    return DEFAULT_CONFIG;
                }
                const parsed = JSON.parse(content);
                // Validate config
                const validation = (0, schema_js_1.validateConfig)(parsed);
                if (!validation.valid) {
                    console.warn(picocolors_1.default.yellow(`⚠ Config validation errors in ${configFile}:`));
                    validation.errors.forEach(e => console.warn(picocolors_1.default.yellow(`  - ${e}`)));
                }
                return { ...DEFAULT_CONFIG, ...parsed };
            }
            catch (e) {
                console.warn(picocolors_1.default.yellow(`⚠ Failed to load config from ${configFile}: ${e}`));
            }
        }
    }
    return DEFAULT_CONFIG;
}
/**
 * Merge CLI options with config
 */
function mergeOptions(cliOptions, config) {
    return {
        projectPath: cliOptions.projectPath || process.cwd(),
        output: cliOptions.output || config.output || 'text',
        severity: cliOptions.severity || config.severity || 'suggestion',
        category: cliOptions.category || config.category,
        exclude: [...(config.exclude || []), ...(cliOptions.exclude || [])],
        rules: cliOptions.rules || config.rules,
        ai: cliOptions.ai ?? config.ai ?? false,
        aiProvider: cliOptions.aiProvider || config.aiProvider || 'openai',
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
function validateConfig(config) {
    const errors = [];
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
function getConfigPath(projectPath) {
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
function createDefaultConfig(projectPath, configPath) {
    const targetPath = configPath || path.join(projectPath, '.fairrc.json');
    fs.writeFileSync(targetPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return targetPath;
}
//# sourceMappingURL=index.js.map