# Frontend AI Review 🤖

一个专门为前端开发者设计的 AI 代码审查工具。

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特性

- 🔍 **多框架支持**: React、Vue、Next.js、Nuxt.js
- ⚡ **高性能**: 递归遍历项目，支持大规模分析
- 📊 **规则丰富**: 覆盖 React、TypeScript、性能、安全、最佳实践
- 🤖 **AI 分析**: 支持 OpenAI API 深度分析
- 🔧 **自动修复**: 支持自动修复部分问题
- ⚙️ **CLI 参数**: 灵活配置
- 📄 **配置文件**: 支持 .fairrc.json
- 📑 **JSON/GitHub 输出**: 支持程序化集成
- 🚀 **GitHub Action**: 支持 CI/CD 集成

## 🚀 快速开始

```bash
# 安装
npm install -g frontend-ai-review

# 使用
fair /path/to/project

# 或本地运行
cd frontend-ai-review
npm run build
node dist/index.js /path/to/project
```

## 📖 CLI 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `-o, --output` | 输出格式 (text/json/github) | `-o json` |
| `-s, --severity` | 最低严重程度 | `-s warning` |
| `-c, --category` | 指定类别 | `-c react,vue` |
| `-e, --exclude` | 排除文件 | `-e "node_modules/**"` |
| `-r, --rules` | 指定规则 | `-r react/exhaustive-deps` |
| `--ai` | 启用 AI 分析 | `--ai` |
| `--ai-model` | AI 模型 | `--ai-model gpt-4` |
| `--fix` | 自动修复 | `--fix` |
| `-h` | 帮助 | `-h` |

## 📄 配置文件

创建 `.fairrc.json`:

```json
{
  "severity": "warning",
  "output": "text",
  "exclude": ["node_modules/**", "dist/**"],
  "category": ["react", "security"]
}
```

## 🤖 AI 分析

```bash
# 需要设置环境变量
export OPENAI_API_KEY=sk-...

# 启用 AI 分析
fair --ai
fair --ai --ai-model gpt-4
```

## 🔧 自动修复

```bash
# 自动修复可修复的问题
fair --fix
```

可自动修复的规则:
- `perf/console-log` - 删除 console.log
- `best-practice/no-var` - var → let

## 🚀 GitHub Action

创建 `.github/workflows/code-review.yml`:

```yaml
name: Frontend AI Code Review

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run AI Review
        run: |
          npx fair . -s warning -o github
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 📊 输出示例

```
🤖 Frontend AI Review v1.2.0
──────────────────────────────────────────────────
Framework: react
Severity: suggestion
Rules: 16 enabled
AI: Enabled
Auto-fix: Enabled

Found 25 files to analyze

📁 src/App.tsx
────────────────────────────────────────────────────────────
🟡 react/exhaustive-deps line 23
   useEffect 依赖数组可能不完整
   💡 可修复: 添加依赖

📊 Summary
────────────────────────────────────────────────────────────
Files: 25 | 有问题: 8
   Errors: 2
   Warnings: 8
   Suggestions: 5
```

## 📦 内置规则 (16)

### React
- `react/exhaustive-deps` - useEffect 依赖
- `react/no-array-index-key` - 数组索引 key
- `react/hooks-rule-of-hooks` - Hooks 调用规则
- `react/no-direct-mutation-state` - 直接修改 state

### Vue
- `vue/no-ref-as-reactivity` - ref 响应式

### TypeScript
- `typescript/no-any` - any 类型
- `typescript/no-unused-vars` - 未使用变量

### Security
- `security/eval` - eval 使用
- `security/hardcoded-credentials` - 硬编码凭证
- `security/inner-html` - XSS 风险

### Performance
- `perf/console-log` - console.log
- `perf/anonymous-function` - 匿名函数

### Best Practice
- `best-practice/no-magic-numbers` - 魔法数字
- `best-practice/empty-catch` - 空 catch
- `best-practice/no-var` - var 声明
- `best-practice/prefer-const` - const 优先

## 📁 项目结构

```
frontend-ai-review/
├── src/
│   └── index.ts          # 主入口
├── .github/workflows/    # GitHub Action
├── examples/             # 配置示例
├── README.md
└── package.json
```

## 📝 License

MIT
