# Frontend AI Review 🤖

<p align="center">
  <img src="https://img.shields.io/badge/version-2.1.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18-orange" alt="Node Version">
</p>

<p align="center">
  <strong>一个专门为前端开发者设计的 AI 代码审查工具</strong>
</p>

---

## 📖 背景

随着前端项目的复杂度不断增加，代码质量变得越来越重要。传统的人工 Code Review 耗时且容易遗漏问题，而通用的代码检查工具往往不够贴合前端开发者的实际需求。

**Frontend AI Review** 应运而生 —— 专为前端开发者打造的智能代码审查工具。

---

## ✨ 特性

| 特性 | 描述 |
|------|------|
| 🔍 **多框架支持** | React、Vue、Next.js、Nuxt.js、Svelte |
| ⚡ **高性能** | 支持并行分析、增量缓存 |
| 📊 **40+ 规则** | 覆盖 React、Vue、TypeScript、安全、性能、最佳实践 |
| 🤖 **多 AI 支持** | OpenAI、Anthropic、Google Gemini、阿里 Qwen |
| 🔧 **自动修复** | 支持自动修复部分问题 |
| ⚙️ **CLI 参数** | 灵活配置 |
| 📄 **配置文件** | 支持 .fairrc.json |
| 📑 **多种输出** | JSON/GitHub 格式，支持程序化集成 |
| 🚀 **GitHub Action** | 支持 CI/CD 集成 |
| 🧪 **测试支持** | 内置单元测试 |

---

## 🚀 快速开始

### 安装

```bash
# 使用 npm 全局安装
npm install -g frontend-ai-review

# 或使用 npx
npx frontend-ai-review /path/to/project
```

### 本地运行

```bash
# 克隆项目
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review

# 安装依赖
npm install

# 构建
npm run build

# 使用
node dist/index.js /path/to/project
```

---

## 📖 CLI 参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `-o, --output` | 输出格式 | text | `-o json` |
| `-s, --severity` | 最低严重程度 | suggestion | `-s warning` |
| `-c, --category` | 指定类别 | 全部 | `-c react,vue` |
| `-e, --exclude` | 排除文件 | - | `-e "node_modules/**"` |
| `-r, --rules` | 指定规则 | 全部 | `-r react/exhaustive-deps` |
| `--ai` | 启用 AI 分析 | false | `--ai` |
| `--ai-model` | AI 模型 | gpt-4o-mini | `--ai-model gpt-4` |
| `--ai-provider` | AI 提供商 | openai | `--ai-provider anthropic` |
| `--fix` | 自动修复 | false | `--fix` |
| `--parallel` | 并行分析 | false | `--parallel` |
| `--cache` | 启用缓存 | false | `--cache` |
| `-i, --interactive` | 交互式模式 | false | `-i` |
| `--init` | 创建配置文件 | - | `--init` |
| `-h` | 显示帮助 | - | `-h` |

---

## 📄 配置文件

在项目根目录创建 `.fairrc.json`:

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

---

## 🤖 AI 分析

支持多种 AI 提供商：

```bash
# OpenAI (默认)
export OPENAI_API_KEY=sk-your-key
fair /path/to/project --ai

# Anthropic Claude
export ANTHROPIC_API_KEY=sk-ant-your-key
fair /path/to/project --ai --ai-provider anthropic

# Google Gemini
export GEMINI_API_KEY=your-gemini-key
fair /path/to/project --ai --ai-provider gemini

# 阿里云 Qwen
export QWEN_API_KEY=your-qwen-key
fair /path/to/project --ai --ai-provider qwen

# 使用更强大的模型
fair /path/to/project --ai --ai-model gpt-4
```

---

## 🔧 自动修复

自动修复可修复的问题：

```bash
fair /path/to/project --fix
```

### 支持自动修复的规则

| 规则 | 修复方式 |
|------|----------|
| `perf/console-log` | 删除 console.log 行 |
| `best-practice/no-var` | 将 var 替换为 let |
| `best-practice/prefer-const` | 将 let 替换为 const |
| `typescript/no-unused-vars` | 删除未使用变量 |

---

## ⚡ 性能优化

```bash
# 并行分析 - 大项目推荐使用
fair /path/to/project --parallel

# 增量缓存 - 跳过未更改的文件
fair /path/to/project --cache

# 组合使用
fair /path/to/project --parallel --cache
```

---

## 🚀 GitHub Action

在项目中创建 `.github/workflows/code-review.yml`:

```yaml
name: Frontend AI Code Review

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run Code Review
        run: |
          npx fair . -s warning -o github
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Add annotations
        uses: actions/github-script@v7
        with:
          script: |
            const output = process.env.GITHUB_OUTPUT;
            // 查看注释输出
```

---

## 📊 输出示例

