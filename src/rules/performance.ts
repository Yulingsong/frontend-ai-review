// Performance Rules for Frontend AI Review

import type { Rule, Issue } from '../types/index.js';
import { generateId } from '../utils/index.js';

export const performanceRules: Rule[] = [
  {
    id: 'perf/console-log',
    category: 'performance',
    severity: 'suggestion',
    name: 'console-log',
    description: '生产环境应移除 console.log',
    fixable: true,
    fix: '删除此行',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.match(/console\.(log|debug|info)\(/) && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: generateId(),
            ruleId: 'perf/console-log',
            message: '生产环境建议移除 console.log',
            severity: 'suggestion',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } },
            fixable: true,
            fix: '删除此行'
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'perf/anonymous-function',
    category: 'performance',
    severity: 'suggestion',
    name: 'anonymous-function',
    description: '避免在 JSX 中使用匿名函数，每次渲染都会创建新函数',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // onClick={function() or onClick={() =>
        if (line.match(/on(?:Click|Change|Submit|MouseEnter|Input)=\{/)) {
          if (line.match(/=\{\s*(?:async\s+)?\(?\s*[^=]*\s*=>?\s*[^}]*\}\s*\}/)) {
            issues.push({
              id: generateId(),
              ruleId: 'perf/anonymous-function',
              message: '避免在 JSX 事件处理中使用匿名函数，使用 useCallback 包装',
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
    id: 'perf/array-push-in-loop',
    category: 'performance',
    severity: 'warning',
    name: 'array-push-in-loop',
    description: '循环中频繁 push 到数组可能影响性能',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      let inLoop = false;
      
      lines.forEach((line, i) => {
        if (line.match(/for\s*\(/) || line.match(/while\s*\(/)) {
          inLoop = true;
        }
        if (inLoop && line.includes('}')) {
          inLoop = false;
        }
        if (inLoop && line.includes('.push(')) {
          issues.push({
            id: generateId(),
            ruleId: 'perf/array-push-in-loop',
            message: '循环中频繁 push 可能影响性能，考虑使用 map 或预分配数组',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'perf/object-assign',
    category: 'performance',
    severity: 'suggestion',
    name: 'object-assign',
    description: 'Object.assign 可使用对象展开语法替代',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (line.includes('Object.assign(')) {
          issues.push({
            id: generateId(),
            ruleId: 'perf/object-assign',
            message: '可使用对象展开语法 { ...obj1, ...obj2 } 替代 Object.assign',
            severity: 'suggestion',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'perf/dup-array-methods',
    category: 'performance',
    severity: 'warning',
    name: 'dup-array-methods',
    description: '避免链式调用中重复遍历数组',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // Check for .filter().map() - can be combined into .flatMap()
        if (line.includes('.filter(') && line.includes('.map(')) {
          issues.push({
            id: generateId(),
            ruleId: 'perf/dup-array-methods',
            message: '可使用 flatMap 替代 filter 后再 map',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
        // Check for .map().filter()
        if (line.match(/\.map\([^)]+\)\s*\.\s*filter\(/)) {
          issues.push({
            id: generateId(),
            ruleId: 'perf/dup-array-methods',
            message: '可先 filter 后 map，或使用 reduce 合并',
            severity: 'warning',
            location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
          });
        }
      });
      
      return issues;
    }
  },
  {
    id: 'perf/react-memo',
    category: 'performance',
    severity: 'suggestion',
    name: 'react-memo',
    description: '纯组件建议使用 React.memo 包装',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      // Check for component without React.memo
      lines.forEach((line, i) => {
        if (line.match(/^const\s+\w+\s*=\s*\([^)]*\)\s*=>/) || line.match(/^function\s+\w+\s*\(/)) {
          // Check if next few lines contain props usage but no memo
          const funcBlock = lines.slice(i, i + 20).join('\n');
          if (funcBlock.includes('props.') && !content.includes('React.memo') && !content.includes('memo(')) {
            issues.push({
              id: generateId(),
              ruleId: 'perf/react-memo',
              message: '纯展示组件建议使用 React.memo 包装以避免不必要的重渲染',
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
    id: 'perf/list-without-key',
    category: 'performance',
    severity: 'warning',
    name: 'list-without-key',
    description: '列表渲染应提供稳定的 key',
    detect: (content: string) => {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        // .map without key
        if (line.includes('.map(') && !line.includes('key=')) {
          // Check if this is JSX context
          const prevLines = lines.slice(Math.max(0, i - 3), i).join('\n');
          if (prevLines.includes('<') || prevLines.includes('return')) {
            issues.push({
              id: generateId(),
              ruleId: 'perf/list-without-key',
              message: '.map 渲染列表时应提供稳定的 key',
              severity: 'warning',
              location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
            });
          }
        }
      });
      
      return issues;
    }
  }
];
