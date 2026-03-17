// React Rules for Frontend AI Review

import type { Rule, Issue } from '../types/index.js';
import { generateId } from '../utils/index.js';

export const reactRules: Rule[] = [
  {
    id: 'react/exhaustive-deps',
    category: 'react',
    severity: 'warning',
    name: 'exhaustive-deps',
    description: 'useEffect 依赖数组应该包含所有使用到的响应式值',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Match useEffect with empty deps
        if (line.includes('useEffect') && line.includes('[]')) {
          // Look ahead to find the function body
          const funcBody = lines.slice(i, i + 10).join('\n');
          
          // Check if there are setState calls without being in deps
          if (funcBody.match(/set[A-Z]\w+\(/) && !funcBody.match(/\[[\s\w,]*set[A-Z]/)) {
            issues.push({
              id: generateId(),
              ruleId: 'react/exhaustive-deps',
              message: 'useEffect 依赖数组可能不完整，检测到 setState 但未包含在依赖中',
              severity: 'warning',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          }
        }
      });
      
      return issues;
    }
  },
  {
    id: 'react/no-array-index-key',
    category: 'react',
    severity: 'warning',
    name: 'no-array-index-key',
    description: '避免使用数组索引作为 key，应该使用唯一 ID',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Match key={index} or key={i}
        if (line.match(/key\s*=\s*\{\s*(?:index|i)\s*\}/)) {
          issues.push({
            id: generateId(),
            ruleId: 'react/no-array-index-key',
            message: '禁止使用数组索引作为 key，应使用唯一 ID',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'react/hooks-rule-of-hooks',
    category: 'react',
    severity: 'error',
    name: 'hooks-rule-of-hooks',
    description: 'Hooks 必须只在组件顶层调用，不能在循环、条件或嵌套函数中调用',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Check for hooks inside conditionals
        if (line.match(/if\s*\(.*\)\s*\{\s*use[A-Z]/) || 
            line.match(/if\s*\(.*\)\s*use[A-Z]/)) {
          issues.push({
            id: generateId(),
            ruleId: 'react/hooks-rule-of-hooks',
            message: 'Hooks 不能在条件语句中调用',
            severity: 'error',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
        // Check for hooks inside loops
        if (line.match(/for\s*\(.*\)\s*\{\s*use[A-Z]/) ||
            line.match(/while\s*\(.*\)\s*\{\s*use[A-Z]/)) {
          issues.push({
            id: generateId(),
            ruleId: 'react/hooks-rule-of-hooks',
            message: 'Hooks 不能在循环中调用',
            severity: 'error',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'react/no-direct-mutation-state',
    category: 'react',
    severity: 'error',
    name: 'no-direct-mutation-state',
    description: '禁止直接修改 state，应该使用 setState',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Direct state mutation in class components
        if (line.match(/this\.state\.\w+\s*=/)) {
          issues.push({
            id: generateId(),
            ruleId: 'react/no-direct-mutation-state',
            message: '禁止直接修改 state，使用 setState() 替代',
            severity: 'error',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
        // Direct array mutation
        if (line.match(/\.push\s*\(/g) && line.match(/state/) || line.match(/set\w+\s*\(\s*\w+\s*=>\s*\[\s*\.\.\.\w+/)) {
          // More specific detection needed
        }
      });
      
      return issues;
    }
  },
  {
    id: 'react/button-has-type',
    category: 'react',
    severity: 'suggestion',
    name: 'button-has-type',
    description: 'button 元素应该指定 type 属性',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Button without type
        if (line.match(/<button[^>]*>/i) && !line.match(/type\s*=/i)) {
          issues.push({
            id: generateId(),
            ruleId: 'react/button-has-type',
            message: 'button 应指定 type 属性 (button/submit/reset)',
            severity: 'suggestion',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'react/iframe-missing-title',
    category: 'react',
    severity: 'warning',
    name: 'iframe-missing-title',
    description: 'iframe 元素应该指定 title 属性',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.match(/<iframe[^>]*>/i) && !line.match(/title\s*=/i)) {
          issues.push({
            id: generateId(),
            ruleId: 'react/iframe-missing-title',
            message: 'iframe 应指定 title 属性以提高可访问性',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'react/Img-missing-alt',
    category: 'react',
    severity: 'warning',
    name: 'img-missing-alt',
    description: 'img 元素应该指定 alt 属性',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // img without alt or with empty alt when decorative
        if (line.match(/<img[^>]*>/i)) {
          if (!line.match(/alt\s*=/i)) {
            issues.push({
              id: generateId(),
              ruleId: 'react/img-missing-alt',
              message: 'img 应指定 alt 属性以提高可访问性',
              severity: 'warning',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          } else if (line.match(/alt\s*=\s*["']\s*["']/)) {
            issues.push({
              id: generateId(),
              ruleId: 'react/img-missing-alt',
              message: 'img 的 alt 属性不应为空字符串，除非是装饰性图片',
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
    id: 'react/use-async-callback',
    category: 'react',
    severity: 'suggestion',
    name: 'use-async-callback',
    description: '异步函数应使用 useCallback 包装以避免不必要的重新创建',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Async function in JSX prop without useCallback
        if (line.match(/on(?:Click|Change|Submit)\s*=\s*\{\s*async\s+/)) {
          if (!content.includes('useCallback')) {
            issues.push({
              id: generateId(),
              ruleId: 'react/use-async-callback',
              message: '异步事件处理函数建议使用 useCallback 包装',
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
    id: 'react/prop-types',
    category: 'react',
    severity: 'warning',
    name: 'prop-types',
    description: '组件 Props 应声明类型定义',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      // Check for components that use props but don't have prop-types or TypeScript interfaces
      const hasPropsUsage = content.includes('this.props') || content.includes('props.');
      const hasPropTypes = content.includes('propTypes') || content.includes('PropTypes');
      const hasTypeScriptProps = content.includes('interface Props') || content.includes('type Props') || content.includes('<Props');
      const isTypeScript = content.includes(': React.FC') || content.includes('React.ComponentType') || content.match(/:\s*\w+\s*props/i);
      
      // Only check functional components with props
      if (hasPropsUsage && !hasPropTypes && !hasTypeScriptProps && isTypeScript) {
        // Find the component definition
        lines.forEach((line, i) => {
          if (line.match(/^const\s+\w+\s*=\s*\([^)]*\)\s*=>/) || 
              line.match(/^function\s+\w+\s*\([^)]*\)/) ||
              line.match(/= \([^)]*\)\s*=>/)) {
            issues.push({
              id: generateId(),
              ruleId: 'react/prop-types',
              message: '组件使用 props 但未声明类型，建议使用 TypeScript 接口或添加 prop-types',
              severity: 'warning',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          }
        });
      }
      
      // Check for destructured props without default values
      lines.forEach((line, i) => {
        const match = line.match(/const\s+\{\s*(\w+)\s*\}=\s*props/);
        if (match) {
          const propName = match[1];
          // Check if this prop is used but no default or type
          const restOfFile = lines.slice(i).join('\n');
          if (restOfFile.includes(propName) && 
              !line.includes('=') && 
              !content.includes(`defaultProps`) &&
              !content.includes('interface Props')) {
            issues.push({
              id: generateId(),
              ruleId: 'react/prop-types',
              message: `prop '${propName}' 解构时建议提供默认值或声明类型`,
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
    id: 'react/require-default-props',
    category: 'react',
    severity: 'suggestion',
    name: 'require-default-props',
    description: '非必填 props 应提供 defaultProps',
    detect: (content: string) => {
      const issues: Issue[] = [];
      
      // Check if component has prop-types but missing defaultProps for optional props
      if (content.includes('propTypes') && !content.includes('defaultProps')) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('propTypes') || line.match(/^\s*\w+:/)) {
            issues.push({
              id: generateId(),
              ruleId: 'react/require-default-props',
              message: '组件有 prop-types 但缺少 defaultProps，建议为可选 prop 提供默认值',
              severity: 'suggestion',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
            return;
          }
        });
      }
      
      return issues;
    }
  }
];
