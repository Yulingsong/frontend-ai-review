// Utility functions for Frontend AI Review

import * as crypto from 'crypto';
import pc from 'picocolors';
import type { SeverityLevel } from '../types/index.js';

/**
 * Generate a unique ID for issues
 */
export function generateId(): string {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Detect the frontend framework from package.json
 */
export function detectFramework(packageJson: Record<string, unknown> | null): string {
  if (!packageJson?.dependencies) return 'unknown';
  const deps = { 
    ...(packageJson.dependencies as Record<string, string>), 
    ...(packageJson.devDependencies as Record<string, string>) 
  };
  
  if (deps.next || deps['next-auth']) return 'next';
  if (deps.nuxt || deps.nuxt3) return 'nuxt';
  if (deps.vue && !deps.nuxt) return 'vue';
  if (deps.react && !deps.next) return 'react';
  if (deps.svelte && !deps.nuxt) return 'svelte';
  return 'unknown';
}

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: SeverityLevel): string {
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
export function getSeverityIcon(severity: SeverityLevel): string {
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
export function getSeverityLevel(severity: SeverityLevel): number {
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
export function filterBySeverity(issues: Array<{ severity: SeverityLevel }>, minSeverity: SeverityLevel): Array<{ severity: SeverityLevel }> {
  const minLevel = getSeverityLevel(minSeverity);
  return issues.filter(issue => getSeverityLevel(issue.severity) >= minLevel);
}

/**
 * Calculate file hash for caching
 */
export function calculateFileHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Get relative path from project root
 */
export function getRelativePath(filePath: string, projectPath: string): string {
  return filePath.replace(projectPath, '').replace(/^[/\\]/, '');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Extract code snippet around a line
 */
export function extractCodeSnippet(content: string, line: number, context: number = 2): string {
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
export class ProgressBar {
  private current: number = 0;
  private total: number;
  private startTime: number;
  private label: string;

  constructor(total: number, label: string = 'Progress') {
    this.total = total;
    this.label = label;
    this.startTime = Date.now();
  }

  update(current: number): void {
    this.current = current;
    const percent = Math.round((current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const rate = this.current / (elapsed / 1000);
    const remaining = this.current === 0 ? 0 : Math.round((this.total - this.current) / rate);
    
    const barWidth = 20;
    const filled = Math.round((current / this.total) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    
    process.stdout.write(`\r${pc.cyan(this.label)}: [${bar}] ${percent}% (${current}/${this.total}) ETA: ${remaining}s`);
  }

  complete(): void {
    this.current = this.total;
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    process.stdout.write(`\r${pc.green('✓')} ${this.label}: Completed in ${elapsed}s\n`);
  }
}

/**
 * Simple logger with levels
 */
export const logger = {
  info: (msg: string) => console.log(pc.gray('ℹ ') + msg),
  success: (msg: string) => console.log(pc.green('✓ ') + msg),
  warn: (msg: string) => console.log(pc.yellow('⚠ ') + msg),
  error: (msg: string) => console.log(pc.red('✗ ') + msg),
  debug: (msg: string) => {
    if (process.env.DEBUG) console.log(pc.dim('🔍 ') + msg);
  }
};

export * from './git.js';
