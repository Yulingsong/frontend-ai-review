// Main Analyzer for Frontend AI Review

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import pc from 'picocolors';
import { allRules, filterRules, getRuleStats } from './rules/index.js';
import { LLMAnalyzer } from './llm/index.js';
import { calculateFileHash, ProgressBar, getRelativePath, logger, getChangedFiles, isGitRepo, filterByExtensions, extractCodeSnippet, getSeverityLevel } from './utils/index.js';
import type { 
  Issue, 
  Rule, 
  AnalysisResult, 
  SummaryStats, 
  CLIOptions
} from './types/index.js';

// File cache for incremental analysis (LRU limited)
interface FileCache {
  hash: string;
  issues: Issue[];
  timestamp: number;
}

const MAX_CACHE_SIZE = 500; // Max files to cache

export class Analyzer {
  private options: CLIOptions;
  private rules: Rule[] = [];
  private llm: LLMAnalyzer | null = null;
  private fileCache: Map<string, FileCache> = new Map();
  private cacheAccessOrder: string[] = []; // Track access order for LRU
  
  // File patterns to analyze
  private readonly patterns = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue', '**/*.svelte'];
  private readonly defaultExclude = ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.git/**', 'coverage/**'];

  /**
   * LRU cache set with size limit
   */
  private setCache(filePath: string, cache: FileCache): void {
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

  constructor(options: CLIOptions) {
    this.options = options;
    this.initRules();
    this.initLLM();
  }

  private initRules(): void {
    this.rules = filterRules(allRules, {
      category: this.options.category,
      rules: this.options.rules,
      severity: this.options.severity
    });
    logger.debug(`Loaded ${this.rules.length} rules`);
  }

  private initLLM(): void {
    if (this.options.ai) {
      this.llm = new LLMAnalyzer({
        model: this.options.aiModel,
        provider: this.options.aiProvider as any
      });
    }
  }

  /**
   * Get files to analyze
   */
  async getFiles(): Promise<string[]> {
    // Git-based incremental analysis
    if (this.options.git || this.options.gitStaged || this.options.gitBranch || this.options.gitSince) {
      return this.getGitFiles();
    }
    
    // Standard file discovery
    const exclude = [...this.defaultExclude, ...this.options.exclude];
    const files: string[] = [];
    
    for (const pattern of this.patterns) {
      const matched = await glob(pattern, {
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
  private async getGitFiles(): Promise<string[]> {
    if (!isGitRepo(this.options.projectPath)) {
      logger.warn('Not a git repository, falling back to standard file discovery');
      return this.getStandardFiles();
    }

    const changedFiles = getChangedFiles(this.options.projectPath, {
      staged: this.options.gitStaged,
      branch: this.options.gitBranch,
      since: this.options.gitSince
    });

    if (changedFiles.length === 0) {
      logger.info('No changed files found');
      return [];
    }

    // Filter to only source files
    const sourceExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
    const filtered = filterByExtensions(changedFiles, sourceExtensions);

    // Get absolute paths
    const files = filtered
      .filter(f => f.status !== 'deleted')
      .map(f => {
        if (path.isAbsolute(f.path)) {
          return f.path;
        }
        return path.join(this.options.projectPath, f.path);
      });

    logger.info(`Found ${files.length} changed files to analyze`);
    return files;
  }

  /**
   * Get standard files (fallback)
   */
  private async getStandardFiles(): Promise<string[]> {
    const exclude = [...this.defaultExclude, ...this.options.exclude];
    const files: string[] = [];
    
    for (const pattern of this.patterns) {
      const matched = await glob(pattern, {
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
  async analyze(): Promise<AnalysisResult[]> {
    const files = await this.getFiles();
    
    logger.info(`Found ${files.length} files to analyze`);
    
    if (files.length === 0) {
      return [];
    }

    const results: AnalysisResult[] = [];
    const progress = new ProgressBar(files.length, 'Analyzing');
    
    if (this.options.parallel) {
      // Parallel processing
      results.push(...await this.analyzeParallel(files, progress));
    } else {
      // Sequential processing
      results.push(...await this.analyzeSequential(files, progress));
    }
    
    progress.complete();
    
    return results;
  }

  /**
   * Sequential file analysis
   */
  private async analyzeSequential(files: string[], progress: ProgressBar): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const minSev = getSeverityLevel(this.options.severity);

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
  private async analyzeParallel(files: string[], progress: ProgressBar): Promise<AnalysisResult[]> {
    const concurrency = Math.min(10, files.length);
    const results: AnalysisResult[] = [];
    const minSev = getSeverityLevel(this.options.severity);
    let completed = 0;

    const worker = async (file: string): Promise<AnalysisResult | null> => {
      const result = await this.analyzeFile(file, minSev);
      completed++;
      progress.update(completed);
      return result;
    };

    // Process in chunks
    for (let i = 0; i < files.length; i += concurrency) {
      const chunk = files.slice(i, i + concurrency);
      const chunkResults = await Promise.all(chunk.map(worker));
      results.push(...chunkResults.filter((r): r is AnalysisResult => r !== null));
    }

    return results;
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string, minSeverity: number): Promise<AnalysisResult | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check cache
      if (this.options.cache) {
        const hash = calculateFileHash(content);
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
      const issues: Issue[] = [];
      for (const rule of this.rules) {
        const found = rule.detect(content, filePath)
          .filter(i => getSeverityLevel(i.severity) >= minSeverity);
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
        } catch (e) {
          logger.debug(`AI analysis failed for ${filePath}: ${e}`);
        }
      }

      // Cache result
      if (this.options.cache) {
        this.setCache(filePath, {
          hash: calculateFileHash(content),
          issues,
          timestamp: Date.now()
        });
      }

      return {
        file: filePath,
        issues,
        analyzed: true
      };
    } catch (e) {
      logger.debug(`Failed to analyze ${filePath}: ${e}`);
      return null;
    }
  }

  /**
   * Get summary statistics
   */
  getSummary(results: AnalysisResult[]): SummaryStats {
    const stats: SummaryStats = {
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
        if (issue.severity === 'error') stats.errorCount++;
        if (issue.severity === 'warning') stats.warningCount++;
        if (issue.severity === 'suggestion') stats.suggestionCount++;
        
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
  output(results: AnalysisResult[]): void {
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
          file: getRelativePath(r.file, this.options.projectPath),
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
            path: getRelativePath(file, this.options.projectPath),
            line: issue.location.start.line,
            severity: issue.severity,
            message: `[${issue.ruleId}] ${issue.message}`
          });
        }
      }
      console.log(JSON.stringify(annotations, null, 2));
    }
  }

  private outputText(results: AnalysisResult[], stats: SummaryStats): void {
    const colors = pc.createColors(true);
    const { red, yellow, blue } = colors;

    // Results with issues
    for (const { file, issues } of results) {
      if (issues.length === 0) continue;

      console.log(pc.bold(`\n📁 ${getRelativePath(file, this.options.projectPath)}`));
      console.log(pc.dim('─'.repeat(50)));

      for (const issue of issues) {
        const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
        const color = issue.severity === 'error' ? red : issue.severity === 'warning' ? yellow : blue;
        
        console.log(`${icon} ${color(issue.ruleId)} ${pc.dim('line ' + issue.location.start.line)}`);
        console.log(`   ${issue.message}`);
        
        // Show code snippet
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const snippet = extractCodeSnippet(content, issue.location.start.line, 2);
          console.log(pc.dim(`\n${snippet}\n`));
        } catch {
          // Ignore if can't read file
        }
        
        if (issue.fixable) {
          console.log(pc.green(`   💡 可修复: ${issue.fix}`));
        }
      }
    }

    // Summary
    console.log(pc.bold('\n📊 Summary'));
    console.log(pc.dim('─'.repeat(50)));
    console.log(`Files: ${stats.totalFiles} | Analyzed: ${stats.analyzedFiles} | Issues: ${stats.filesWithIssues}`);
    console.log(pc.red(`   Errors: ${stats.errorCount}`));
    console.log(pc.yellow(`   Warnings: ${stats.warningCount}`));
    console.log(pc.blue(`   Suggestions: ${stats.suggestionCount}`));

    if (Object.keys(stats.byCategory).length > 0) {
      console.log(pc.dim('\n📈 By Category'));
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
    return getRuleStats();
  }
}

export default Analyzer;
