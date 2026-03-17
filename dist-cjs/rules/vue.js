"use strict";
// Vue Rules for Frontend AI Review
Object.defineProperty(exports, "__esModule", { value: true });
exports.vueRules = void 0;
const index_js_1 = require("../utils/index.js");
exports.vueRules = [
    {
        id: 'vue/no-ref-as-reactivity',
        category: 'vue',
        severity: 'warning',
        name: 'no-ref-as-reactivity',
        description: 'ref.value 在模板中使用时不需要 .value',
        detect: (content) => {
            const issues = [];
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                // ref used without .value in script
                if (line.match(/ref\.\w+\.value/) && !line.includes('const ') && !line.includes('let ')) {
                    issues.push({
                        id: (0, index_js_1.generateId)(),
                        ruleId: 'vue/no-ref-as-reactivity',
                        message: 'ref.value 使用注意：在脚本中访问需要 .value，模板中不需要',
                        severity: 'warning',
                        location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
                    });
                }
            });
            return issues;
        }
    },
    {
        id: 'vue/require-default-prop',
        category: 'vue',
        severity: 'warning',
        name: 'require-default-prop',
        description: 'Props 应有默认值或标记为 required',
        detect: (content) => {
            const issues = [];
            // Check for props definition without defaults
            const propsMatch = content.match(/props\s*:\s*\{([^}]+)\}/s);
            if (propsMatch) {
                const propLines = propsMatch[0].split('\n');
                propLines.forEach((line) => {
                    // Prop without type or default
                    if (line.trim() && !line.includes(':') && !line.includes('default') && !line.includes('required')) {
                        const actualLine = propsMatch[0].split('\n').findIndex(l => l === line);
                        if (actualLine >= 0) {
                            issues.push({
                                id: (0, index_js_1.generateId)(),
                                ruleId: 'vue/require-default-prop',
                                message: 'Prop 应指定类型、默认值或标记为 required',
                                severity: 'warning',
                                location: { start: { line: actualLine + 1, column: 0 }, end: { line: actualLine + 1, column: 0 } }
                            });
                        }
                    }
                });
            }
            return issues;
        }
    },
    {
        id: 'vue/v-for-key',
        category: 'vue',
        severity: 'warning',
        name: 'v-for-key',
        description: 'v-for 循环应指定唯一的 key',
        detect: (content) => {
            const issues = [];
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                // v-for without key - improved pattern matching
                // Match v-for="..." but not :key="..."
                if (line.includes('v-for=') && !line.includes(':key=') && !line.match(/key\s*=/)) {
                    issues.push({
                        id: (0, index_js_1.generateId)(),
                        ruleId: 'vue/v-for-key',
                        message: 'v-for 循环应指定 :key 属性以优化渲染性能',
                        severity: 'warning',
                        location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
                    });
                }
                // Check for key using index - warning about potential issue
                if (line.includes('v-for=') && line.match(/key\s*=\s*["']?\{\s*\(?\s*index/i)) {
                    issues.push({
                        id: (0, index_js_1.generateId)(),
                        ruleId: 'vue/v-for-key',
                        message: '不建议使用 index 作为 key，当列表顺序变化时会导致渲染问题',
                        severity: 'warning',
                        location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
                    });
                }
            });
            return issues;
        }
    },
    {
        id: 'vue/v-if-with-v-for',
        category: 'vue',
        severity: 'error',
        name: 'v-if-with-v-for',
        description: '避免在 v-for 元素上同时使用 v-if',
        detect: (content) => {
            const issues = [];
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                // v-for with v-if on the same element - performance issue
                if (line.includes('v-for=') && line.includes('v-if=')) {
                    issues.push({
                        id: (0, index_js_1.generateId)(),
                        ruleId: 'vue/v-if-with-v-for',
                        message: '避免在 v-for 元素上同时使用 v-if，建议使用计算属性或 v-show 替代',
                        severity: 'error',
                        location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
                    });
                }
            });
            return issues;
        }
    },
    {
        id: 'vue/no-multiple-objects-in-data',
        category: 'vue',
        severity: 'warning',
        name: 'no-multiple-objects-in-data',
        description: 'data 选项应返回一个函数（组件中）',
        detect: (content) => {
            const issues = [];
            // Check if it's a component (has component options)
            if (content.includes('export default') || content.includes('defineComponent')) {
                const dataMatch = content.match(/data\s*\(\s*\)\s*\{([^}]+)\}/s);
                if (dataMatch && !content.includes('return')) {
                    issues.push({
                        id: (0, index_js_1.generateId)(),
                        ruleId: 'vue/no-multiple-objects-in-data',
                        message: '组件中的 data 选项应返回一个函数',
                        severity: 'warning',
                        location: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } }
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'vue/no-mutating-props',
        category: 'vue',
        severity: 'error',
        name: 'no-mutating-props',
        description: '禁止直接修改 props，props 是只读的',
        detect: (content) => {
            const issues = [];
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                // Mutating props directly
                if (line.match(/this\.\w+\s*=\s*/) && line.match(/props/i)) {
                    issues.push({
                        id: (0, index_js_1.generateId)(),
                        ruleId: 'vue/no-mutating-props',
                        message: '禁止直接修改 props，使用 data 或 computed 替代',
                        severity: 'error',
                        location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }
                    });
                }
            });
            return issues;
        }
    }
];
//# sourceMappingURL=vue.js.map