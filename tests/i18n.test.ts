/**
 * i18n Tests
 */

import { describe, it, expect } from 'vitest';
import {
  t,
  setLocale,
  getLocale,
  formatMessage,
  interpolate
} from '../src/i18n/index.js';

describe('i18n', () => {
  describe('t', () => {
    it('should translate key', () => {
      const translated = t('hello');
      expect(translated).toBeDefined();
    });
  });

  describe('setLocale', () => {
    it('should set locale', () => {
      setLocale('zh');
      expect(getLocale()).toBe('zh');
      setLocale('en');
    });
  });

  describe('getLocale', () => {
    it('should get current locale', () => {
      const locale = getLocale();
      expect(locale).toBeDefined();
    });
  });

  describe('formatMessage', () => {
    it('should format message with params', () => {
      const msg = formatMessage('hello {{name}}', { name: 'World' });
      expect(msg).toContain('World');
    });
  });

  describe('interpolate', () => {
    it('should interpolate variables', () => {
      const result = interpolate('Count: {{count}}', { count: 5 });
      expect(result).toContain('5');
    });
  });
});
