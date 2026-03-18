/**
 * Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  detectFramework,
  getSeverityColor,
  getSeverityIcon,
  filterIssues,
  sortIssues,
  groupByFile,
  calculateCoverage
} from '../src/utils/index.js';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toHaveLength(8);
      expect(id1).not.toBe(id2);
    });
  });

  describe('detectFramework', () => {
    it('should detect React', () => {
      const pkg = { dependencies: { react: '^18.0.0' } };
      expect(detectFramework(pkg as any)).toBe('react');
    });

    it('should detect Vue', () => {
      const pkg = { dependencies: { vue: '^3.0.0' } };
      expect(detectFramework(pkg as any)).toBe('vue');
    });

    it('should detect Next.js', () => {
      const pkg = { dependencies: { next: '^13.0.0' } };
      expect(detectFramework(pkg as any)).toBe('next');
    });

    it('should return unknown for empty', () => {
      expect(detectFramework(null)).toBe('unknown');
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors', () => {
      expect(getSeverityColor('error')).toBe('red');
      expect(getSeverityColor('warning')).toBe('yellow');
      expect(getSeverityColor('suggestion')).toBe('blue');
    });
  });

  describe('getSeverityIcon', () => {
    it('should return correct icons', () => {
      expect(getSeverityIcon('error')).toBe('🔴');
      expect(getSeverityIcon('warning')).toBe('🟡');
      expect(getSeverityIcon('suggestion')).toBe('🔵');
    });
  });

  describe('filterIssues', () => {
    it('should filter by severity', () => {
      const issues = [
        { id: '1', severity: 'error' } as any,
        { id: '2', severity: 'warning' } as any,
        { id: '3', severity: 'error' } as any
      ];
      const filtered = filterIssues(issues, { severity: 'error' });
      expect(filtered).toHaveLength(2);
    });
  });

  describe('sortIssues', () => {
    it('should sort by severity', () => {
      const issues = [
        { id: '1', severity: 'warning', line: 10 } as any,
        { id: '2', severity: 'error', line: 5 } as any
      ];
      const sorted = sortIssues(issues, 'severity');
      expect(sorted[0].severity).toBe('error');
    });
  });

  describe('groupByFile', () => {
    it('should group issues by file', () => {
      const issues = [
        { id: '1', file: 'a.ts' } as any,
        { id: '2', file: 'b.ts' } as any,
        { id: '3', file: 'a.ts' } as any
      ];
      const grouped = groupByFile(issues);
      expect(grouped['a.ts']).toHaveLength(2);
      expect(grouped['b.ts']).toHaveLength(1);
    });
  });

  describe('calculateCoverage', () => {
    it('should calculate coverage', () => {
      const issues = [
        { id: '1', severity: 'error' } as any,
        { id: '2', severity: 'warning' } as any,
        { id: '3', severity: 'suggestion' } as any
      ];
      const coverage = calculateCoverage(issues);
      expect(coverage.total).toBe(3);
    });
  });
});