```
🤖 Frontend AI Review v2.1.0
──────────────────────────────────────────────────
Framework: react
Severity: suggestion
Output: text
Rules: 42 enabled
AI: openai (gpt-4o-mini)

Found 25 files to analyze

📁 src/App.tsx
────────────────────────────────────────────────────────────
🟡 react/exhaustive-deps line 23
   useEffect 依赖数组可能不完整

🔴 security/hardcoded-credentials line 5
   检测到硬编码凭证 'password'

🔵 perf/console-log line 10 💡 可修复: 删除此行

📊 Summary
────────────────────────────────────────────────────────────
Files: 25 | Analyzed: 25 | Issues: 8
   Errors: 2
   Warnings: 8
   Suggestions: 5

📈 By Category
   security: 2
   react: 3
   best-practice: 3
```

---

## 📦 内置规则 (40+)

### 🔴 React 规则 (8)

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `react/exhaustive-deps` | useEffect 依赖数组不完整 | warning |
| `react/no-array-index-key` | 禁止使用数组索引作为 key | warning |
| `react/hooks-rule-of-hooks` | Hooks 必须在顶层调用 | error |
| `react/no-direct-mutation-state` | 禁止直接修改 state | error |
| `react/button-has-type` | button 应指定 type | suggestion |
| `react/iframe-missing-title` | iframe 缺少 title | warning |
| `react/img-missing-alt` | img 缺少 alt | warning |
| `react/use-async-callback` | 异步回调建议用 useCallback | suggestion |

### 💚 Vue 规则 (5)

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `vue/no-ref-as-reactivity` | ref.value 响应式问题 | warning |
| `vue/require-default-prop` | Props 应有默认值 | warning |
| `vue/v-for-key` | v-for 需要 key | warning |
| `vue/no-multiple-objects-in-data` | data 应返回函数 | warning |
| `vue/no-mutating-props` | 禁止修改 props | error |

### 💙 TypeScript 规则 (6)

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `typescript/no-any` | 禁止使用 any 类型 | warning |
| `typescript/no-unused-vars` | 禁止未使用变量 | warning |
| `typescript/explicit-return` | 建议显式返回类型 | suggestion |
| `typescript/await-promise` | await 只能用于 Promise | error |
| `typescript/no-implicit-any-catch` | catch 参数应指定类型 | warning |

### 🔒 安全规则 (8)

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `security/eval` | 禁止使用 eval | error |
| `security/hardcoded-credentials` | 禁止硬编码凭证 | error |
| `security/inner-html` | innerHTML XSS 风险 | error |
| `security/sql-injection` | SQL 注入风险 | error |
| `security/command-injection` | 命令注入风险 | error |
| `security/weak-crypto` | 弱加密算法 | warning |
| `security/insecure-random` | 不安全随机数 | warning |
| `security/cookie-no-secure` | Cookie 缺少 Secure | warning |

### ⚡ 性能规则 (7)

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `perf/console-log` | 建议移除 console.log | suggestion |
| `perf/anonymous-function` | 避免 JSX 匿名函数 | suggestion |
| `perf/array-push-in-loop` | 循环中频繁 push | warning |
| `perf/object-assign` | 可用展开语法替代 | suggestion |
| `perf/dup-array-methods` | 避免重复遍历 | warning |
| `perf/react-memo` | 建议使用 React.memo | suggestion |
| `perf/list-without-key` | 列表缺少稳定 key | warning |

### 📝 最佳实践 (10)

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `best-practice/no-magic-numbers` | 禁止使用魔法数字 | suggestion |
| `best-practice/empty-catch` | 空的 catch 块 | warning |
| `best-practice/no-var` | 使用 const/let | warning |
| `best-practice/prefer-const` | 优先使用 const | suggestion |
| `best-practice/require-await` | 异步错误处理 | suggestion |
| `best-practice/no-nested-callbacks` | 避免回调地狱 | warning |
| `best-practice/error-throw` | 应抛出 Error 对象 | warning |
| `best-practice/import-order` | 导入顺序建议 | suggestion |
| `best-practice/completed-promises` | 不必要的 Promise | warning |
| `best-practice/useless-nullish` | 不必要的 ?? 运算 | suggestion |

---

## 📁 项目结构

```
frontend-ai-review/
├── src/
│   ├── index.ts          # 主程序入口
│   ├── analyzer.ts       # 分析器核心
│   ├── fixer.ts          # 自动修复
│   ├── types/            # 类型定义
│   ├── rules/            # 规则实现
│   │   ├── index.ts      # 规则导出
│   │   ├── react.ts      # React 规则
│   │   ├── vue.ts        # Vue 规则
│   │   ├── typescript.ts # TypeScript 规则
│   │   ├── security.ts   # 安全规则
│   │   ├── performance.ts# 性能规则
│   │   └── best-practice.ts
│   ├── utils/            # 工具函数
│   ├── llm/              # AI 分析
│   └── config/           # 配置处理
├── tests/                # 单元测试
├── examples/             # 配置示例
├── .github/workflows/    # GitHub Actions
├── README.md
├── package.json
└── tsconfig.json
```

---

## 🛠️ 开发

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
npm run test
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

---

## 📝 License

MIT License - 查看 [LICENSE](LICENSE) 了解更多

---

## 🏆 致谢

- [Babel](https://babeljs.io/) - JavaScript 编译器
- [Picocolors](https://github.com/alexeyraspopov/picocolors) - 终端着色
- [Glob](https://github.com/isaacs/node-glob) - 文件匹配
- 所有贡献者 ❤️
