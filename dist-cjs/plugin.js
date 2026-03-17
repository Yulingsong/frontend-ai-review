"use strict";
// Plugin system for Frontend AI Review
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
exports.createPluginTemplate = createPluginTemplate;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const picocolors_1 = __importDefault(require("picocolors"));
/**
 * Plugin manager
 */
class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.pluginPaths = [];
        // Default plugin directories
        this.pluginPaths = [
            path.join(process.cwd(), 'fair-plugins'),
            path.join(process.env.HOME || '', '.fair', 'plugins'),
        ];
    }
    /**
     * Add plugin directory
     */
    addPluginPath(pluginPath) {
        if (!this.pluginPaths.includes(pluginPath)) {
            this.pluginPaths.push(pluginPath);
        }
    }
    /**
     * Load plugin from file
     */
    async loadPlugin(pluginPath) {
        try {
            // Try different extensions
            const extensions = ['.js', '.ts', '.mjs', '.cjs'];
            for (const ext of extensions) {
                const fullPath = pluginPath + ext;
                if (fs.existsSync(fullPath)) {
                    const module = await Promise.resolve(`${fullPath}`).then(s => __importStar(require(s)));
                    const plugin = module.default || module;
                    if (!plugin.name) {
                        console.warn(picocolors_1.default.yellow(`⚠️ Plugin at ${fullPath} missing name, skipping`));
                        return null;
                    }
                    this.plugins.set(plugin.name, plugin);
                    console.log(picocolors_1.default.green(`✅ Loaded plugin: ${plugin.name} v${plugin.version || '?'}`));
                    return plugin;
                }
            }
            return null;
        }
        catch (e) {
            console.error(picocolors_1.default.red(`❌ Failed to load plugin from ${pluginPath}:`), e);
            return null;
        }
    }
    /**
     * Load all plugins from plugin directories
     */
    async loadAllPlugins() {
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
    async loadPluginByName(name) {
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
    getPlugins() {
        return this.plugins;
    }
    /**
     * Get plugin by name
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }
    /**
     * Get all rules from plugins
     */
    getPluginRules() {
        const rules = [];
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
    getHook(hookName) {
        const hooks = [];
        for (const plugin of this.plugins.values()) {
            if (plugin.hooks && plugin.hooks[hookName]) {
                hooks.push(plugin.hooks[hookName]);
            }
        }
        return hooks;
    }
    /**
     * Execute hook
     */
    async executeHook(hookName, ...args) {
        const hooks = this.getHook(hookName);
        if (hooks.length === 0) {
            return undefined;
        }
        let result;
        for (const hook of hooks) {
            // @ts-ignore - dynamic function call
            result = await hook(...args);
        }
        return result;
    }
    /**
     * List loaded plugins
     */
    listPlugins() {
        console.log(picocolors_1.default.bold('\n📦 Loaded Plugins:'));
        if (this.plugins.size === 0) {
            console.log(picocolors_1.default.gray('  No plugins loaded'));
            return;
        }
        for (const [name, plugin] of this.plugins) {
            console.log(`  ${picocolors_1.default.cyan(name)} v${plugin.version || '?'}`);
            if (plugin.description) {
                console.log(picocolors_1.default.dim(`    ${plugin.description}`));
            }
            if (plugin.rules) {
                console.log(picocolors_1.default.dim(`    ${plugin.rules.length} rules`));
            }
        }
    }
}
exports.PluginManager = PluginManager;
/**
 * Create a plugin template
 */
function createPluginTemplate() {
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
exports.default = PluginManager;
//# sourceMappingURL=plugin.js.map