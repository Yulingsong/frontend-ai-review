# Frontend AI Review API 参考

## 模块导入

```typescript
import { 
  analyze,
  fixer,
  toSarif,
  fromSarif,
  loadConfig,
  getRules,
  registerRule 
} from 'frontend-ai-review';
```

## analyze()

分析代码并返回问题列表。

```typescript
const result = await analyze({
  code: 'const a = 1;',
  framework: 'react'
});

console.log(result.issues);
// [{ ruleId: 'no-console', message: '...', severity: 'warning' }]
```

**参数:**
```typescript
interface AnalyzeOptions {
  code: string;
  framework: 'react' | 'vue' | 'next' | 'nuxt' | 'svelte';
  config?: Config;
}
```

**返回:**
```typescript
interface AnalyzeResult {
  issues: Issue[];
  file: string;
  timestamp: number;
}
```

## fixer.applyFix()

应用修复。

```typescript
const fixed = await fixer.applyFix(code, fix);
```

## toSarif() / fromSarif()

SARIF 格式转换。

```typescript
const sarif = toSarif(issues);
const issues = fromSarif(sarif);
```

## loadConfig()

加载配置文件。

```typescript
const config = loadConfig('./.fairrc');
```

## getRules()

获取所有规则。

```typescript
const rules = getRules();
console.log(rules.length); // 47+
```

## registerRule()

注册自定义规则。

```typescript
import { Rule } from 'frontend-ai-review/rules';

const myRule: Rule = {
  id: 'my/custom-rule',
  category: 'best-practice',
  severity: 'warning',
  message: '自定义规则提示',
  
  create(context) {
    return {
      // AST visitor
    };
  }
};

registerRule(myRule);
```

## 类型定义

### Issue

```typescript
interface Issue {
  id: string;
  ruleId: string;
  message: string;
  severity: 'error' | 'warning' | 'suggestion';
  file: string;
  line?: number;
  column?: number;
  fix?: Fix;
}
```

### Fix

```typescript
interface Fix {
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  text: string;
}
```

### Rule

```typescript
interface Rule {
  id: string;
  category: string;
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  create(context: RuleContext): RuleVisitor;
}
```

### Config

```typescript
interface Config {
  severity: 'error' | 'warning' | 'suggestion';
  output: 'text' | 'json' | 'github' | 'sarif';
  exclude: string[];
  category: string[];
  rules: Record<string, 'error' | 'warning' | 'suggestion' | 'off'>;
  ai: boolean;
  aiModel: string;
  aiProvider: string;
}
```

## CLI 用法

```bash
# 基本审查
fair <path>

# 输出 JSON
fair <path> -o json

# 启用 AI
fair <path> --ai

# 自动修复
fair <path> --fix

# 指定规则
fair <path> -r react/exhaustive-deps

# 指定分类
fair <path> -c react,vue
```

### 选项

| 选项 | 说明 |
|------|------|
| `-o, --output` | 输出格式 |
| `-s, --severity` | 最小严重程度 |
| `-c, --category` | 检查分类 |
| `-e, --exclude` | 排除文件 |
| `-r, --rules` | 指定规则 |
| `--ai` | 启用 AI 分析 |
| `--fix` | 自动修复 |
| `--parallel` | 并行分析 |
| `--cache` | 启用缓存 |
| `--git` | Git 增量 |
