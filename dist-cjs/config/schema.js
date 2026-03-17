"use strict";
// JSON Schema for .fairrc.json
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAIRRC_SCHEMA = void 0;
exports.validateConfig = validateConfig;
exports.FAIRRC_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Frontend AI Review Configuration",
    "type": "object",
    "properties": {
        "severity": {
            "type": "string",
            "enum": ["error", "warning", "suggestion"],
            "default": "suggestion",
            "description": "Minimum severity level to report"
        },
        "output": {
            "type": "string",
            "enum": ["text", "json", "github"],
            "default": "text",
            "description": "Output format"
        },
        "exclude": {
            "type": "array",
            "items": { "type": "string" },
            "default": ["node_modules/**", "dist/**", "build/**"],
            "description": "Glob patterns to exclude"
        },
        "category": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["react", "vue", "typescript", "security", "performance", "best-practice"]
            },
            "description": "Categories to enable"
        },
        "rules": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Specific rules to enable (overrides category)"
        },
        "ai": {
            "type": "boolean",
            "default": false,
            "description": "Enable AI-powered analysis"
        },
        "aiModel": {
            "type": "string",
            "default": "gpt-4o-mini",
            "description": "AI model to use"
        },
        "aiProvider": {
            "type": "string",
            "enum": ["openai", "anthropic", "gemini", "qwen"],
            "default": "openai",
            "description": "AI provider"
        },
        "parallel": {
            "type": "boolean",
            "default": false,
            "description": "Enable parallel processing"
        },
        "cache": {
            "type": "boolean",
            "default": false,
            "description": "Enable caching for incremental analysis"
        }
    }
};
/**
 * Validate configuration against schema
 */
function validateConfig(config) {
    const errors = [];
    // Check severity
    if (config.severity !== undefined) {
        if (!['error', 'warning', 'suggestion'].includes(config.severity)) {
            errors.push(`Invalid severity: ${config.severity}. Must be one of: error, warning, suggestion`);
        }
    }
    // Check output
    if (config.output !== undefined) {
        if (!['text', 'json', 'github'].includes(config.output)) {
            errors.push(`Invalid output: ${config.output}. Must be one of: text, json, github`);
        }
    }
    // Check exclude is array
    if (config.exclude !== undefined) {
        if (!Array.isArray(config.exclude)) {
            errors.push('exclude must be an array');
        }
    }
    // Check category
    if (config.category !== undefined) {
        if (!Array.isArray(config.category)) {
            errors.push('category must be an array');
        }
        else {
            const validCategories = ['react', 'vue', 'typescript', 'security', 'performance', 'best-practice'];
            for (const cat of config.category) {
                if (!validCategories.includes(cat)) {
                    errors.push(`Invalid category: ${cat}. Must be one of: ${validCategories.join(', ')}`);
                }
            }
        }
    }
    // Check rules is array
    if (config.rules !== undefined) {
        if (!Array.isArray(config.rules)) {
            errors.push('rules must be an array');
        }
    }
    // Check aiProvider
    if (config.aiProvider !== undefined) {
        if (!['openai', 'anthropic', 'gemini', 'qwen'].includes(config.aiProvider)) {
            errors.push(`Invalid aiProvider: ${config.aiProvider}. Must be one of: openai, anthropic, gemini, qwen`);
        }
    }
    // Check booleans
    const booleanFields = ['ai', 'parallel', 'cache'];
    for (const field of booleanFields) {
        if (config[field] !== undefined && typeof config[field] !== 'boolean') {
            errors.push(`${field} must be a boolean`);
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
exports.default = exports.FAIRRC_SCHEMA;
//# sourceMappingURL=schema.js.map