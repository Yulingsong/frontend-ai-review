"use strict";
// Git utilities for incremental analysis
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGitRepo = isGitRepo;
exports.getChangedFiles = getChangedFiles;
exports.getRecentChangedFiles = getRecentChangedFiles;
exports.getBaseBranch = getBaseBranch;
exports.getCommitHash = getCommitHash;
exports.isTracked = isTracked;
exports.getFileDiff = getFileDiff;
exports.filterByExtensions = filterByExtensions;
exports.filterByPatterns = filterByPatterns;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Check if directory is a git repository
 */
function isGitRepo(dir) {
    try {
        return fs.existsSync(path.join(dir, '.git'));
    }
    catch {
        return false;
    }
}
/**
 * Get changed files since last commit
 */
function getChangedFiles(dir, options = {}) {
    if (!isGitRepo(dir)) {
        return [];
    }
    try {
        let cmd = 'git status --porcelain';
        if (options.staged) {
            cmd = 'git diff --cached --name-status';
        }
        else if (options.branch) {
            cmd = `git diff --name-status ${options.branch}...HEAD`;
        }
        else if (options.since) {
            cmd = `git diff --name-status ${options.since}`;
        }
        else {
            // Default: get unstaged and staged changes
            cmd = 'git status --porcelain';
        }
        const output = (0, child_process_1.execSync)(cmd, {
            cwd: dir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        });
        if (!output.trim()) {
            return [];
        }
        const files = [];
        const lines = output.trim().split('\n');
        for (const line of lines) {
            const match = line.match(/^([MADRC])\s+(.+)$/);
            if (match) {
                const [, status, filePath] = match;
                const statusMap = {
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
    }
    catch {
        return [];
    }
}
/**
 * Get files changed in last N commits
 */
function getRecentChangedFiles(dir, count = 10) {
    if (!isGitRepo(dir)) {
        return [];
    }
    try {
        const output = (0, child_process_1.execSync)(`git log --oneline -n ${count} --name-status`, {
            cwd: dir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        });
        const files = [];
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
    }
    catch {
        return [];
    }
}
/**
 * Get the base branch for comparison
 */
function getBaseBranch(dir) {
    try {
        // Check for remote branches
        const remotes = (0, child_process_1.execSync)('git branch -r', {
            cwd: dir,
            encoding: 'utf-8'
        });
        if (remotes.includes('origin/main')) {
            return 'origin/main';
        }
        else if (remotes.includes('origin/master')) {
            return 'origin/master';
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Get commit hash of specific branch/tag
 */
function getCommitHash(dir, ref) {
    try {
        return (0, child_process_1.execSync)(`git rev-parse ${ref}`, {
            cwd: dir,
            encoding: 'utf-8'
        }).trim();
    }
    catch {
        return null;
    }
}
/**
 * Check if file is tracked by git
 */
function isTracked(dir, filePath) {
    try {
        const output = (0, child_process_1.execSync)(`git ls-files --error-unmatch "${filePath}"`, {
            cwd: dir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        });
        return !!output.trim();
    }
    catch {
        return false;
    }
}
/**
 * Get diff for specific file
 */
function getFileDiff(dir, filePath, options = {}) {
    try {
        let cmd = 'git diff';
        if (options.staged || options.cached) {
            cmd += ' --cached';
        }
        cmd += ` -- "${filePath}"`;
        return (0, child_process_1.execSync)(cmd, {
            cwd: dir,
            encoding: 'utf-8'
        });
    }
    catch {
        return '';
    }
}
/**
 * Filter files by extension
 */
function filterByExtensions(files, extensions) {
    return files.filter(f => {
        const ext = path.extname(f.path).toLowerCase();
        return extensions.includes(ext);
    });
}
/**
 * Get files matching patterns
 */
function filterByPatterns(files, patterns) {
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
//# sourceMappingURL=git.js.map