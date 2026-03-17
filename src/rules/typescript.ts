// TypeScript Rules for Frontend AI Review

import type { Rule, Issue } from '../types/index.js';
import { generateId } from '../utils/index.js';

export const typescriptRules: Rule[] = [
  {
    id: 'typescript/no-any',
    category: 'typescript',
    severity: 'warning',
    name: 'no-any',
    description: '避免使用 any 类型，应使用具体的类型',
    detect: (content: string, filePath: string) => {
      if (!filePath.match(/\.(ts|tsx)$/)) return [];
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Avoid any type in annotations
        if (line.match(/:\s*any\b/) && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: generateId(),
            ruleId: 'typescript/no-any',
            message: '避免使用 any 类型，使用具体类型替代',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'typescript/no-unused-vars',
    category: 'typescript',
    severity: 'warning',
    name: 'no-unused-vars',
    description: '禁止未使用的变量',
    detect: (content: string, filePath: string) => {
      if (!filePath.match(/\.(ts|tsx)$/)) return [];
      const issues: Issue[] = [];
      const vars = new Set<string>();
      const usedVars = new Set<string>();
      
      // Find variable declarations
      content.split('\n').forEach(line => {
        const declMatch = line.match(/(?:const|let|var)\s+(\w+)/g);
        if (declMatch) {
          declMatch.forEach(m => {
            const varName = m.replace(/^(const|let|var)\s+/, '');
            if (!line.includes('=')) vars.add(varName);
          });
        }
      });
      
      // Find usage (simplified)
      content.split('\n').forEach(line => {
        const useMatch = line.match(/\b(\w+)\b/g);
        if (useMatch) {
          useMatch.forEach(m => {
            if (vars.has(m)) usedVars.add(m);
          });
        }
      });
      
      // Report unused vars (excluding private vars starting with _)
      vars.forEach((v: string) => {
        if (!usedVars.has(v) && !v.startsWith('_')) {
          const idx = content.split('\n').findIndex(l => l.includes(`const ${v}`) || l.includes(`let ${v}`));
          if (idx >= 0) {
            issues.push({
              id: generateId(),
              ruleId: 'typescript/no-unused-vars',
              message: `变量 '${v}' 已声明但未使用`,
              severity: 'warning',
              location: { start: { line: idx + 1, column: 0 }, end: { line: idx + 1, column: 0 } },
              fixable: true,
              fix: '删除变量声明'
            });
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'typescript/explicit-return',
    category: 'typescript',
    severity: 'suggestion',
    name: 'explicit-return',
    description: '建议显式声明函数返回类型',
    detect: (content: string, filePath: string) => {
      if (!filePath.match(/\.(ts|tsx)$/)) return [];
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Function without return type
        if ((line.match(/function\s+\w+\s*\([^)]*\)/) || line.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/)) && 
            !line.match(/:\s*(void|string|number|boolean|any|\w+)/)) {
          // Skip if it's a simple one-liner
          const nextLine = lines[i + 1] || '';
          if (!nextLine.includes('return') && !line.includes('{')) {
            issues.push({
              id: generateId(),
              ruleId: 'typescript/explicit-return',
              message: '建议显式声明函数返回类型',
              severity: 'suggestion',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'typescript/await-promise',
    category: 'typescript',
    severity: 'error',
    name: 'await-promise',
    description: 'await 只能用于 Promise',
    detect: (content: string, filePath: string) => {
      if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return [];
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.includes('await ') && !line.includes('Promise') && !line.includes('then')) {
          // This is a simplified check - in real code would need AST
          if (line.match(/await\s+[^(\s;]+/)) {
            issues.push({
              id: generateId(),
              ruleId: 'typescript/await-promise',
              message: 'await 只能用于 Promise 或 thenable 对象',
              severity: 'error',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'typescript/no-implicit-any-catch',
    category: 'typescript',
    severity: 'warning',
    name: 'no-implicit-any-catch',
    description: 'catch 参数应指定类型',
    detect: (content: string, filePath: string) => {
      if (!filePath.match(/\.(ts|tsx)$/)) return [];
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.match(/catch\s*\(\s*\w+\s*\)/)) {
          issues.push({
            id: generateId(),
            ruleId: 'typescript/no-implicit-any-catch',
            message: 'catch 参数应指定类型，如 catch(error: Error)',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'typescript/strict-null-checks',
    category: 'typescript',
    severity: 'warning',
    name: 'strict-null-checks',
    description: '注意 null/undefined 检查',
    detect: (content: string, filePath: string) => {
      if (!filePath.match(/\.(ts|tsx)$/)) return [];
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line) => {
        // Accessing property without null check
        if (line.match(/\w+\.\w+/) && !line.includes('?') && !line.includes('if')) {
          // Skip known safe patterns
          if (!line.includes('const ') && !line.includes('let ')) {
            // Simplified - would need AST for accurate detection
          }
        }
      });
      
      return issues;
    }
  }
];
