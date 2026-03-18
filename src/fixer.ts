// Auto Fixer for Frontend AI Review

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import type { Issue } from './types/index.js';

export interface FixResult {
  file: string;
  fixed: number;
  failed: number;
  errors: string[];
}

export class AutoFixer {
  private dryRun: boolean;

  constructor(dryRun: boolean = false) {
    this.dryRun = dryRun;
  }

  /**
   * Apply fixes to a file
   */
  applyFixes(filePath: string, issues: Issue[]): FixResult {
    const result: FixResult = {
      file: filePath,
      fixed: 0,
      failed: 0,
      errors: []
    };

    if (!issues.length) return result;

    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      result.errors.push(`Failed to read file: ${e}`);
      return result;
    }

    const originalContent = content;

    // Sort issues by line number (descending) to fix from bottom to top
    // This prevents line number shifts from affecting other fixes
    const sortedIssues = [...issues]
      .filter(i => i.fixable)
      .sort((a, b) => b.location.start.line - a.location.start.line);

    for (const issue of sortedIssues) {
      try {
        content = this.applyFix(content, issue);
        result.fixed++;
      } catch (e) {
        result.failed++;
        result.errors.push(`Failed to fix ${issue.ruleId} at line ${issue.location.start.line}: ${e}`);
      }
    }

    // Write changes if not dry run
    if (!this.dryRun && content !== originalContent) {
      try {
        fs.writeFileSync(filePath, content);
        console.log(pc.green(`✅ Fixed ${result.fixed} issues in ${path.basename(filePath)}`));
      } catch (e) {
        result.errors.push(`Failed to write file: ${e}`);
      }
    }

    return result;
  }

  /**
   * Apply a single fix
   */
  private applyFix(content: string, issue: Issue): string {
    const lines = content.split('\n');
    const lineIndex = issue.location.start.line - 1;

    switch (issue.ruleId) {
      case 'perf/console-log':
        // Remove the console.log line
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lines.splice(lineIndex, 1);
        }
        break;

      case 'best-practice/no-var':
        // Replace var with let
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lines[lineIndex] = lines[lineIndex].replace(/\bvar\b/g, 'let');
        }
        break;

      case 'best-practice/prefer-const':
        // Replace let with const
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lines[lineIndex] = lines[lineIndex].replace(/\blet\b/g, 'const');
        }
        break;

      case 'typescript/no-unused-vars':
        // Remove the unused variable line
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lines.splice(lineIndex, 1);
        }
        break;

      default:
        // Unknown fixable rule - skip
        break;
    }

    return lines.join('\n');
  }

  /**
   * Fix multiple files
   */
  fixMultiple(files: Array<{ file: string; issues: Issue[] }>): FixResult[] {
    return files.map(({ file, issues }) => this.applyFixes(file, issues));
  }

  /**
   * Preview fixes without applying
   */
  previewFixes(_filePath: string, issues: Issue[]): string[] {
    const fixes: string[] = [];
    const fixable = issues.filter(i => i.fixable);

    if (fixable.length === 0) {
      return ['No fixable issues'];
    }

    for (const issue of fixable) {
      const action = this.getFixDescription(issue);
      fixes.push(`Line ${issue.location.start.line}: ${issue.ruleId} - ${action}`);
    }

    return fixes;
  }

  private getFixDescription(issue: Issue): string {
    switch (issue.ruleId) {
      case 'perf/console-log':
        return 'Delete console.log line';
      case 'best-practice/no-var':
        return 'Replace var with let';
      case 'best-practice/prefer-const':
        return 'Replace let with const';
      case 'typescript/no-unused-vars':
        return 'Remove unused variable';
      default:
        return issue.fix || 'Apply fix';
    }
  }
}

export default AutoFixer;
