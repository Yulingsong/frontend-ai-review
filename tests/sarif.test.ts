/**
 * SARIF Tests
 */

import { describe, it, expect } from 'vitest';
import {
  toSarif,
  fromSarif,
  validateSarif,
  getSarifSchema
} from '../src/sarif.js';
import type { Issue } from '../src/types/index.js';

describe('SARIF', () => {
  describe('toSarif', () => {
    it('should convert issues to SARIF', () => {
      const issues: Issue[] = [
        {
          id: '1',
          ruleId: 'no-console',
          message: 'Unexpected console',
          severity: 'error',
          file: 'src/app.ts',
          line: 10,
          column: 5,
          code: 'console.log()',
          suggestion: 'Use logger instead'
        }
      ];

      const sarif = toSarif(issues);
      expect(sarif.version).toBe('2.1.0');
      expect(sarif.runs).toHaveLength(1);
      expect(sarif.runs[0].results).toHaveLength(1);
    });
  });

  describe('fromSarif', () => {
    it('should convert SARIF to issues', () => {
      const sarif = {
        version: '2.1.0',
        runs: [{
          results: [{
            ruleId: 'no-console',
            message: { text: 'Unexpected console' },
            level: 'error',
            locations: [{
              physicalLocation: {
                artifactLocation: { uri: 'src/app.ts' },
                region: { startLine: 10, startColumn: 5 }
              }
            }]
          }]
        }]
      };

      const issues = fromSarif(sarif as any);
      expect(issues).toHaveLength(1);
      expect(issues[0].ruleId).toBe('no-console');
    });
  });

  describe('validateSarif', () => {
    it('should validate valid SARIF', () => {
      const validSarif = {
        version: '2.1.0',
        runs: [{ results: [] }]
      };
      expect(validateSarif(validSarif as any)).toBe(true);
    });

    it('should reject invalid SARIF', () => {
      expect(validateSarif({} as any)).toBe(false);
    });
  });

  describe('getSarifSchema', () => {
    it('should return schema URL', () => {
      const schema = getSarifSchema();
      expect(schema).toContain('sarif');
    });
  });
});
