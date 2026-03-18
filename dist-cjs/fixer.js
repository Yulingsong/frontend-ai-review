"use strict";
// Auto Fixer for Frontend AI Review
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
exports.AutoFixer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const picocolors_1 = __importDefault(require("picocolors"));
class AutoFixer {
    constructor(dryRun = false) {
        this.dryRun = dryRun;
    }
    /**
     * Apply fixes to a file
     */
    applyFixes(filePath, issues) {
        const result = {
            file: filePath,
            fixed: 0,
            failed: 0,
            errors: []
        };
        if (!issues.length) {
            return result;
        }
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf-8');
        }
        catch (e) {
            result.errors.push(`Failed to read file: ${e}`);
            return result;
        }
        const originalContent = content;
        // Sort issues by line number (descending) to fix from bottom to top
        // This prevents line number shifts from affecting other fixes
        const sortedIssues = [...issues]
            .filter(i => i.fixable)
            .sort((a, b) => b.location.start.line - a.location.start.line);
        for (const issue of sortedIssues) {
            try {
                content = this.applyFix(content, issue);
                result.fixed++;
            }
            catch (e) {
                result.failed++;
                result.errors.push(`Failed to fix ${issue.ruleId} at line ${issue.location.start.line}: ${e}`);
            }
        }
        // Write changes if not dry run
        if (!this.dryRun && content !== originalContent) {
            try {
                fs.writeFileSync(filePath, content);
                console.log(picocolors_1.default.green(`✅ Fixed ${result.fixed} issues in ${path.basename(filePath)}`));
            }
            catch (e) {
                result.errors.push(`Failed to write file: ${e}`);
            }
        }
        return result;
    }
    /**
     * Apply a single fix
     */
    applyFix(content, issue) {
        const lines = content.split('\n');
        const lineIndex = issue.location.start.line - 1;
        switch (issue.ruleId) {
            case 'perf/console-log':
                // Remove the console.log line
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    lines.splice(lineIndex, 1);
                }
                break;
            case 'best-practice/no-var':
                // Replace var with let
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    lines[lineIndex] = lines[lineIndex].replace(/\bvar\b/g, 'let');
                }
                break;
            case 'best-practice/prefer-const':
                // Replace let with const
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    lines[lineIndex] = lines[lineIndex].replace(/\blet\b/g, 'const');
                }
                break;
            case 'typescript/no-unused-vars':
                // Remove the unused variable line
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    lines.splice(lineIndex, 1);
                }
                break;
            default:
                // Unknown fixable rule - skip
                break;
        }
        return lines.join('\n');
    }
    /**
     * Fix multiple files
     */
    fixMultiple(files) {
        return files.map(({ file, issues }) => this.applyFixes(file, issues));
    }
    /**
     * Preview fixes without applying
     */
    previewFixes(_filePath, issues) {
        const fixes = [];
        const fixable = issues.filter(i => i.fixable);
        if (fixable.length === 0) {
            return ['No fixable issues'];
        }
        for (const issue of fixable) {
            const action = this.getFixDescription(issue);
            fixes.push(`Line ${issue.location.start.line}: ${issue.ruleId} - ${action}`);
        }
        return fixes;
    }
    getFixDescription(issue) {
        switch (issue.ruleId) {
            case 'perf/console-log':
                return 'Delete console.log line';
            case 'best-practice/no-var':
                return 'Replace var with let';
            case 'best-practice/prefer-const':
                return 'Replace let with const';
            case 'typescript/no-unused-vars':
                return 'Remove unused variable';
            default:
                return issue.fix || 'Apply fix';
        }
    }
}
exports.AutoFixer = AutoFixer;
exports.default = AutoFixer;
//# sourceMappingURL=fixer.js.map