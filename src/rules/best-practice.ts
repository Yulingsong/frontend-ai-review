// Best Practice Rules for Frontend AI Review

import type { Rule, Issue } from '../types/index.js';
import { generateId } from '../utils/index.js';

export const bestPracticeRules: Rule[] = [
  {
    id: 'best-practice/no-magic-numbers',
    category: 'best-practice',
    severity: 'suggestion',
    name: 'no-magic-numbers',
    description: '禁止使用魔法数字，应使用常量或枚举',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // Magic numbers (3+ digits)
        if ((line.match(/===\s*\d{3,}/) ||
             line.match(/<\s*\d{3,}/) ||
             line.match(/>\s*\d{3,}/) ||
             line.match(/<=\s*\d{3,}/) ||
             line.match(/>=\s*\d{3,}/)) &&
            !line.includes('const ') &&
            !line.includes('//') &&
            !line.includes('return')) {
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/no-magic-numbers',
            message: '检测到魔法数字，应提取为常量',
            severity: 'suggestion',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });

      return issues;
    }
  },
  {
    id: 'best-practice/empty-catch',
    category: 'best-practice',
    severity: 'warning',
    name: 'empty-catch',
    description: 'catch 块不应为空，应至少记录错误',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // Empty catch block
        if (line.match(/catch[^}]*\{\s*\}/)) {
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/empty-catch',
            message: 'catch 块不应为空，至少应记录错误日志',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });

      return issues;
    }
  },
  {
    id: 'best-practice/no-var',
    category: 'best-practice',
    severity: 'warning',
    name: 'no-var',
    description: '使用 const/let 替代 var',
    fixable: true,
    fix: 'var → let',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        if (line.match(/\bvar\s+\w+/) && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/no-var',
            message: '使用 const/let 替代 var',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } },
            fixable: true,
            fix: 'var → let'
          });
        }
      });

      return issues;
    }
  },
  {
    id: 'best-practice/prefer-const',
    category: 'best-practice',
    severity: 'suggestion',
    name: 'prefer-const',
    description: '优先使用 const 声明不会重新赋值的变量',
    fixable: true,
    fix: 'let → const',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // let without reassignment
        if (line.match(/let\s+\w+/) && !line.includes('=')) {
          const varName = line.match(/let\s+(\w+)/)?.[1];
          if (varName) {
            // Check if variable is reassigned later
            const restOfFile = lines.slice(i).join('\n');
            const reassignPattern = new RegExp(`\\b${varName}\\s*=\\s*[^=]`);
            if (!reassignPattern.test(restOfFile)) {
              issues.push({
                id: generateId(),
                ruleId: 'best-practice/prefer-const',
                message: `建议用 const 声明 ${varName}`,
                severity: 'suggestion',
                location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } },
                fixable: true,
                fix: 'let → const'
              });
            }
          }
        }
      });

      return issues;
    }
  },
  {
    id: 'best-practice/require-await',
    category: 'best-practice',
    severity: 'suggestion',
    name: 'require-await',
    description: 'async 函数应正确处理 Promise',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // async function without await
        if (line.includes('async') && (line.match(/function\s+\w+/) || line.match(/=.*=>/))) {
          if (!line.includes('await') && !line.includes('Promise.all') && !line.includes('Promise.race')) {
            issues.push({
              id: generateId(),
              ruleId: 'best-practice/require-await',
              message: 'async 函数应正确使用 await 处理异步操作',
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
    id: 'best-practice/no-nested-callbacks',
    category: 'best-practice',
    severity: 'warning',
    name: 'no-nested-callbacks',
    description: '避免嵌套回调地狱，使用 async/await 或 Promise',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      let callbackDepth = 0;
      let maxDepth = 0;
      let maxDepthLine = 0;

      lines.forEach((line, i) => {
        if (line.includes('.then(') || line.includes('.catch(') || line.includes('function(')) {
          callbackDepth++;
          if (callbackDepth > maxDepth) {
            maxDepth = callbackDepth;
            maxDepthLine = i;
          }
        }
        if (line.includes('})')) {
          callbackDepth = Math.max(0, callbackDepth - 1);
        }
      });

      if (maxDepth >= 3) {
        issues.push({
          id: generateId(),
          ruleId: 'best-practice/no-nested-callbacks',
          message: `检测到 ${maxDepth} 层嵌套回调，建议使用 async/await 重构`,
          severity: 'warning',
          location: { start: { line: maxDepthLine + 1, column: 0 }, end: { line: maxDepthLine + 1, column: 0 } }
        });
      }

      return issues;
    }
  },
  {
    id: 'best-practice/error-throw',
    category: 'best-practice',
    severity: 'warning',
    name: 'error-throw',
    description: '应抛出 Error 对象而非字符串',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // throw "string" instead of throw new Error("string")
        if (line.match(/throw\s+['"`]/)) {
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/error-throw',
            message: '应抛出 Error 对象而非字符串',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });

      return issues;
    }
  },
  {
    id: 'best-practice/import-order',
    category: 'best-practice',
    severity: 'suggestion',
    name: 'import-order',
    description: '导入语句应有规律的顺序',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      const importLines: Array<{
        line: number;
        type: 'side-effect' | 'package' | 'relative' | 'builtin';
        value: string;
        isDefault: boolean;
        isNamespace: boolean;
      }> = [];

      // Parse all import statements
      lines.forEach((line, i) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('import ')) {
          // Side-effect import: import './style.css'
          if (trimmedLine.match(/^import\s+['"][^'"]+['"]/)) {
            importLines.push({ line: i, type: 'side-effect', value: trimmedLine, isDefault: false, isNamespace: false });
          }
          // Regular import with from
          else if (trimmedLine.includes(' from ')) {
            const match = trimmedLine.match(/import\s+(?:\{[^}]*\}|\w+|\* as \w+)?\s*from\s+['"]([^'"]+)['"]/);
            if (match) {
              const path = match[1];
              const isRelative = path.startsWith('.');
              const isBuiltin = /^(?:node:|@?std\/)/.test(path) ||
                               ['path', 'fs', 'os', 'http', 'https', 'crypto', 'util', 'events', 'stream', 'buffer', 'assert', 'child_process', 'cluster', 'dgram', 'dns', 'domain', 'http2', 'https', 'net', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'sys', 'timers', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'].some(p => path === p || path === `node:${p}`);

              const isDefault = /import\s+\w+/.test(trimmedLine) && !trimmedLine.includes('* as');
              const isNamespace = /import\s+\*\s+as/.test(trimmedLine);

              if (isBuiltin) {
                importLines.push({ line: i, type: 'builtin', value: path, isDefault, isNamespace });
              } else if (isRelative) {
                importLines.push({ line: i, type: 'relative', value: path, isDefault, isNamespace });
              } else {
                importLines.push({ line: i, type: 'package', value: path, isDefault, isNamespace });
              }
            }
          }
          // Dynamic import
          else if (trimmedLine.startsWith('import(')) {
            importLines.push({ line: i, type: 'side-effect', value: 'dynamic', isDefault: false, isNamespace: false });
          }
        }
      });

      // Expected order: builtin → package → relative → side-effect
      const typeOrder = { 'builtin': 0, 'package': 1, 'relative': 2, 'side-effect': 3 };
      let lastType = -1;

      for (const imp of importLines) {
        const currentType = typeOrder[imp.type];
        if (currentType < lastType) {
          const expectedOrder = Object.entries(typeOrder)
            .filter(([, v]) => v < currentType)
            .map(([k]) => k)
            .join(' → ');
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/import-order',
            message: `导入顺序应为: ${expectedOrder}`,
            severity: 'suggestion',
            location: { start: { line: imp.line + 1, column: 0 }, end: { line: imp.line + 1, column: 0 } }
          });
        }
        lastType = currentType;
      }

      // Check for duplicate imports
      const seenImports = new Map<string, number>();
      for (const imp of importLines) {
        if (imp.type !== 'side-effect') {
          const key = imp.value;
          if (seenImports.has(key)) {
            issues.push({
              id: generateId(),
              ruleId: 'best-practice/import-order',
              message: `重复导入: ${key}`,
              severity: 'warning',
              location: { start: { line: imp.line + 1, column: 0 }, end: { line: imp.line + 1, column: 0 } }
            });
          } else {
            seenImports.set(key, imp.line);
          }
        }
      }

      return issues;
    }
  },
  {
    id: 'best-practice/completed-promises',
    category: 'best-practice',
    severity: 'warning',
    name: 'completed-promises',
    description: '避免创建已完成的 Promise',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // new Promise((resolve) => resolve(value))
        if (line.includes('new Promise') && line.includes('resolve(')) {
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/completed-promises',
            message: '可直接使用 Promise.resolve() 而无需 new Promise',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });

      return issues;
    }
  },
  {
    id: 'best-practice/useless-nullish',
    category: 'best-practice',
    severity: 'suggestion',
    name: 'useless-nullish',
    description: '不必要的空值合并运算',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        // ?? with null or undefined on right side
        if (line.includes('??') && (line.match(/\?\?\s*null/) || line.match(/\?\?\s*undefined/))) {
          issues.push({
            id: generateId(),
            ruleId: 'best-practice/useless-nullish',
            message: '?? 右侧不应是 null 或 undefined，直接使用 || 即可',
            severity: 'suggestion',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });

      return issues;
    }
  }
];
