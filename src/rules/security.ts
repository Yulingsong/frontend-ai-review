// Security Rules for Frontend AI Review

import type { Rule, Issue } from '../types/index.js';
import { generateId } from '../utils/index.js';

export const securityRules: Rule[] = [
  {
    id: 'security/eval',
    category: 'security',
    severity: 'error',
    name: 'eval',
    description: '禁止使用 eval()，存在代码注入风险',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.includes('eval(') && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: generateId(),
            ruleId: 'security/eval',
            message: '禁止使用 eval()，存在代码注入风险',
            severity: 'error',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'security/hardcoded-credentials',
    category: 'security',
    severity: 'error',
    name: 'hardcoded-credentials',
    description: '禁止硬编码凭证，应使用环境变量',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      const credentialPatterns = [
        /password\s*[:=]\s*['"`]/i,
        /secret\s*[:=]\s*['"`]/i,
        /api[_-]?key\s*[:=]\s*['"`]/i,
        /token\s*[:=]\s*['"`]/i,
        /auth\s*[:=]\s*['"`]/i,
        /bearer\s+/i,
        /private[_-]?key\s*[:=]\s*['"`]/i,
      ];
      
      lines.forEach((line, i) => {
        for (const pattern of credentialPatterns) {
          if (pattern.test(line) && 
              !line.includes('process.env') && 
              !line.includes('import') &&
              !line.includes('//')) {
            issues.push({
              id: generateId(),
              ruleId: 'security/hardcoded-credentials',
              message: '检测到硬编码凭证，应使用环境变量或配置中心',
              severity: 'error',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
            break;
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'security/inner-html',
    category: 'security',
    severity: 'error',
    name: 'inner-html',
    description: 'innerHTML 可能导致 XSS 攻击',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Direct innerHTML assignment
        if (line.match(/\.innerHTML\s*=/)) {
          issues.push({
            id: generateId(),
            ruleId: 'security/inner-html',
            message: 'innerHTML 可能导致 XSS 攻击，建议使用 textContent 或 sanitize-html',
            severity: 'error',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
        // React dangerousSetInnerHTML
        if (line.includes('dangerouslySetInnerHTML')) {
          issues.push({
            id: generateId(),
            ruleId: 'security/inner-html',
            message: 'dangerouslySetInnerHTML 存在 XSS 风险，确保内容已过 sanitize',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'security/sql-injection',
    category: 'security',
    severity: 'error',
    name: 'sql-injection',
    description: 'SQL 拼接可能导致注入攻击',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      // SQL keywords to check
      const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE'];
      
      // Dangerous patterns for SQL injection
      const dangerousPatterns = [
        /\+\s*['"`]/,                    // String concatenation with quote
        /`[^`]*\$\{/,                     // Template literal with variable
        /'\s*\+\s*\w+/,                  // ' + variable
        /"\s*\+\s*\w+/,                  // " + variable
        /\.format\([^)]*\+[^)]*\)/,      // .format() with concatenation
        /interpolate\([^)]*\+[^)]*\)/,   // Custom interpolation
      ];
      
      lines.forEach((line, i) => {
        // Skip comments and strings
        if (line.includes('//') || line.includes('/*') || line.includes('--')) {
          return;
        }
        
        // Check for SQL keywords
        const hasSQLKeyword = sqlKeywords.some(keyword => line.toUpperCase().includes(keyword));
        
        if (hasSQLKeyword) {
          // Check for dangerous patterns
          const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(line));
          
          // Check for safe patterns (parameterized queries)
          const hasParameterizedQuery = line.includes('?') || 
                                        line.includes('$1') || 
                                        line.includes('${') ||
                                        line.includes('.param(') ||
                                        line.includes('bind(') ||
                                        line.includes('execute(');
          
          // Check for ORM usage (safe)
          const hasORM = line.includes('.find') || 
                        line.includes('.where') || 
                        line.includes('.create') ||
                        line.includes('.query') ||
                        line.includes('knex');
          
          if (hasDangerousPattern && !hasParameterizedQuery && !hasORM) {
            issues.push({
              id: generateId(),
              ruleId: 'security/sql-injection',
              message: 'SQL 查询存在注入风险，使用参数化查询、ORM 或预编译语句',
              severity: 'error',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          }
          
          // Also warn about template literals with SQL
          if (line.includes('`') && line.includes('${') && !hasParameterizedQuery) {
            issues.push({
              id: generateId(),
              ruleId: 'security/sql-injection',
              message: '使用模板字符串构建 SQL 存在注入风险，建议使用参数化查询',
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
    id: 'security/command-injection',
    category: 'security',
    severity: 'error',
    name: 'command-injection',
    description: '命令注入风险',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      const dangerousFuncs = ['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync'];
      
      lines.forEach((line, i) => {
        for (const func of dangerousFuncs) {
          if (line.includes(`${func}(`) && 
              (line.includes('+') || line.includes('`') || line.includes('$(')) &&
              !line.includes('[')) {
            issues.push({
              id: generateId(),
              ruleId: 'security/command-injection',
              message: '命令执行存在注入风险，验证并清理所有输入',
              severity: 'error',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
            break;
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'security/weak-crypto',
    category: 'security',
    severity: 'warning',
    name: 'weak-crypto',
    description: '使用弱加密算法',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      const weakAlgos = ['md5', 'sha1', 'des', 'rc4'];
      
      lines.forEach((line, i) => {
        for (const algo of weakAlgos) {
          if (line.match(new RegExp(algo, 'i')) && line.includes("'")) {
            issues.push({
              id: generateId(),
              ruleId: 'security/weak-crypto',
              message: `使用弱加密算法 ${algo}，建议使用 SHA-256 或更安全的算法`,
              severity: 'warning',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
            break;
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'security/insecure-random',
    category: 'security',
    severity: 'warning',
    name: 'insecure-random',
    description: 'Math.random() 不应用于安全场景',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.includes('Math.random()') && 
            (line.includes('password') || line.includes('token') || line.includes('key') || line.includes('id'))) {
          issues.push({
            id: generateId(),
            ruleId: 'security/insecure-random',
            message: 'Math.random() 不应用于生成安全随机数，使用 crypto.randomUUID()',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'security/cookie-no-secure',
    category: 'security',
    severity: 'warning',
    name: 'cookie-no-secure',
    description: 'Cookie 应设置 Secure 标志',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.includes('cookie') && 
            line.match(/Set-Cookie|i18next|cookie-parser/) &&
            !line.includes('secure') && 
            !line.includes('Secure')) {
          issues.push({
            id: generateId(),
            ruleId: 'security/cookie-no-secure',
            message: 'Cookie 应设置 Secure 标志',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  }
];
