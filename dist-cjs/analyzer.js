"use strict";
// Main Analyzer for Frontend AI Review
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
exports.Analyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const picocolors_1 = __importDefault(require("picocolors"));
const index_js_1 = require("./rules/index.js");
const index_js_2 = require("./llm/index.js");
const index_js_3 = require("./utils/index.js");
const MAX_CACHE_SIZE = 500; // Max files to cache
class Analyzer {
    /**
     * LRU cache set with size limit
     */
    setCache(filePath, cache) {
        // Remove oldest entries if cache is full
        while (this.fileCache.size >= MAX_CACHE_SIZE) {
            const oldest = this.cacheAccessOrder.shift();
            if (oldest) {
                this.fileCache.delete(oldest);
            }
        }
        this.fileCache.set(filePath, cache);
        this.cacheAccessOrder.push(filePath);
    }
    constructor(options) {
        this.rules = [];
        this.llm = null;
        this.fileCache = new Map();
        this.cacheAccessOrder = []; // Track access order for LRU
        // File patterns to analyze
        this.patterns = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue', '**/*.svelte'];
        this.defaultExclude = ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.git/**', 'coverage/**'];
        this.options = options;
        this.initRules();
        this.initLLM();
    }
    initRules() {
        this.rules = (0, index_js_1.filterRules)(index_js_1.allRules, {
            category: this.options.category,
            rules: this.options.rules,
            severity: this.options.severity
        });
        index_js_3.logger.debug(`Loaded ${this.rules.length} rules`);
    }
    initLLM() {
        if (this.options.ai) {
            this.llm = new index_js_2.LLMAnalyzer({
                model: this.options.aiModel,
                provider: this.options.aiProvider
            });
        }
    }
    /**
     * Get files to analyze
     */
    async getFiles() {
        // Git-based incremental analysis
        if (this.options.git || this.options.gitStaged || this.options.gitBranch || this.options.gitSince) {
            return this.getGitFiles();
        }
        // Standard file discovery
        const exclude = [...this.defaultExclude, ...this.options.exclude];
        const files = [];
        for (const pattern of this.patterns) {
            const matched = await (0, glob_1.glob)(pattern, {
                cwd: this.options.projectPath,
                ignore: exclude,
                absolute: true
            });
            files.push(...matched);
        }
        return [...new Set(files)];
    }
    /**
     * Get files changed in git
     */
    async getGitFiles() {
        if (!(0, index_js_3.isGitRepo)(this.options.projectPath)) {
            index_js_3.logger.warn('Not a git repository, falling back to standard file discovery');
            return this.getStandardFiles();
        }
        const changedFiles = (0, index_js_3.getChangedFiles)(this.options.projectPath, {
            staged: this.options.gitStaged,
            branch: this.options.gitBranch,
            since: this.options.gitSince
        });
        if (changedFiles.length === 0) {
            index_js_3.logger.info('No changed files found');
            return [];
        }
        // Filter to only source files
        const sourceExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
        const filtered = (0, index_js_3.filterByExtensions)(changedFiles, sourceExtensions);
        // Get absolute paths
        const files = filtered
            .filter(f => f.status !== 'deleted')
            .map(f => {
            if (path.isAbsolute(f.path)) {
                return f.path;
            }
            return path.join(this.options.projectPath, f.path);
        });
        index_js_3.logger.info(`Found ${files.length} changed files to analyze`);
        return files;
    }
    /**
     * Get standard files (fallback)
     */
    async getStandardFiles() {
        const exclude = [...this.defaultExclude, ...this.options.exclude];
        const files = [];
        for (const pattern of this.patterns) {
            const matched = await (0, glob_1.glob)(pattern, {
                cwd: this.options.projectPath,
                ignore: exclude,
                absolute: true
            });
            files.push(...matched);
        }
        return [...new Set(files)];
    }
    /**
     * Analyze all files
     */
    async analyze() {
        const files = await this.getFiles();
        index_js_3.logger.info(`Found ${files.length} files to analyze`);
        if (files.length === 0) {
            return [];
        }
        const results = [];
        const progress = new index_js_3.ProgressBar(files.length, 'Analyzing');
        if (this.options.parallel) {
            // Parallel processing
            results.push(...await this.analyzeParallel(files, progress));
        }
        else {
            // Sequential processing
            results.push(...await this.analyzeSequential(files, progress));
        }
        progress.complete();
        return results;
    }
    /**
     * Sequential file analysis
     */
    async analyzeSequential(files, progress) {
        const results = [];
        const minSev = (0, index_js_3.getSeverityLevel)(this.options.severity);
        for (let i = 0; i < files.length; i++) {
            progress.update(i + 1);
            const result = await this.analyzeFile(files[i], minSev);
            if (result) {
                results.push(result);
            }
        }
        return results;
    }
    /**
     * Parallel file analysis
     */
    async analyzeParallel(files, progress) {
        const concurrency = Math.min(10, files.length);
        const results = [];
        const minSev = (0, index_js_3.getSeverityLevel)(this.options.severity);
        let completed = 0;
        const worker = async (file) => {
            const result = await this.analyzeFile(file, minSev);
            completed++;
            progress.update(completed);
            return result;
        };
        // Process in chunks
        for (let i = 0; i < files.length; i += concurrency) {
            const chunk = files.slice(i, i + concurrency);
            const chunkResults = await Promise.all(chunk.map(worker));
            results.push(...chunkResults.filter((r) => r !== null));
        }
        return results;
    }
    /**
     * Analyze a single file
     */
    async analyzeFile(filePath, minSeverity) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Check cache
            if (this.options.cache) {
                const hash = (0, index_js_3.calculateFileHash)(content);
                const cached = this.fileCache.get(filePath);
                if (cached && cached.hash === hash) {
                    // Update LRU order
                    this.cacheAccessOrder = this.cacheAccessOrder.filter(f => f !== filePath);
                    this.cacheAccessOrder.push(filePath);
                    return {
                        file: filePath,
                        issues: cached.issues,
                        analyzed: true,
                        cached: true
                    };
                }
            }
            // Run static analysis
            const issues = [];
            for (const rule of this.rules) {
                const found = rule.detect(content, filePath)
                    .filter(i => (0, index_js_3.getSeverityLevel)(i.severity) >= minSeverity);
                issues.push(...found);
            }
            // Run AI analysis if enabled
            if (this.llm && issues.length > 0) {
                try {
                    const aiAnalysis = await this.llm.analyze(content);
                    if (aiAnalysis && !aiAnalysis.includes('请设置') && !aiAnalysis.includes('失败')) {
                        issues.push({
                            id: 'ai-analysis',
                            ruleId: 'ai/code-review',
                            message: aiAnalysis,
                            severity: 'suggestion',
                            location: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } }
                        });
                    }
                }
                catch (e) {
                    index_js_3.logger.debug(`AI analysis failed for ${filePath}: ${e}`);
                }
            }
            // Cache result
            if (this.options.cache) {
                this.setCache(filePath, {
                    hash: (0, index_js_3.calculateFileHash)(content),
                    issues,
                    timestamp: Date.now()
                });
            }
            return {
                file: filePath,
                issues,
                analyzed: true
            };
        }
        catch (e) {
            index_js_3.logger.debug(`Failed to analyze ${filePath}: ${e}`);
            return null;
        }
    }
    /**
     * Get summary statistics
     */
    getSummary(results) {
        const stats = {
            totalFiles: results.length,
            analyzedFiles: results.filter(r => r.analyzed).length,
            filesWithIssues: results.filter(r => r.issues.length > 0).length,
            errorCount: 0,
            warningCount: 0,
            suggestionCount: 0,
            byCategory: {}
        };
        for (const result of results) {
            for (const issue of result.issues) {
                if (issue.severity === 'error')
                    stats.errorCount++;
                if (issue.severity === 'warning')
                    stats.warningCount++;
                if (issue.severity === 'suggestion')
                    stats.suggestionCount++;
                // Count by category (extract from ruleId)
                const category = issue.ruleId.split('/')[0];
                stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
            }
        }
        return stats;
    }
    /**
     * Output results
     */
    output(results) {
        const stats = this.getSummary(results);
        // Text output
        if (this.options.output === 'text') {
            this.outputText(results, stats);
            return;
        }
        // JSON output
        if (this.options.output === 'json') {
            console.log(JSON.stringify({
                stats,
                results: results.map(r => ({
                    file: (0, index_js_3.getRelativePath)(r.file, this.options.projectPath),
                    issues: r.issues,
                    cached: r.cached
                }))
            }, null, 2));
            return;
        }
        // GitHub output
        if (this.options.output === 'github') {
            const annotations = [];
            for (const { file, issues } of results) {
                for (const issue of issues) {
                    annotations.push({
                        path: (0, index_js_3.getRelativePath)(file, this.options.projectPath),
                        line: issue.location.start.line,
                        severity: issue.severity,
                        message: `[${issue.ruleId}] ${issue.message}`
                    });
                }
            }
            console.log(JSON.stringify(annotations, null, 2));
        }
    }
    outputText(results, stats) {
        const colors = picocolors_1.default.createColors(true);
        const { red, yellow, blue } = colors;
        // Results with issues
        for (const { file, issues } of results) {
            if (issues.length === 0)
                continue;
            console.log(picocolors_1.default.bold(`\n📁 ${(0, index_js_3.getRelativePath)(file, this.options.projectPath)}`));
            console.log(picocolors_1.default.dim('─'.repeat(50)));
            for (const issue of issues) {
                const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
                const color = issue.severity === 'error' ? red : issue.severity === 'warning' ? yellow : blue;
                console.log(`${icon} ${color(issue.ruleId)} ${picocolors_1.default.dim('line ' + issue.location.start.line)}`);
                console.log(`   ${issue.message}`);
                // Show code snippet
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    const snippet = (0, index_js_3.extractCodeSnippet)(content, issue.location.start.line, 2);
                    console.log(picocolors_1.default.dim(`\n${snippet}\n`));
                }
                catch {
                    // Ignore if can't read file
                }
                if (issue.fixable) {
                    console.log(picocolors_1.default.green(`   💡 可修复: ${issue.fix}`));
                }
            }
        }
        // Summary
        console.log(picocolors_1.default.bold('\n📊 Summary'));
        console.log(picocolors_1.default.dim('─'.repeat(50)));
        console.log(`Files: ${stats.totalFiles} | Analyzed: ${stats.analyzedFiles} | Issues: ${stats.filesWithIssues}`);
        console.log(picocolors_1.default.red(`   Errors: ${stats.errorCount}`));
        console.log(picocolors_1.default.yellow(`   Warnings: ${stats.warningCount}`));
        console.log(picocolors_1.default.blue(`   Suggestions: ${stats.suggestionCount}`));
        if (Object.keys(stats.byCategory).length > 0) {
            console.log(picocolors_1.default.dim('\n📈 By Category'));
            for (const [category, count] of Object.entries(stats.byCategory)) {
                console.log(`   ${category}: ${count}`);
            }
        }
        console.log();
    }
    /**
     * Get rule statistics
     */
    getRuleStats() {
        return (0, index_js_1.getRuleStats)();
    }
}
exports.Analyzer = Analyzer;
exports.default = Analyzer;
//# sourceMappingURL=analyzer.js.map