#!/usr/bin/env node
/**
 * Auto Optimizer for Frontend AI Review
 * 定时检查代码并自动优化
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = '/Users/half/Desktop/frontend-ai-review';

interface Optimization {
  file: string;
  issue: string;
  fix: string;
  priority: 'high' | 'medium' | 'low';
  fixed: boolean;
}

const optimizations: Optimization[] = [];

/**
 * Log message
 */
function log(msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ',
    success: '✓',
    warn: '⚠',
    error: '✗'
  };
  console.log(`[${timestamp}] ${prefix[type]} ${msg}`);
}

/**
 * Check for TypeScript errors
 */
function checkTypeScript(): Optimization[] {
  const issues: Optimization[] = [];
  
  try {
    execSync('npm run build', { 
      cwd: PROJECT_ROOT, 
      stdio: 'pipe' 
    });
    log('TypeScript check passed', 'success');
  } catch (error: any) {
    const output = error.stdout?.toString() || error.message;
    log(`TypeScript errors: ${output.substring(0, 200)}`, 'warn');
    
    // Parse errors
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('error TS')) {
        const match = line.match(/src\/([^:]+):(\d+):(\d+):\s+error\s+TS(\d+):\s+(.+)/);
        if (match) {
          issues.push({
            file: match[1],
            issue: `TS${match[4]}: ${match[5]}`,
            fix: 'Need manual fix',
            priority: 'high',
            fixed: false
          });
        }
      }
    }
  }
  
  return issues;
}

/**
 * Check for unused imports
 */
function checkUnusedImports(): Optimization[] {
  const issues: Optimization[] = [];
  
  // CLI工具源码不需要检查console.log(它们需要console输出)
  const cliFiles = ['analyzer.ts', 'fixer.ts', 'index.ts', 'interactive.ts', 'plugin.ts', 'utils/index.ts', 'rules/performance.ts'];
  
  // Check src directory
  const srcDir = path.join(PROJECT_ROOT, 'src');
  const files = getAllFiles(srcDir, ['.ts']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(srcDir, file);
    
    // Check for console.log that should be removed in production (skip CLI tools)
    const isCliFile = cliFiles.some(f => relativePath.endsWith(f));
    if (!isCliFile && content.includes('console.log') && !content.includes('// DEBUG')) {
      issues.push({
        file: relativePath,
        issue: 'console.log found in production code',
        fix: 'Remove console.log or use logger.debug()',
        priority: 'low',
        fixed: false
      });
    }
    
    // Check for any type usage
    if (content.includes(': any') || content.includes('any[]')) {
      issues.push({
        file: relativePath,
        issue: 'Using "any" type',
        fix: 'Use specific type instead',
        priority: 'medium',
        fixed: false
      });
    }
  }
  
  return issues;
}

/**
 * Check for missing JSDoc comments
 */
function checkJSDoc(): Optimization[] {
  const issues: Optimization[] = [];
  
  // Check main files for missing documentation
  const importantFiles = [
    'src/analyzer.ts',
    'src/llm/index.ts',
    'src/rules/index.ts'
  ];
  
  for (const file of importantFiles) {
    const fullPath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Check if file has proper JSDoc
      if (!content.startsWith('/**') && !content.startsWith('//')) {
        issues.push({
          file,
          issue: 'Missing file-level JSDoc',
          fix: 'Add JSDoc comment at the top',
          priority: 'low',
          fixed: false
        });
      }
    }
  }
  
  return issues;
}

/**
 * Check package.json for issues
 */
function checkPackageJson(): Optimization[] {
  const issues: Optimization[] = [];
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    // Check for missing fields
    if (!pkg.repository) {
      issues.push({
        file: 'package.json',
        issue: 'Missing repository field',
        fix: 'Add repository URL',
        priority: 'medium',
        fixed: false
      });
    }
    
    if (!pkg.keywords || pkg.keywords.length < 3) {
      issues.push({
        file: 'package.json',
        issue: 'Insufficient keywords',
        fix: 'Add more keywords for discoverability',
        priority: 'low',
        fixed: false
      });
    }
    
    // Check scripts
    if (!pkg.scripts?.prepublishOnly) {
      issues.push({
        file: 'package.json',
        issue: 'Missing prepublishOnly script',
        fix: 'Add prepublishOnly for clean builds',
        priority: 'medium',
        fixed: false
      });
    }
    
  } catch (e) {
    log('Failed to parse package.json', 'error');
  }
  
  return issues;
}

