# Frontend AI Review 配置详解

## 配置文件

Frontend AI Review 支持多种配置方式:

1. `.fairrc.json` - 项目根目录
2. `.fairrc` - 项目根目录
3. `fair.config.json` - 项目根目录
4. `~/.fairrc` - 用户主目录

## 配置示例

```json
{
  "severity": "warning",
  "output": "text",
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    ".nuxt/**",
    "coverage/**"
  ],
  "include": [
    "src/**/*.{ts,tsx,vue,js,jsx}"
  ],
  "category": [
    "react",
    "vue",
    "typescript",
    "security",
    "performance",
    "best-practice"
  ],
  "rules": {
    "react/exhaustive-deps": "error",
    "react/no-array-index-key": "warn",
    "typescript/no-any": "off"
  },
  "ai": false,
  "aiModel": "gpt-4o-mini",
  "aiProvider": "openai",
  "fix": false,
  "parallel": false,
  "cache": false,
  "git": false,
  "interactive": false
}
```

## 配置选项详解

### severity

| 值 | 描述 |
|----|------|
| `error` | 只显示错误 |
| `warning` | 显示错误和警告 |
| `suggestion` | 显示所有问题 |

**默认值**: `warning`

```json
{
  "severity": "warning"
}
```

### output

| 值 | 描述 |
|----|------|
| `text` | 文本格式输出 |
| `json` | JSON 格式输出 |
| `github` | GitHub Checks 格式 |
| `sarif` | SARIF 格式 |

**默认值**: `text`

```json
{
  "output": "json"
}
```

### exclude

排除的文件和目录模式 (glob patterns)。

**默认值**: `["node_modules/**", "dist/**", "build/**"]`

```json
{
  "exclude": [
    "node_modules/**",
    "dist/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### include

包含的文件模式。

**默认值**: 所有支持的源文件

```json
{
  "include": [
    "src/**/*.{ts,tsx,js,jsx,vue}"
  ]
}
```

### category

要检查的规则分类。

| 分类 | 描述 |
|------|------|
| `react` | React 规则 |
| `vue` | Vue 规则 |
| `typescript` | TypeScript 规则 |
| `security` | 安全规则 |
| `performance` | 性能规则 |
| `best-practice` | 最佳实践规则 |

**默认值**: 所有分类

```json
{
  "category": ["react", "vue", "typescript"]
}
```

### rules

自定义规则配置。

```json
{
  "rules": {
    "react/exhaustive-deps": "error",
    "react/no-array-index-key": "warn",
    "typescript/no-any": "off",
    "security/eval": "error"
  }
}
```

规则级别:
- `error` - 错误
- `warn` - 警告
- `suggestion` - 建议
- `off` - 关闭

### AI 分析配置

#### ai

是否启用 AI 分析。

**默认值**: `false`

```json
{
  "ai": true
}
```

#### aiModel

AI 模型选择。

**默认值**: `gpt-4o-mini`

支持的模型:
- OpenAI: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`
- Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
- Gemini: `gemini-2.0-flash`, `gemini-2.0-flash-lite`

```json
{
  "aiModel": "claude-3-5-sonnet-20241022"
}
```

#### aiProvider

AI 提供商。

**默认值**: `openai`

支持的提供商:
- `openai` - OpenAI
- `anthropic` - Anthropic Claude
- `gemini` - Google Gemini
- `azure` - Azure OpenAI
- `cohere` - Cohere
- `mistral` - Mistral
- `qwen` - 阿里 Qwen

```json
{
  "aiProvider": "anthropic"
}
```

### fix

是否自动修复可修复的问题。

**默认值**: `false`

```json
{
  "fix": true
}
```

### parallel

是否启用并行分析。

**默认值**: `false`

```json
{
  "parallel": true
}
```

### cache

是否启用增量缓存。

**默认值**: `false`

```json
{
  "cache": true
}
```

### git

是否使用 Git 增量分析。

**默认值**: `false`

```json
{
  "git": true,
  "gitMode": "staged" // staged | branch | since
}
```

### interactive

是否启用交互模式。

**默认值**: `false`

```json
{
  "interactive": true
}
```

## 环境变量

### AI API Keys

```bash
# OpenAI
export OPENAI_API_KEY=sk-xxx

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-xxx

# Google Gemini
export GEMINI_API_KEY=xxx

# Azure OpenAI
export AZURE_OPENAI_API_KEY=xxx
export AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com

# Cohere
export COHERE_API_KEY=xxx

# Mistral
export MISTRAL_API_KEY=xxx

# Qwen
export QWEN_API_KEY=xxx
```

### 其他环境变量

```bash
# 代理设置
export HTTP_PROXY=http://proxy:8080
export HTTPS_PROXY=http://proxy:8080

# 自定义配置路径
export FAIR_CONFIG=/path/to/config.json
```

## 多环境配置

### 项目配置 + 用户配置

项目配置 (`.fairrc.json`) 优先级高于用户配置 (`~/.fairrc`)。

### 环境特定配置

```bash
# 使用指定配置文件
fair . --config production.fairrc.json

# 使用环境变量
FAIR_CONFIG=production.fairrc.json fair .
```

### 合并配置

```json
// .fairrc.json
{
  "extends": "./.fairrc.base.json",
  "severity": "error"
}
```

## CLI 覆盖

所有配置都可以通过 CLI 参数覆盖:

```bash
# 覆盖 severity
fair . -s error

# 覆盖 output
fair . -o json

# 覆盖 category
fair . -c react,vue

# 覆盖 exclude
fair . -e "node_modules/**" -e "dist/**"

# 启用 AI
fair . --ai

# 启用自动修复
fair . --fix

# 启用并行
fair . --parallel
```

## 验证配置

```bash
# 检查配置是否有效
fair config --validate

# 查看当前配置
fair config --show
```

## 常见配置示例

### React 项目

```json
{
  "severity": "warning",
  "category": ["react", "typescript", "security", "performance"],
  "exclude": ["node_modules/**", "dist/**", "build/**", ".next/**"],
  "rules": {
    "react/exhaustive-deps": "error",
    "react/no-array-index-key": "error"
  }
}
```

### Vue 项目

```json
{
  "severity": "warning",
  "category": ["vue", "typescript", "security"],
  "exclude": ["node_modules/**", "dist/**", ".nuxt/**"],
  "rules": {
    "vue/v-for-key": "error",
    "vue/v-if-with-v-for": "error"
  }
}
```

### 严格模式

```json
{
  "severity": "error",
  "category": ["react", "vue", "typescript", "security", "performance", "best-practice"],
  "ai": true,
  "fix": true,
  "rules": {
    "typescript/no-any": "error",
    "perf/console-log": "error"
  }
}
```

### CI/CD 模式

```json
{
  "severity": "warning",
  "output": "github",
  "exclude": ["node_modules/**", "dist/**"],
  "cache": true,
  "parallel": true
}
```
