// Rule exports and manager for Frontend AI Review

import { reactRules } from './react.js';
import { vueRules } from './vue.js';
import { typescriptRules } from './typescript.js';
import { securityRules } from './security.js';
import { performanceRules } from './performance.js';
import { bestPracticeRules } from './best-practice.js';
import type { Rule, SeverityLevel } from '../types/index.js';

// All rules combined
export const allRules = [
  ...reactRules,
  ...vueRules,
  ...typescriptRules,
  ...securityRules,
  ...performanceRules,
  ...bestPracticeRules
];

// Categories
export const categories = [
  'react',
  'vue',
  'typescript',
  'security',
  'performance',
  'best-practice'
] as const;

export type Category = typeof categories[number];

/**
 * Get rules by category
 */
export function getRulesByCategory(category: Category): Rule[] {
  switch (category) {
    case 'react': return reactRules;
    case 'vue': return vueRules;
    case 'typescript': return typescriptRules;
    case 'security': return securityRules;
    case 'performance': return performanceRules;
    case 'best-practice': return bestPracticeRules;
    default: return [];
  }
}

/**
 * Get rules by IDs
 */
export function getRulesByIds(ruleIds: string[]): Rule[] {
  return allRules.filter(r => ruleIds.includes(r.id));
}

/**
 * Filter rules by options
 */
export function filterRules(
  rules: Rule[],
  options: {
    category?: string[];
    rules?: string[];
    severity?: SeverityLevel;
  }
): Rule[] {
  let filtered = [...rules];

  if (options.category && options.category.length > 0) {
    filtered = filtered.filter(r => options.category!.includes(r.category));
  }

  if (options.rules && options.rules.length > 0) {
    filtered = filtered.filter(r => options.rules!.includes(r.id));
  }

  if (options.severity) {
    const minLevel = getSeverityLevelNum(options.severity);
    filtered = filtered.filter(r => getSeverityLevelNum(r.severity) >= minLevel);
  }

  return filtered;
}

function getSeverityLevelNum(severity: SeverityLevel): number {
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
export function getRuleStats() {
  return {
    total: allRules.length,
    byCategory: {
      react: reactRules.length,
      vue: vueRules.length,
      typescript: typescriptRules.length,
      security: securityRules.length,
      performance: performanceRules.length,
      'best-practice': bestPracticeRules.length
    },
    fixable: allRules.filter(r => r.fixable).length,
    bySeverity: {
      error: allRules.filter(r => r.severity === 'error').length,
      warning: allRules.filter(r => r.severity === 'warning').length,
      suggestion: allRules.filter(r => r.severity === 'suggestion').length
    }
  };
}

export { reactRules, vueRules, typescriptRules, securityRules, performanceRules, bestPracticeRules };