/**
 * Check for security issues
 */
function checkSecurity(): Optimization[] {
  const issues: Optimization[] = [];
  
  // Check for hardcoded secrets
  const srcDir = path.join(PROJECT_ROOT, 'src');
  const files = getAllFiles(srcDir, ['.ts']);
  
  const secretPatterns = [
    /apiKey\s*=\s*['"][^'"]{20,}/,
    /password\s*=\s*['"][^'"]{8,}/,
    /secret\s*=\s*['"][^'"]{8,}/
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(srcDir, file);
    
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        issues.push({
          file: relativePath,
          issue: 'Potential hardcoded secret',
          fix: 'Use environment variables',
          priority: 'high',
          fixed: false
        });
      }
    }
  }
  
  return issues;
}

/**
 * Get all files in directory
 */
function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (item.isFile()) {
      const ext = path.extname(item.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Auto-fix some common issues
 */
async function autoFix(): Promise<number> {
  let fixed = 0;
  
  log('Attempting auto-fixes...', 'info');
  
  // Fix 1: Update version in index.ts if needed
  const indexPath = path.join(PROJECT_ROOT, 'src/index.ts');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf-8');
    
    // Update version comment
    const pkgPath = path.join(PROJECT_ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const currentVersion = pkg.version;
    
    if (content.includes(`'2.`) && !content.includes(`'${currentVersion}'`)) {
      content = content.replace(/const VERSION = '[\d.]+';/, `const VERSION = '${currentVersion}';`);
      fs.writeFileSync(indexPath, content);
      log(`Updated version to ${currentVersion}`, 'success');
      fixed++;
    }
  }
  
  // Fix 2: Ensure .npmignore is proper
  const npmignorePath = path.join(PROJECT_ROOT, '.npmignore');
  if (!fs.existsSync(npmignorePath)) {
    const npmignore = `# Dependencies
node_modules/

# Build outputs
dist/
dist-cjs/

# Development
.vscode/
.idea/

# Tests
coverage/
tests/
*.test.ts
vitest.config.ts

# Git
.git/
.github/

# IDE
*.swp
*.swo
*~

# Docs
docs/

# Misc
.DS_Store
*.tgz
`;
    fs.writeFileSync(npmignorePath, npmignore);
    log('Created .npmignore', 'success');
    fixed++;
  }
  
  return fixed;
}

/**
 * Main function
 */
async function main() {
  log('Starting code analysis...', 'info');
  
  const allIssues: Optimization[] = [];
  
  // Run all checks
  log('Checking TypeScript...', 'info');
  allIssues.push(...checkTypeScript());
  
  log('Checking imports...', 'info');
  allIssues.push(...checkUnusedImports());
  
  log('Checking documentation...', 'info');
  allIssues.push(...checkJSDoc());
  
  log('Checking package.json...', 'info');
  allIssues.push(...checkPackageJson());
  
  log('Checking security...', 'info');
  allIssues.push(...checkSecurity());
  
  // Print summary
  log(`\nFound ${allIssues.length} potential issues`, 'info');
  
  const byPriority = {
    high: allIssues.filter(i => i.priority === 'high'),
    medium: allIssues.filter(i => i.priority === 'medium'),
    low: allIssues.filter(i => i.priority === 'low')
  };
  
  console.log('\n📊 Issues by Priority:');
  console.log(`   🔴 High: ${byPriority.high.length}`);
  console.log(`   🟡 Medium: ${byPriority.medium.length}`);
  console.log(`   🔵 Low: ${byPriority.low.length}`);
  
  if (allIssues.length > 0) {
    console.log('\n📋 Top Issues:');
    allIssues.slice(0, 10).forEach((issue, i) => {
      console.log(`   ${i + 1}. [${issue.priority}] ${issue.file}: ${issue.issue}`);
    });
  }
  
  // Auto-fix what we can
  const fixed = await autoFix();
  log(`\nAuto-fixed ${fixed} issues`, 'success');
  
  // Summary
  log('\n✅ Code analysis complete!', 'success');
}

main().catch(console.error);
