import { describe, it, expect } from 'vitest';
import { generateId, detectFramework, getSeverityLevel, filterBySeverity, calculateFileHash, isGitRepo, getChangedFiles } from '../src/utils/index.js';
import { allRules, getRulesByCategory, filterRules } from '../src/rules/index.js';
import type { SeverityLevel } from '../src/types/index.js';

describe('Utils', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toHaveLength(8);
    expect(id2).toHaveLength(8);
    expect(id1).not.toBe(id2);
  });

  it('should detect framework from package.json', () => {
    expect(detectFramework({ dependencies: { react: '^18.0.0' } })).toBe('react');
    expect(detectFramework({ dependencies: { vue: '^3.0.0' } })).toBe('vue');
    expect(detectFramework({ dependencies: { next: '^13.0.0' } })).toBe('next');
    expect(detectFramework({ dependencies: { svelte: '^4.0.0' } })).toBe('svelte');
    expect(detectFramework({})).toBe('unknown');
    expect(detectFramework(null)).toBe('unknown');
  });

  it('should get severity levels', () => {
    expect(getSeverityLevel('error')).toBe(3);
    expect(getSeverityLevel('warning')).toBe(2);
    expect(getSeverityLevel('suggestion')).toBe(1);
  });

  it('should filter issues by severity', () => {
    const issues: Array<{ severity: SeverityLevel }> = [
      { severity: 'error' },
      { severity: 'warning' },
      { severity: 'suggestion' }
    ];

    expect(filterBySeverity(issues, 'error')).toHaveLength(1);
    expect(filterBySeverity(issues, 'warning')).toHaveLength(2);
    expect(filterBySeverity(issues, 'suggestion')).toHaveLength(3);
  });

  it('should calculate file hash', () => {
    const hash1 = calculateFileHash('hello world');
    const hash2 = calculateFileHash('hello world');
    const hash3 = calculateFileHash('different');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});

describe('Git Utils', () => {
  it('should detect git repository', () => {
    // This project is a git repo
    expect(isGitRepo('/Users/half/Desktop/frontend-ai-review')).toBe(true);
    // This should not be a git repo
    expect(isGitRepo('/tmp')).toBe(false);
  });

  it('should get changed files', () => {
    const files = getChangedFiles('/Users/half/Desktop/frontend-ai-review');
    // Should return some files (at least the ones we modified)
    expect(Array.isArray(files)).toBe(true);
  });
});

describe('Rules', () => {
  it('should have all rules loaded', () => {
    expect(allRules.length).toBeGreaterThan(40);
  });

  it('should filter rules by category', () => {
    const reactRules = getRulesByCategory('react');
    expect(reactRules.length).toBeGreaterThan(0);
    expect(reactRules.every(r => r.category === 'react')).toBe(true);
  });

  it('should filter rules by options', () => {
    const filtered = filterRules(allRules, {
      category: ['security'],
      severity: 'error'
    });

    expect(filtered.every(r => r.category === 'security')).toBe(true);
  });

  it('should have all required properties on rules', () => {
    for (const rule of allRules) {
      expect(rule.id).toBeDefined();
      expect(rule.category).toBeDefined();
      expect(rule.severity).toBeDefined();
      expect(rule.name).toBeDefined();
      expect(rule.description).toBeDefined();
      expect(rule.detect).toBeDefined();
      expect(typeof rule.detect).toBe('function');
    }
  });
});

describe('Security Rules', () => {
  it('should detect hardcoded credentials', () => {
    const securityRules = getRulesByCategory('security');
    const hardcodedRule = securityRules.find(r => r.id === 'security/hardcoded-credentials');

    expect(hardcodedRule).toBeDefined();

    const code = 'const apiKey = "sk-1234567890";';
    const issues = hardcodedRule!.detect(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect eval usage', () => {
    const securityRules = getRulesByCategory('security');
    const evalRule = securityRules.find(r => r.id === 'security/eval');

    const code = 'eval("alert(1)")';
    const issues = evalRule!.detect(code, 'test.js');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect SQL injection', () => {
    const securityRules = getRulesByCategory('security');
    const sqlRule = securityRules.find(r => r.id === 'security/sql-injection');

    const code = 'const query = "SELECT * FROM users WHERE id = " + userId;';
    const issues = sqlRule!.detect(code, 'test.js');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect SQL injection with template literal', () => {
    const securityRules = getRulesByCategory('security');
    const sqlRule = securityRules.find(r => r.id === 'security/sql-injection');

    const code = 'const query = `SELECT * FROM users WHERE id = ${userId}`;';
    const issues = sqlRule!.detect(code, 'test.js');

    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('React Rules', () => {
  it('should detect missing key in list', () => {
    const reactRules = getRulesByCategory('react');
    const keyRule = reactRules.find(r => r.id === 'react/no-array-index-key');

    const code = '{items.map((item, index) => <div key={index}>...</div>)}';
    const issues = keyRule!.detect(code, 'test.tsx');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect button without type', () => {
    const reactRules = getRulesByCategory('react');
    const buttonRule = reactRules.find(r => r.id === 'react/button-has-type');

    const code = '<button>Click me</button>';
    const issues = buttonRule!.detect(code, 'test.tsx');

    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('Vue Rules', () => {
  it('should detect v-for without key', () => {
    const vueRules = getRulesByCategory('vue');
    const keyRule = vueRules.find(r => r.id === 'vue/v-for-key');

    const code = '<div v-for="item in items">...</div>';
    const issues = keyRule!.detect(code, 'test.vue');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect v-for with v-if', () => {
    const vueRules = getRulesByCategory('vue');
    const vifRule = vueRules.find(r => r.id === 'vue/v-if-with-v-for');

    const code = '<div v-for="item in items" v-if="item.show">...</div>';
    const issues = vifRule!.detect(code, 'test.vue');

    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('Performance Rules', () => {
  it('should detect console.log', () => {
    const perfRules = getRulesByCategory('performance');
    const consoleRule = perfRules.find(r => r.id === 'perf/console-log');

    const code = 'console.log("debug")';
    const issues = consoleRule!.detect(code, 'test.js');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fixable).toBe(true);
  });
});

describe('Best Practice Rules', () => {
  it('should detect import order issues', () => {
    const bpRules = getRulesByCategory('best-practice');
    const importRule = bpRules.find(r => r.id === 'best-practice/import-order');

    const code = `import React from 'react';
import './style.css';
import utils from './utils';`;
    const issues = importRule!.detect(code, 'test.ts');

    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect empty catch block', () => {
    const bpRules = getRulesByCategory('best-practice');
    const catchRule = bpRules.find(r => r.id === 'best-practice/empty-catch');

    const code = 'try { doSomething(); } catch {}';
    const issues = catchRule!.detect(code, 'test.js');

    expect(issues.length).toBeGreaterThan(0);
  });
});
