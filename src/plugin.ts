// Plugin system for Frontend AI Review

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import type { Rule, Issue } from './types/index.js';

/**
 * Plugin interface
 */
export interface FairPlugin {
  name: string;
  version: string;
  description?: string;
  rules?: PluginRule[];
  hooks?: PluginHooks;
  config?: Record<string, unknown>;
}

/**
 * Plugin rule interface
 */
export interface PluginRule {
  id: string;
  category: string;
  severity: 'error' | 'warning' | 'suggestion';
  name: string;
  description: string;
  fixable?: boolean;
  detect: (content: string, filePath: string) => Issue[];
}

/**
 * Plugin hooks
 */
export interface PluginHooks {
  beforeAnalyze?: (files: string[]) => string[] | Promise<string[]>;
  afterAnalyze?: (results: { file: string; issues: Issue[] }[]) => void | Promise<void>;
  onIssue?: (issue: Issue, file: string) => Issue | Promise<Issue>;
  beforeFix?: (file: string, issues: Issue[]) => Issue[] | Promise<Issue[]>;
  afterFix?: (file: string, fixedIssues: Issue[]) => void | Promise<void>;
}

/**
 * Plugin manager
 */
export class PluginManager {
  private plugins: Map<string, FairPlugin> = new Map();
  private pluginPaths: string[] = [];
  
  constructor() {
    // Default plugin directories
    this.pluginPaths = [
      path.join(process.cwd(), 'fair-plugins'),
      path.join(process.env.HOME || '', '.fair', 'plugins'),
    ];
  }
  
  /**
   * Add plugin directory
   */
  addPluginPath(pluginPath: string): void {
    if (!this.pluginPaths.includes(pluginPath)) {
      this.pluginPaths.push(pluginPath);
    }
  }
  
  /**
   * Load plugin from file
   */
  async loadPlugin(pluginPath: string): Promise<FairPlugin | null> {
    try {
      // Try different extensions
      const extensions = ['.js', '.ts', '.mjs', '.cjs'];
      
      for (const ext of extensions) {
        const fullPath = pluginPath + ext;
        
        if (fs.existsSync(fullPath)) {
          const module = await import(fullPath);
          const plugin: FairPlugin = module.default || module;
          
          if (!plugin.name) {
            console.warn(pc.yellow(`⚠️ Plugin at ${fullPath} missing name, skipping`));
            return null;
          }
          
          this.plugins.set(plugin.name, plugin);
          console.log(pc.green(`✅ Loaded plugin: ${plugin.name} v${plugin.version || '?'}`));
          return plugin;
        }
      }
      
      return null;
    } catch (e) {
      console.error(pc.red(`❌ Failed to load plugin from ${pluginPath}:`), e);
      return null;
    }
  }
  
  /**
   * Load all plugins from plugin directories
   */
  async loadAllPlugins(): Promise<void> {
    for (const pluginDir of this.pluginPaths) {
      if (!fs.existsSync(pluginDir)) {
        continue;
      }
      
      const files = fs.readdirSync(pluginDir);
      
      for (const file of files) {
        const fullPath = path.join(pluginDir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.mjs'))) {
          await this.loadPlugin(path.join(pluginDir, path.basename(file, path.extname(file))));
        }
      }
    }
  }
  
  /**
   * Load plugin by name
   */
  async loadPluginByName(name: string): Promise<FairPlugin | null> {
    for (const pluginDir of this.pluginPaths) {
      const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
      
      for (const file of files) {
        if (file.toLowerCase().includes(name.toLowerCase())) {
          return this.loadPlugin(path.join(pluginDir, path.basename(file, path.extname(file))));
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get all loaded plugins
   */
  getPlugins(): Map<string, FairPlugin> {
    return this.plugins;
  }
  
  /**
   * Get plugin by name
   */
  getPlugin(name: string): FairPlugin | undefined {
    return this.plugins.get(name);
  }
  
  /**
   * Get all rules from plugins
   */
  getPluginRules(): Rule[] {
    const rules: Rule[] = [];
    
    for (const plugin of this.plugins.values()) {
      if (plugin.rules) {
        for (const rule of plugin.rules) {
          rules.push({
            id: `plugin/${plugin.name}/${rule.id}`,
            category: `plugin-${plugin.name}`,
            severity: rule.severity,
            name: rule.name,
            description: rule.description,
            fixable: rule.fixable,
            detect: rule.detect
          });
        }
      }
    }
    
    return rules;
  }
  
  /**
   * Get hook by name
   */
  getHook(hookName: keyof PluginHooks): PluginHooks[keyof PluginHooks][] {
    const hooks: Array<PluginHooks[keyof PluginHooks]> = [];
    
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        hooks.push(plugin.hooks[hookName]!);
      }
    }
    
    return hooks;
  }
  
  /**
   * Execute hook
   */
  async executeHook<T>(hookName: keyof PluginHooks, ...args: unknown[]): Promise<T | undefined> {
    const hooks = this.getHook(hookName);
    
    if (hooks.length === 0) {
      return undefined;
    }
    
    let result: T | undefined;
    
    for (const hook of hooks) {
      // @ts-ignore - dynamic function call
      result = await hook(...args);
    }
    
    return result;
  }
  
  /**
   * List loaded plugins
   */
  listPlugins(): void {
    console.log(pc.bold('\n📦 Loaded Plugins:'));
    
    if (this.plugins.size === 0) {
      console.log(pc.gray('  No plugins loaded'));
      return;
    }
    
    for (const [name, plugin] of this.plugins) {
      console.log(`  ${pc.cyan(name)} v${plugin.version || '?'}`);
      if (plugin.description) {
        console.log(pc.dim(`    ${plugin.description}`));
      }
      if (plugin.rules) {
        console.log(pc.dim(`    ${plugin.rules.length} rules`));
      }
    }
  }
}

/**
 * Create a plugin template
 */
export function createPluginTemplate(): string {
  return `/**
 * Frontend AI Review Plugin
 */

export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom rules plugin',
  
  // Custom rules
  rules: [
    {
      id: 'my-custom-rule',
      category: 'custom',
      severity: 'warning',
      name: 'my-custom-rule',
      description: 'Description of my custom rule',
      detect: (content, filePath) => {
        const issues = [];
        
        // Your detection logic here
        
        return issues;
      }
    }
  ],
  
  // Hooks
  hooks: {
    beforeAnalyze: async (files) => {
      // Modify files before analysis
      return files;
    },
    
    afterAnalyze: async (results) => {
      // Do something after analysis
    },
    
    onIssue: async (issue, file) => {
      // Modify or filter issues
      return issue;
    }
  },
  
  // Default config
  config: {
    // Your plugin config
  }
};
`;
}

export default PluginManager;
