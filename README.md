# Frontend AI Review 中文文档

> AI 驱动的代码审查工具

[English](./README.en.md) | 中文

## 什么是 Frontend AI Review？

Frontend AI Review 是一个专为前端开发者设计的 AI 代码审查工具。它能够：
- 自动检查代码问题
- 支持 React、Vue、TypeScript 等多种框架
- 提供 AI 智能分析
- 自动修复可修复的问题

## 核心特性

| 特性 | 说明 |
|------|------|
| 🔍 多框架支持 | React、Vue、Next.js、Nuxt.js、Svelte |
| ⚡ 高性能 | 并行分析、增量缓存 |
| 📊 47+ 规则 | React、Vue、TypeScript，安全，性能等 |
| 🤖 多 AI 支持 | OpenAI、Anthropic Claude、Google Gemini 等 |
| 🔧 自动修复 | 自动修复可修复的问题 |
| 🚀 CI/CD 集成 | 支持 GitHub Actions、GitLab CI、Jenkins |

## 安装

```bash
# 全局安装
npm install -g frontend-ai-review

# 或使用 npx
npx frontend-ai-review /path/to/project
```

## 快速开始

```bash
# 基本用法
fair .

# 检查特定目录
fair ./src

# 输出 JSON 格式
fair . -o json

# 启用 AI 分析
fair . --ai

# 自动修复
fair . --fix
```

## CLI 选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `-o, --output` | 输出格式 | `-o json` |
| `-s, --severity` | 最小严重程度 | `-s warning` |
| `-c, --category` | 检查分类 | `-c react,vue` |
| `-e, --exclude` | 排除文件 | `-e "node_modules/**"` |
| `-r, --rules` | 指定规则 | `-r react/exhaustive-deps` |
| `--ai` | 启用 AI 分析 | `--ai` |
| `--ai-model` | AI 模型 | `--ai-model gpt-4` |
| `--ai-provider` | AI 提供商 | `--ai-provider anthropic` |
| `--fix` | 自动修复 | `--fix` |
| `--parallel` | 并行分析 | `--parallel` |
| `--cache` | 启用缓存 | `--cache` |
| `--git` | Git 增量分析 | `--git --staged` |

## 配置文件

在项目根目录创建 `.fairrc.json`：

```json
{
  "severity": "warning",
  "output": "text",
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**"
  ],
  "category": [
    "react",
    "vue",
    "typescript",
    "security"
  ],
  "ai": false,
  "aiModel": "gpt-4o-mini",
  "aiProvider": "openai"
}
```

## AI 分析

### OpenAI (默认)

```bash
export OPENAI_API_KEY=sk-your-key
fair . --ai
```

### Anthropic Claude

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
fair . --ai --ai-provider anthropic
```

### Google Gemini

```bash
export GEMINI_API_KEY=your-gemini-key
fair . --ai --ai-provider gemini
```

## 自动修复

使用 `--fix` 自动修复可修复的问题：

```bash
fair . --fix
```

支持的自动修复规则：

| 规则 | 修复方式 |
|------|----------|
| `perf/console-log` | 删除 console.log 行 |
| `best-practice/no-var` | 将 var 替换为 let |
| `best-practice/prefer-const` | 将 let 替换为 const |
| `vue/v-for-key` | 添加 key |

## 性能优化

```bash
# 并行分析 - 推荐大型项目使用
fair . --parallel

# 增量缓存 - 跳过未更改的文件
fair . --cache

# Git 增量分析
fair . --git --staged
fair . --git --branch main
```

## CI/CD 集成

### GitHub Actions

```yaml
name: Frontend AI Code Review
on: [push, pull_request]
jobs:
  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run Code Review
        run: npx fair . -s warning -o github
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### GitLab CI

```yaml
code-review:
  image: node:20
  script:
    - npm install -g frontend-ai-review
    - fair . -o json > gl-ai-report.json
  artifacts:
    reports:
      codequality: gl-ai-report.json
```

## 规则说明

### React 规则

| 规则 | 说明 | 严重程度 |
|------|------|----------|
| `react/exhaustive-deps` | useEffect 依赖数组不完整 | warning |
| `react/no-array-index-key` | 不应使用数组索引作为 key | warning |
| `react/hooks-rule-of-hooks` | Hook 必须在组件顶层调用 | error |
| `react/no-direct-mutation-state` | 不能直接修改 state | error |
| `react/button-has-type` | button 必须有 type 属性 | suggestion |
| `react/prop-types` | 应定义 PropTypes | warning |

### Vue 规则

| 规则 | 说明 | 严重程度 |
|------|------|----------|
| `vue/v-for-key` | v-for 必须有 key | warning |
| `vue/v-if-with-v-for` | 不应同时使用 v-if 和 v-for | error |

### TypeScript 规则

| 规则 | 说明 | 严重程度 |
|------|------|----------|
| `typescript/no-any` | 不应使用 any 类型 | warning |
| `typescript/no-unused-vars` | 不应有未使用变量 | warning |

### 安全规则

| 规则 | 说明 | 严重程度 |
|------|------|----------|
| `security/eval` | 不应使用 eval() | error |
| `security/hardcoded-credentials` | 不应硬编码凭证 | error |
| `security/sql-injection` | SQL 注入风险 | error |
| `security/command-injection` | 命令注入风险 | error |

### 性能规则

| 规则 | 说明 | 严重程度 |
|------|------|----------|
| `perf/console-log` | 应删除 console.log | suggestion |
| `perf/anonymous-function` | 避免匿名函数 | suggestion |

### 最佳实践规则

| 规则 | 说明 | 严重程度 |
|------|------|----------|
| `best-practice/no-magic-numbers` | 不应使用魔法数字 | suggestion |
| `best-practice/import-order` | import 顺序不规范 | suggestion |

## 常见问题

### 1. 安装失败

**问题**: 提示权限错误

**解决**:
```bash
sudo npm install -g frontend-ai-review
```

### 2. 找不到 `fair` 命令

**解决**:
```bash
npm list -g frontend-ai-review
npx fair .
```

### 3. AI 分析失败

**问题**: AI 分析不工作

**解决**:
1. 确保已设置 API Key
2. 检查网络连接
3. 尝试不使用 AI: `fair .` (不带 `--ai`)

### 4. 检查大项目很慢

**解决**:
```bash
fair . --parallel
fair . --cache
fair . --git --staged
```

## 开发指南

```bash
# 克隆项目
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 相关链接

- [GitHub](https://github.com/Yulingsong/frontend-ai-review)
- [问题反馈](https://github.com/Yulingsong/frontend-ai-review/issues)

---

## 更多文档

- [配置详解](./docs/config.md) - 配置文件选项说明
- [规则详解](./docs/rules.md) - 所有规则详细说明
- [API 参考](./docs/api.md) - 编程接口
- [常见问题](./docs/faq.md) - FAQ
- [使用教程](./docs/tutorial.md) - 详细教程
