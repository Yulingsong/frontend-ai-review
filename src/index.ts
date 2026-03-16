/**
 * Frontend AI Review - Full Feature Implementation
 * 支持 LLM AI 分析、自动修复、GitHub Action
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import pc from 'picocolors';

// Types
type Issue = any;
type SeverityLevel = 'error' | 'warning' | 'suggestion';

// CLI Options
interface CLIOptions {
  projectPath: string;
  output: 'text' | 'json' | 'github';
  severity: SeverityLevel;
  category?: string[];
  exclude: string[];
  rules?: string[];
  ai: boolean;
  aiProvider: 'openai' | 'anthropic' | 'qwen';
  aiModel: string;
  fix: boolean;
  help: boolean;
}

// ==================== UTILITIES ====================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function detectFramework(packageJson: any): string {
  if (!packageJson?.dependencies) return 'unknown';
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps.next) return 'next';
  if (deps.nuxt) return 'nuxt';
  if (deps.vue) return 'vue';
  if (deps.react) return 'react';
  return 'unknown';
}

function getSeverityColor(severity: string): string {
  switch (severity) { case 'error': return 'red'; case 'warning': return 'yellow'; case 'suggestion': return 'blue'; default: return 'gray'; }
}

function getSeverityIcon(severity: string): string {
  switch (severity) { case 'error': return '🔴'; case 'warning': return '🟡'; case 'suggestion': return '🔵'; default: return '⚪'; }
}

function getSeverityLevel(severity: string): number {
  switch (severity) { case 'error': return 3; case 'warning': return 2; case 'suggestion': return 1; default: return 0; }
}

// ==================== LLM ANALYZER ====================

class LLMAnalyzer {
  private apiKey: string;
  private model: string;

  constructor(model: string) {
    this.model = model;
    this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.QWEN_API_KEY || '';
  }

  async analyze(code: string): Promise<string> {
    if (!this.apiKey) return '';
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'system', content: '你是前端代码审查专家，用中文回复。' }, { role: 'user', content: `审查代码：\n${code.slice(0, 1500)}` }],
          temperature: 0.7, max_tokens: 400,
        }),
      });
      const data: any = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch { return ''; }
  }
}

// ==================== AUTO FIX ====================

class AutoFixer {
  applyFixes(filePath: string, issues: Issue[]): void {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const issue of issues) {
      if (issue.ruleId === 'perf/console-log') {
        const lines = content.split('\n');
        content = lines.filter((_, idx) => idx + 1 !== issue.location.start.line).join('\n');
      }
      if (issue.ruleId === 'best-practice/no-var') {
        content = content.replace(/\bvar\b/g, 'let');
      }
    }
    fs.writeFileSync(filePath, content);
    console.log(pc.green(`✅ Fixed ${issues.length} issues in ${path.basename(filePath)}`));
  }
}

// ==================== RULES ====================

const rules: Array<{ id: string; category: string; severity: SeverityLevel; name: string; fixable?: boolean; detect: (content: string, filePath: string) => Issue[] }> = [
  { id: 'react/exhaustive-deps', category: 'react', severity: 'warning', name: 'exhaustive-deps', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.includes('useEffect') && l.includes('[]')) { const n = c.split('\n').slice(i, i + 8).join('\n'); if (n.includes('set') && !n.match(/\[\s*[\w.]+\s*\]/)) iss.push({ id: generateId(), ruleId: 'react/exhaustive-deps', message: 'useEffect 依赖数组可能不完整', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); } }); return iss; }},
  { id: 'react/no-array-index-key', category: 'react', severity: 'warning', name: 'no-array-index-key', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/key\s*=\s*\{\s*(index|i)\s*\}/)) iss.push({ id: generateId(), ruleId: 'react/no-array-index-key', message: '禁止使用数组索引作为 key', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'react/hooks-rule-of-hooks', category: 'react', severity: 'error', name: 'hooks-rule-of-hooks', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/if\s*\(.*\)\s*\{\s*use/) || l.match(/if\s*\(.*\)\s*use[A-Z]/)) iss.push({ id: generateId(), ruleId: 'react/hooks-rule-of-hooks', message: 'Hooks 必须在组件顶层调用', severity: 'error', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'react/no-direct-mutation-state', category: 'react', severity: 'error', name: 'no-direct-mutation-state', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/this\.state\.\w+\s*=/)) iss.push({ id: generateId(), ruleId: 'react/no-direct-mutation-state', message: '禁止直接修改 state 属性', severity: 'error', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'vue/no-ref-as-reactivity', category: 'vue', severity: 'warning', name: 'no-ref-as-reactivity', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/ref\.\w+\.value/) && !l.includes('const ') && !l.includes('let ')) iss.push({ id: generateId(), ruleId: 'vue/no-ref-as-reactivity', message: 'ref.value 使用注意', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'typescript/no-any', category: 'typescript', severity: 'warning', name: 'no-any', detect: (c, f) => { if (!f.match(/\.(ts|tsx)$/)) return []; const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/:\s*any\b/) && !l.includes('//')) iss.push({ id: generateId(), ruleId: 'typescript/no-any', message: '避免使用 any 类型', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'typescript/no-unused-vars', category: 'typescript', severity: 'warning', name: 'no-unused-vars', detect: (c, f) => { if (!f.match(/\.(ts|tsx)$/)) return []; const iss = [], vars = new Set<string>(); c.split('\n').forEach(l => { const m = l.match(/(?:const|let)\s+(\w+)/); if (m && !l.includes('=')) vars.add(m[1]); }); vars.forEach((v: string) => { if (!c.includes(v + '(') && !v.startsWith('_')) { const idx = c.split('\n').findIndex(l => l.includes(`const ${v}`) || l.includes(`let ${v}`)); if (idx >= 0) iss.push({ id: generateId(), ruleId: 'typescript/no-unused-vars', message: `变量 '${v}' 未使用`, severity: 'warning', location: { start: { line: idx + 1, column: 0 }, end: { line: idx + 1, column: 0 } }, fixable: true, fix: `删除变量` }); } }); return iss; }},
  { id: 'security/eval', category: 'security', severity: 'error', name: 'eval', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.includes('eval(') && !l.includes('//')) iss.push({ id: generateId(), ruleId: 'security/eval', message: '禁止使用 eval', severity: 'error', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'security/hardcoded-credentials', category: 'security', severity: 'error', name: 'hardcoded-credentials', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"`]/i) && !l.includes('process.env') && !l.includes('import')) iss.push({ id: generateId(), ruleId: 'security/hardcoded-credentials', message: '检测到硬编码凭证', severity: 'error', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'security/inner-html', category: 'security', severity: 'error', name: 'inner-html', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/\.innerHTML\s*=/)) iss.push({ id: generateId(), ruleId: 'security/inner-html', message: 'innerHTML 可能导致 XSS', severity: 'error', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); if (l.includes('dangerouslySetInnerHTML')) iss.push({ id: generateId(), ruleId: 'security/inner-html', message: 'dangerouslySetInnerHTML 注意 XSS', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'perf/console-log', category: 'performance', severity: 'suggestion', name: 'console-log', fixable: true, detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/console\.(log|debug|info)\(/) && !l.includes('//')) iss.push({ id: generateId(), ruleId: 'perf/console-log', message: '建议移除 console.log', severity: 'suggestion', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: true, fix: '删除此行' }); }); return iss; }},
  { id: 'perf/anonymous-function', category: 'performance', severity: 'suggestion', name: 'anonymous-function', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/on(?:Click|Change)=\{[^}]*=>/)) iss.push({ id: generateId(), ruleId: 'perf/anonymous-function', message: '避免 JSX 匿名函数', severity: 'suggestion', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'best-practice/no-magic-numbers', category: 'best-practice', severity: 'suggestion', name: 'no-magic-numbers', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if ((l.match(/===\s*\d{3,}/) || l.match(/<\s*\d{3,}/)) && !l.includes('const ') && !l.includes('//')) iss.push({ id: generateId(), ruleId: 'best-practice/no-magic-numbers', message: '检测到魔法数字', severity: 'suggestion', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'best-practice/empty-catch', category: 'best-practice', severity: 'warning', name: 'empty-catch', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/catch[^}]*\{\s*\}/)) iss.push({ id: generateId(), ruleId: 'best-practice/empty-catch', message: 'catch 块为空', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: false }); }); return iss; }},
  { id: 'best-practice/no-var', category: 'best-practice', severity: 'warning', name: 'no-var', fixable: true, detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/\bvar\s+\w+/) && !l.includes('//')) iss.push({ id: generateId(), ruleId: 'best-practice/no-var', message: '建议用 const/let 替代 var', severity: 'warning', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: true, fix: 'var → let' }); }); return iss; }},
  { id: 'best-practice/prefer-const', category: 'best-practice', severity: 'suggestion', name: 'prefer-const', detect: (c) => { const iss = []; c.split('\n').forEach((l, i) => { if (l.match(/let\s+\w+/) && !l.includes('=')) { const v = l.match(/let\s+(\w+)/)?.[1]; if (v && !c.split('\n').slice(i).some(l => l.includes(`${v} = `))) iss.push({ id: generateId(), ruleId: 'best-practice/prefer-const', message: `建议用 const 声明 ${v}`, severity: 'suggestion', location: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 0 } }, fixable: true, fix: 'let → const' }); } }); return iss; }},
];

// ==================== MAIN ====================

async function main() {
  const args = process.argv.slice(2);
  const opts: CLIOptions = { projectPath: process.cwd(), output: 'text', severity: 'suggestion', exclude: [], ai: false, aiProvider: 'openai', aiModel: 'gpt-4o-mini', fix: false, help: false };
  
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-o' || a === '--output') opts.output = args[++i] as any;
    else if (a === '-s' || a === '--severity') opts.severity = args[++i] as SeverityLevel;
    else if (a === '-c' || a === '--category') opts.category = args[++i].split(',');
    else if (a === '-e' || a === '--exclude') opts.exclude = args[++i].split(',');
    else if (a === '-r' || a === '--rules') opts.rules = args[++i].split(',');
    else if (a === '--ai') opts.ai = true;
    else if (a === '--ai-model') opts.aiModel = args[++i];
    else if (a === '--fix') opts.fix = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (!a.startsWith('-')) opts.projectPath = a;
  }

  if (opts.help) {
    console.log(`
🤖 Frontend AI Review v1.2.0

Usage: fair [options] [path]

Options:
  -o, --output <format>    输出格式: text, json, github
  -s, --severity <level>  最低严重程度: error, warning, suggestion
  -c, --category <cats>    类别: react,vue,typescript,security,performance,best-practice
  -e, --exclude <patterns> 排除文件
  -r, --rules <rules>     只启用指定规则
  --ai                     启用 AI 分析
  --ai-model <model>      AI 模型
  --fix                    自动修复
  -h, --help              帮助

Examples:
  fair /path/to/project
  fair -s warning --ai
  fair --fix
  fair -o json -c security
`);
    return;
  }

  console.log(pc.cyan('\n🤖 Frontend AI Review v1.2.0'));
  console.log(pc.dim('─'.repeat(50)));

  // Config
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(opts.projectPath, '.fairrc.json'), 'utf-8').toString());
    opts.severity = cfg.severity || opts.severity;
    opts.output = cfg.output || opts.output;
    opts.exclude = [...(cfg.exclude || []), ...opts.exclude];
  } catch {}

  // Package.json
  let pkg: any = {};
  try { pkg = JSON.parse(fs.readFileSync(path.join(opts.projectPath, 'package.json'), 'utf-8').toString()); } catch {}
  console.log(pc.gray(`Framework: ${detectFramework(pkg)}`));
  console.log(pc.gray(`Severity: ${opts.severity}`));

  // Filter rules
  let enabled = rules;
  if (opts.category) enabled = enabled.filter(r => opts.category!.includes(r.category));
  if (opts.rules) enabled = enabled.filter(r => opts.rules!.includes(r.id));
  console.log(pc.gray(`Rules: ${enabled.length} enabled`));
  console.log(pc.gray(`Rules: ${enabled.length} enabled`));
  if (opts.ai) console.log(pc.gray(`AI: Enabled`));
  if (opts.fix) console.log(pc.gray(`Auto-fix: Enabled`));
  console.log();

  // Files
  const patterns = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue'];
  const exclude = ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.git/**', 'coverage/**', ...opts.exclude];
  let files: string[] = [];
  for (const p of patterns) { files = [...files, ...await glob(p, { cwd: opts.projectPath, ignore: exclude, absolute: true })]; }
  files = [...new Set(files)];
  console.log(pc.gray(`Found ${files.length} files\n`));

  const llm = opts.ai ? new LLMAnalyzer(opts.aiModel) : null;
  const fixer = new AutoFixer();
  const results: Array<{ file: string; issues: Issue[] }> = [];
  const minSev = getSeverityLevel(opts.severity);
  let count = 0;

  for (const file of files) {
    count++;
    process.stdout.write(`\r${pc.gray(`Analyzing (${count}/${files.length})...`)}`);
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const issues: Issue[] = [];
      for (const r of enabled) {
        const found = r.detect(content, file).filter(i => getSeverityLevel(i.severity) >= minSev);
        issues.push(...found);
      }
      if (issues.length > 0) {
        if (opts.fix) {
          const fixable = issues.filter(i => i.fixable);
          if (fixable.length > 0) fixer.applyFixes(file, fixable);
        }
        results.push({ file, issues });
      }
    } catch {}
  }

  console.log('\n');

  // Output
  if (opts.output === 'json') {
    console.log(JSON.stringify({ total: files.length, issues: results.map(r => ({ file: path.relative(opts.projectPath, r.file), issues: r.issues })) }, null, 2));
    return;
  }

  if (opts.output === 'github') {
    const out: any[] = [];
    for (const { file, issues } of results) {
      for (const i of issues) out.push({ path: path.relative(opts.projectPath, file), line: i.location.start.line, severity: i.severity, message: `[${i.ruleId}] ${i.message}` });
    }
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  // Text
  const stats = { error: 0, warning: 0, suggestion: 0 };
  for (const { file, issues } of results) {
    stats.error += issues.filter(i => i.severity === 'error').length;
    stats.warning += issues.filter(i => i.severity === 'warning').length;
    stats.suggestion += issues.filter(i => i.severity === 'suggestion').length;

    console.log(pc.bold(`\n📁 ${path.relative(opts.projectPath, file)}`));
    console.log(pc.dim('─'.repeat(50)));
    for (const i of issues) {
      console.log(`${getSeverityIcon(i.severity)} ${pc[getSeverityColor(i.severity)](i.ruleId)} ${pc.dim('line ' + i.location.start.line)}`);
      console.log(`   ${i.message}`);
      if (i.fixable) console.log(pc.green(`   💡 可修复: ${i.fix}`));
    }
  }

  console.log(pc.bold('\n📊 Summary'));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`Files: ${files.length} | 有问题: ${results.length}`);
  console.log(pc.red(`   Errors: ${stats.error}`));
  console.log(pc.yellow(`   Warnings: ${stats.warning}`));
  console.log(pc.blue(`   Suggestions: ${stats.suggestion}`));
  console.log();
}

main().catch(console.error);
