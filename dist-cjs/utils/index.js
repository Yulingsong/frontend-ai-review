"use strict";
// Utility functions for Frontend AI Review
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.ProgressBar = void 0;
exports.generateId = generateId;
exports.detectFramework = detectFramework;
exports.getSeverityColor = getSeverityColor;
exports.getSeverityIcon = getSeverityIcon;
exports.getSeverityLevel = getSeverityLevel;
exports.filterBySeverity = filterBySeverity;
exports.calculateFileHash = calculateFileHash;
exports.getRelativePath = getRelativePath;
exports.formatFileSize = formatFileSize;
exports.truncate = truncate;
exports.extractCodeSnippet = extractCodeSnippet;
const crypto = __importStar(require("crypto"));
const picocolors_1 = __importDefault(require("picocolors"));
/**
 * Generate a unique ID for issues
 */
function generateId() {
    return crypto.randomBytes(4).toString('hex');
}
/**
 * Detect the frontend framework from package.json
 */
function detectFramework(packageJson) {
    if (!packageJson?.dependencies) {
        return 'unknown';
    }
    const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    if (deps.next || deps['next-auth']) {
        return 'next';
    }
    if (deps.nuxt || deps.nuxt3) {
        return 'nuxt';
    }
    if (deps.vue && !deps.nuxt) {
        return 'vue';
    }
    if (deps.react && !deps.next) {
        return 'react';
    }
    if (deps.svelte && !deps.nuxt) {
        return 'svelte';
    }
    return 'unknown';
}
/**
 * Get color for severity level
 */
function getSeverityColor(severity) {
    switch (severity) {
        case 'error': return 'red';
        case 'warning': return 'yellow';
        case 'suggestion': return 'blue';
        default: return 'gray';
    }
}
/**
 * Get icon for severity level
 */
function getSeverityIcon(severity) {
    switch (severity) {
        case 'error': return '🔴';
        case 'warning': return '🟡';
        case 'suggestion': return '🔵';
        default: return '⚪';
    }
}
/**
 * Get numeric level for severity comparison
 */
function getSeverityLevel(severity) {
    switch (severity) {
        case 'error': return 3;
        case 'warning': return 2;
        case 'suggestion': return 1;
        default: return 0;
    }
}
/**
 * Filter issues by minimum severity level
 */
function filterBySeverity(issues, minSeverity) {
    const minLevel = getSeverityLevel(minSeverity);
    return issues.filter(issue => getSeverityLevel(issue.severity) >= minLevel);
}
/**
 * Calculate file hash for caching
 */
function calculateFileHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}
/**
 * Get relative path from project root
 */
function getRelativePath(filePath, projectPath) {
    return filePath.replace(projectPath, '').replace(/^[/\\]/, '');
}
/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
/**
 * Truncate string with ellipsis
 */
function truncate(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 3) + '...';
}
/**
 * Extract code snippet around a line
 */
function extractCodeSnippet(content, line, context = 2) {
    const lines = content.split('\n');
    const start = Math.max(0, line - context - 1);
    const end = Math.min(lines.length, line + context);
    return lines.slice(start, end)
        .map((l, i) => {
        const lineNum = start + i + 1;
        const marker = lineNum === line ? '→ ' : '  ';
        return `${marker}${lineNum.toString().padStart(3, ' ')} │ ${l}`;
    })
        .join('\n');
}
/**
 * Progress bar renderer
 */
class ProgressBar {
    constructor(total, label = 'Progress') {
        this.current = 0;
        this.total = total;
        this.label = label;
        this.startTime = Date.now();
    }
    update(current) {
        this.current = current;
        const percent = Math.round((current / this.total) * 100);
        const elapsed = Date.now() - this.startTime;
        const rate = this.current / (elapsed / 1000);
        const remaining = this.current === 0 ? 0 : Math.round((this.total - this.current) / rate);
        const barWidth = 20;
        const filled = Math.round((current / this.total) * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        process.stdout.write(`\r${picocolors_1.default.cyan(this.label)}: [${bar}] ${percent}% (${current}/${this.total}) ETA: ${remaining}s`);
    }
    complete() {
        this.current = this.total;
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        process.stdout.write(`\r${picocolors_1.default.green('✓')} ${this.label}: Completed in ${elapsed}s\n`);
    }
}
exports.ProgressBar = ProgressBar;
/**
 * Simple logger with levels
 */
exports.logger = {
    info: (msg) => console.log(picocolors_1.default.gray('ℹ ') + msg),
    success: (msg) => console.log(picocolors_1.default.green('✓ ') + msg),
    warn: (msg) => console.log(picocolors_1.default.yellow('⚠ ') + msg),
    error: (msg) => console.log(picocolors_1.default.red('✗ ') + msg),
    debug: (msg) => {
        if (process.env.DEBUG) {
            console.log(picocolors_1.default.dim('🔍 ') + msg);
        }
    }
};
__exportStar(require("./git.js"), exports);
//# sourceMappingURL=index.js.map