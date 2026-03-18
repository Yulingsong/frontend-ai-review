// Git utilities for incremental analysis

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
}

/**
 * Check if directory is a git repository
 */
export function isGitRepo(dir: string): boolean {
  try {
    return fs.existsSync(path.join(dir, '.git'));
  } catch {
    return false;
  }
}

/**
 * Get changed files since last commit
 */
export function getChangedFiles(dir: string, options: {
  staged?: boolean;
  branch?: string;
  since?: string;
} = {}): GitFile[] {
  if (!isGitRepo(dir)) {
    return [];
  }

  try {
    let cmd = 'git status --porcelain';

    if (options.staged) {
      cmd = 'git diff --cached --name-status';
    } else if (options.branch) {
      cmd = `git diff --name-status ${options.branch}...HEAD`;
    } else if (options.since) {
      cmd = `git diff --name-status ${options.since}`;
    } else {
      // Default: get unstaged and staged changes
      cmd = 'git status --porcelain';
    }

    const output = execSync(cmd, {
      cwd: dir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    if (!output.trim()) {
      return [];
    }

    const files: GitFile[] = [];
    const lines = output.trim().split('\n');

    for (const line of lines) {
      const match = line.match(/^([MADRC])\s+(.+)$/);
      if (match) {
        const [, status, filePath] = match;
        const statusMap: Record<string, GitFile['status']> = {
          'M': 'modified',
          'A': 'added',
          'D': 'deleted',
          'R': 'renamed',
          'C': 'renamed'
        };

        files.push({
          path: filePath.trim(),
          status: statusMap[status] || 'modified'
        });
      }
    }

    return files;
  } catch {
    return [];
  }
}

/**
 * Get files changed in last N commits
 */
export function getRecentChangedFiles(dir: string, count: number = 10): GitFile[] {
  if (!isGitRepo(dir)) {
    return [];
  }

  try {
    const output = execSync(`git log --oneline -n ${count} --name-status`, {
      cwd: dir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const files: GitFile[] = [];
    const lines = output.trim().split('\n');

    for (const line of lines) {
      const match = line.match(/^[MADRC]\s+(.+)$/);
      if (match) {
        files.push({
          path: match[1].trim(),
          status: 'modified'
        });
      }
    }

    // Deduplicate
    const unique = new Map();
    for (const file of files) {
      if (!unique.has(file.path)) {
        unique.set(file.path, file);
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

/**
 * Get the base branch for comparison
 */
export function getBaseBranch(dir: string): string | null {
  try {
    // Check for remote branches
    const remotes = execSync('git branch -r', {
      cwd: dir,
      encoding: 'utf-8'
    });

    if (remotes.includes('origin/main')) {
      return 'origin/main';
    } else if (remotes.includes('origin/master')) {
      return 'origin/master';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get commit hash of specific branch/tag
 */
export function getCommitHash(dir: string, ref: string): string | null {
  try {
    return execSync(`git rev-parse ${ref}`, {
      cwd: dir,
      encoding: 'utf-8'
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Check if file is tracked by git
 */
export function isTracked(dir: string, filePath: string): boolean {
  try {
    const output = execSync(`git ls-files --error-unmatch "${filePath}"`, {
      cwd: dir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return !!output.trim();
  } catch {
    return false;
  }
}

/**
 * Get diff for specific file
 */
export function getFileDiff(dir: string, filePath: string, options: {
  staged?: boolean;
  cached?: boolean;
} = {}): string {
  try {
    let cmd = 'git diff';
    if (options.staged || options.cached) {
      cmd += ' --cached';
    }
    cmd += ` -- "${filePath}"`;

    return execSync(cmd, {
      cwd: dir,
      encoding: 'utf-8'
    });
  } catch {
    return '';
  }
}

/**
 * Filter files by extension
 */
export function filterByExtensions(files: GitFile[], extensions: string[]): GitFile[] {
  return files.filter(f => {
    const ext = path.extname(f.path).toLowerCase();
    return extensions.includes(ext);
  });
}

/**
 * Get files matching patterns
 */
export function filterByPatterns(files: GitFile[], patterns: string[]): GitFile[] {
  return files.filter(f => {
    return patterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(f.path);
      }
      return f.path.includes(pattern);
    });
  });
}
