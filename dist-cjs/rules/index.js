"use strict";
// Rule exports and manager for Frontend AI Review
Object.defineProperty(exports, "__esModule", { value: true });
exports.bestPracticeRules = exports.performanceRules = exports.securityRules = exports.typescriptRules = exports.vueRules = exports.reactRules = exports.categories = exports.allRules = void 0;
exports.getRulesByCategory = getRulesByCategory;
exports.getRulesByIds = getRulesByIds;
exports.filterRules = filterRules;
exports.getRuleStats = getRuleStats;
const react_js_1 = require("./react.js");
Object.defineProperty(exports, "reactRules", { enumerable: true, get: function () { return react_js_1.reactRules; } });
const vue_js_1 = require("./vue.js");
Object.defineProperty(exports, "vueRules", { enumerable: true, get: function () { return vue_js_1.vueRules; } });
const typescript_js_1 = require("./typescript.js");
Object.defineProperty(exports, "typescriptRules", { enumerable: true, get: function () { return typescript_js_1.typescriptRules; } });
const security_js_1 = require("./security.js");
Object.defineProperty(exports, "securityRules", { enumerable: true, get: function () { return security_js_1.securityRules; } });
const performance_js_1 = require("./performance.js");
Object.defineProperty(exports, "performanceRules", { enumerable: true, get: function () { return performance_js_1.performanceRules; } });
const best_practice_js_1 = require("./best-practice.js");
Object.defineProperty(exports, "bestPracticeRules", { enumerable: true, get: function () { return best_practice_js_1.bestPracticeRules; } });
// All rules combined
exports.allRules = [
    ...react_js_1.reactRules,
    ...vue_js_1.vueRules,
    ...typescript_js_1.typescriptRules,
    ...security_js_1.securityRules,
    ...performance_js_1.performanceRules,
    ...best_practice_js_1.bestPracticeRules
];
// Categories
exports.categories = [
    'react',
    'vue',
    'typescript',
    'security',
    'performance',
    'best-practice'
];
/**
 * Get rules by category
 */
function getRulesByCategory(category) {
    switch (category) {
        case 'react': return react_js_1.reactRules;
        case 'vue': return vue_js_1.vueRules;
        case 'typescript': return typescript_js_1.typescriptRules;
        case 'security': return security_js_1.securityRules;
        case 'performance': return performance_js_1.performanceRules;
        case 'best-practice': return best_practice_js_1.bestPracticeRules;
        default: return [];
    }
}
/**
 * Get rules by IDs
 */
function getRulesByIds(ruleIds) {
    return exports.allRules.filter(r => ruleIds.includes(r.id));
}
/**
 * Filter rules by options
 */
function filterRules(rules, options) {
    let filtered = [...rules];
    if (options.category && options.category.length > 0) {
        filtered = filtered.filter(r => options.category.includes(r.category));
    }
    if (options.rules && options.rules.length > 0) {
        filtered = filtered.filter(r => options.rules.includes(r.id));
    }
    if (options.severity) {
        const minLevel = getSeverityLevelNum(options.severity);
        filtered = filtered.filter(r => getSeverityLevelNum(r.severity) >= minLevel);
    }
    return filtered;
}
function getSeverityLevelNum(severity) {
    switch (severity) {
        case 'error': return 3;
        case 'warning': return 2;
        case 'suggestion': return 1;
        default: return 0;
    }
}
/**
 * Get rule statistics
 */
function getRuleStats() {
    return {
        total: exports.allRules.length,
        byCategory: {
            react: react_js_1.reactRules.length,
            vue: vue_js_1.vueRules.length,
            typescript: typescript_js_1.typescriptRules.length,
            security: security_js_1.securityRules.length,
            performance: performance_js_1.performanceRules.length,
            'best-practice': best_practice_js_1.bestPracticeRules.length
        },
        fixable: exports.allRules.filter(r => r.fixable).length,
        bySeverity: {
            error: exports.allRules.filter(r => r.severity === 'error').length,
            warning: exports.allRules.filter(r => r.severity === 'warning').length,
            suggestion: exports.allRules.filter(r => r.severity === 'suggestion').length
        }
    };
}
//# sourceMappingURL=index.js.map