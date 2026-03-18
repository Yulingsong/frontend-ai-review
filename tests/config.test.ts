/**
 * Config Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  loadConfig,
  mergeConfig,
  validateConfig,
  getConfigPath,
  resolveConfigPath
} from '../src/config/index.js';

describe('Config', () => {
  const testConfigPath = '/tmp/fair-test-config.json';

  beforeEach(() => {
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  describe('loadConfig', () => {
    it('should load config from file', () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({
        rules: ['no-console']
      }));

      const config = loadConfig(testConfigPath);
      expect(config.rules).toContain('no-console');
    });

    it('should return default config for missing file', () => {
      const config = loadConfig('/non/existent/path.json');
      expect(config).toBeDefined();
    });
  });

  describe('mergeConfig', () => {
    it('should merge configs', () => {
      const base = { rules: ['no-console'], severity: 'error' };
      const override = { rules: ['no-debugger'] };

      const merged = mergeConfig(base, override);
      expect(merged.rules).toContain('no-console');
      expect(merged.rules).toContain('no-debugger');
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config = { rules: ['no-console'] };
      const errors = validateConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate required fields', () => {
      const config = {};
      const errors = validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('getConfigPath', () => {
    it('should return default path', () => {
      const configPath = getConfigPath();
      expect(configPath).toContain('.fairrc');
    });
  });

  describe('resolveConfigPath', () => {
    it('should resolve relative path', () => {
      const resolved = resolveConfigPath('./config.json', '/project');
      expect(resolved).toBe('/project/config.json');
    });

    it('should resolve absolute path', () => {
      const resolved = resolveConfigPath('/abs/config.json', '/project');
      expect(resolved).toBe('/abs/config.json');
    });
  });
});
