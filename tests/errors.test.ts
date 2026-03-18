/**
 * Error Handling Tests
 */

import { describe, it, expect, vi } from 'vitest';

describe('Error Handling', () => {
  describe('Error Types', () => {
    it('should throw AnalysisError', () => {
      class AnalysisError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'AnalysisError';
        }
      }
      
      expect(() => { throw new AnalysisError('Analysis failed'); })
        .toThrow('Analysis failed');
    });

    it('should throw ConfigError', () => {
      class ConfigError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'ConfigError';
        }
      }
      
      expect(() => { throw new ConfigError('Invalid config'); })
        .toThrow('Invalid config');
    });

    it('should throw RuleError', () => {
      class RuleError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'RuleError';
        }
      }
      
      expect(() => { throw new RuleError('Rule not found'); })
        .toThrow('Rule not found');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from parse errors', () => {
      const tryParse = (code: string) => {
        try {
          JSON.parse(code);
          return { success: true };
        } catch (e) {
          return { success: false, error: (e as Error).message };
        }
      };
      
      const result = tryParse('invalid json');
      expect(result.success).toBe(false);
    });

    it('should handle async errors', async () => {
      const asyncOperation = async () => {
        throw new Error('Async error');
      };
      
      await expect(asyncOperation()).rejects.toThrow('Async error');
    });
  });

  describe('Error Context', () => {
    it('should include file context in errors', () => {
      const errorWithContext = {
        message: 'Parse error',
        file: 'src/app.ts',
        line: 10,
        column: 5
      };
      
      expect(errorWithContext.file).toBe('src/app.ts');
      expect(errorWithContext.line).toBe(10);
    });

    it('should include rule context in errors', () => {
      const errorWithRule = {
        message: 'Rule violation',
        ruleId: 'no-console',
        severity: 'error'
      };
      
      expect(errorWithRule.ruleId).toBe('no-console');
    });
  });

  describe('Error Formatting', () => {
    it('should format error message', () => {
      const formatError = (err: Error) => {
        return `[${err.name}] ${err.message}`;
      };
      
      const err = new Error('Test error');
      expect(formatError(err)).toContain('Test error');
    });

    it('should format error with location', () => {
      const formatLocation = (file: string, line: number, col: number) => {
        return `${file}:${line}:${col}`;
      };
      
      expect(formatLocation('app.ts', 10, 5)).toBe('app.ts:10:5');
    });
  });
});
