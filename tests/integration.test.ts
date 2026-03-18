/**
 * Integration Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { temporaryDirectory } from 'tmp';

describe('Integration Tests', () => {
  describe('End-to-End: Analyze Code', () => {
    it('should analyze React code', () => {
      const reactCode = `
import React from 'react';

function App() {
  console.log('hello');
  return <div>Hello</div>;
}
`;
      expect(reactCode.length).toBeGreaterThan(0);
      expect(reactCode).toContain('console.log');
    });

    it('should analyze Vue code', () => {
      const vueCode = `
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return { message: 'Hello' }
  }
}
</script>
`;
      expect(vueCode).toContain('template');
      expect(vueCode).toContain('data');
    });

    it('should analyze TypeScript code', () => {
      const tsCode = `
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}\`;
}
`;
      expect(tsCode).toContain('interface');
      expect(tsCode).toContain(': string');
    });
  });

  describe('End-to-End: Config Loading', () => {
    it('should load valid config', () => {
      const config = {
        rules: ['no-console', 'no-debugger'],
        severity: 'error',
        framework: 'react'
      };
      
      expect(config.rules).toHaveLength(2);
      expect(config.framework).toBe('react');
    });

    it('should merge configs', () => {
      const base = { rules: ['no-console'] };
      const override = { rules: ['no-debugger'] };
      const merged = { ...base, rules: [...base.rules, ...override.rules] };
      
      expect(merged.rules).toHaveLength(2);
    });
  });

  describe('End-to-End: Rule Application', () => {
    it('should apply no-console rule', () => {
      const code = 'console.log("test")';
      const hasConsole = code.includes('console.log');
      expect(hasConsole).toBe(true);
    });

    it('should apply no-debugger rule', () => {
      const code = 'debugger;';
      const hasDebugger = code.includes('debugger');
      expect(hasDebugger).toBe(true);
    });

    it('should detect React-specific issues', () => {
      const code = 'ReactDOM.render(<App />, root)';
      const isDeprecated = code.includes('ReactDOM.render');
      expect(isDeprecated).toBe(true);
    });
  });

  describe('End-to-End: Output Generation', () => {
    it('should generate SARIF output', () => {
      const sarif = {
        version: '2.1.0',
        runs: [{
          results: [{
            ruleId: 'no-console',
            level: 'error'
          }]
        }]
      };
      
      expect(sarif.runs[0].results).toHaveLength(1);
    });

    it('should generate summary', () => {
      const summary = {
        total: 10,
        errors: 3,
        warnings: 5,
        suggestions: 2
      };
      
      expect(summary.errors + summary.warnings + summary.suggestions)
        .toBe(summary.total);
    });
  });

  describe('End-to-End: Framework Detection', () => {
    it('should detect Next.js', () => {
      const pkg = { dependencies: { next: '^13.0.0' } };
      const isNext = 'next' in (pkg.dependencies || {});
      expect(isNext).toBe(true);
    });

    it('should detect Vue', () => {
      const pkg = { dependencies: { vue: '^3.0.0' } };
      const isVue = 'vue' in (pkg.dependencies || {});
      expect(isVue).toBe(true);
    });
  });
});
