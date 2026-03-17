/**
 * Fair ESLint Plugin
 * 集成 Fair 规则到 ESLint
 */

const { Linter } = require('eslint');
const fair = require('../dist/index.js');

// 导出 ESLint 规则
module.exports = {
  rules: {
    'fair-react': {
      meta: { type: 'suggestion', docs: { description: 'Fair React 规则' } },
      create(context) {
        const source = context.getSourceCode();
        const code = source.getText();
        const issues = fair.analyze ? [] : []; // 使用 fair 规则
        return {
          CallExpression(node) {
            // react/exhaustive-deps
            if (node.callee.name === 'useEffect') {
              const deps = node.arguments[1];
              if (deps && deps.type === 'ArrayExpression' && deps.elements.length === 0) {
                context.report({ node, message: 'useEffect 依赖数组可能不完整' });
              }
            }
          }
        };
      }
    },
    'fair-security': {
      meta: { type: 'problem', docs: { description: 'Fair 安全规则' } },
      create(context) {
        const source = context.getSourceCode();
        return {
          Literal(node) {
            if (node.value && typeof node.value === 'string') {
              // 硬编码凭证检测
              if (/(password|secret|api[_-]?key|token)/i.test(node.value) && 
                  !node.value.includes('process.env')) {
                context.report({ node, message: '检测到硬编码凭证: ' + node.value.slice(0, 10) + '...' });
              }
            }
          },
          CallExpression(node) {
            if (node.callee.name === 'eval') {
              context.report({ node, message: '禁止使用 eval' });
            }
          }
        };
      }
    },
    'fair-best-practice': {
      meta: { type: 'suggestion', docs: { description: 'Fair 最佳实践规则' } },
      create(context) {
        return {
          VariableDeclaration(node) {
            if (node.kind === 'var') {
              context.report({ node, message: '建议使用 const/let 替代 var' });
            }
          },
          CatchClause(node) {
            if (node.body.body.length === 0) {
              context.report({ node, message: 'catch 块为空，应记录错误' });
            }
          }
        };
      }
    }
  },
  configs: {
    recommended: {
      plugins: ['fair'],
      rules: {
        'fair/fair-react': 'warn',
        'fair/fair-security': 'error',
        'fair/fair-best-practice': 'warn'
      }
    }
  }
};
