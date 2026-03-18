/**
 * Types Tests
 */

import { describe, it, expect } from 'vitest';
import type { 
  Issue,
  Rule,
  Config,
  SeverityLevel,
  Framework,
  ReviewResult
} from '../src/types/index.js';

describe('Types', () => {
  describe('Issue', () => {
    it('should have required properties', () => {
      const issue: Issue = {
        id: '1',
        ruleId: 'no-console',
        message: 'Unexpected console',
        severity: 'error',
        file: 'src/app.ts',
        line: 10,
        column: 5
      };
      
      expect(issue.id).toBe('1');
      expect(issue.ruleId).toBe('no-console');
      expect(issue.severity).toBe('error');
    });
  });

  describe('SeverityLevel', () => {
    it('should accept valid severity levels', () => {
      const error: SeverityLevel = 'error';
      const warning: SeverityLevel = 'warning';
      const suggestion: SeverityLevel = 'suggestion';
      
      expect(error).toBe('error');
      expect(warning).toBe('warning');
      expect(suggestion).toBe('suggestion');
    });
  });

  describe('Framework', () => {
    it('should accept valid frameworks', () => {
      const react: Framework = 'react';
      const vue: Framework = 'vue';
      const next: Framework = 'next';
      const svelte: Framework = 'svelte';
      
      expect(react).toBe('react');
      expect(vue).toBe('vue');
      expect(next).toBe('next');
      expect(svelte).toBe('svelte');
    });
  });

  describe('ReviewResult', () => {
    it('should have required properties', () => {
      const result: ReviewResult = {
        issues: [],
        summary: {
          total: 0,
          errors: 0,
          warnings: 0,
          suggestions: 0
        },
        timestamp: new Date().toISOString()
      };
      
      expect(result.issues).toEqual([]);
      expect(result.summary.total).toBe(0);
    });
  });
});
