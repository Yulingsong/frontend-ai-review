/**
 * Interactive Module Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as readline from 'readline';
import { 
  prompt,
  select,
  confirm,
  multiline,
  editor
} from '../src/interactive.js';

describe('Interactive', () => {
  let mockRl: any;

  beforeEach(() => {
    mockRl = {
      question: vi.fn(),
      close: vi.fn()
    };
  });

  describe('prompt', () => {
    it('should create prompt configuration', () => {
      const p = prompt('Enter name:', { default: 'Anonymous' });
      expect(p.question).toBe('Enter name:');
      expect(p.options?.default).toBe('Anonymous');
    });

    it('should validate input', () => {
      const p = prompt('Enter age:', { 
        validate: (v: string) => parseInt(v) > 0 
      });
      expect(p.validate).toBeDefined();
    });
  });

  describe('select', () => {
    it('should create select configuration', () => {
      const s = select('Choose framework:', [
        { label: 'React', value: 'react' },
        { label: 'Vue', value: 'vue' }
      ]);
      expect(s.question).toBe('Choose framework:');
      expect(s.options).toHaveLength(2);
    });

    it('should support multiple selection', () => {
      const s = select('Choose colors:', [], { multiple: true });
      expect(s.multiple).toBe(true);
    });
  });

  describe('confirm', () => {
    it('should create confirm configuration', () => {
      const c = confirm('Continue?', { default: true });
      expect(c.question).toBe('Continue?');
      expect(c.defaultValue).toBe(true);
    });
  });

  describe('multiline', () => {
    it('should create multiline configuration', () => {
      const m = multiline('Enter description:');
      expect(m.question).toBe('Enter description:');
    });
  });

  describe('editor', () => {
    it('should create editor configuration', () => {
      const e = editor('Edit message:', { 
        language: 'markdown' 
      });
      expect(e.language).toBe('markdown');
    });
  });
});
