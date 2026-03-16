# Frontend AI Review 🤖

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-blue" alt="Version">
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
| ⚡ **高性能** | 递归遍历项目，支持大规模分析 |
| 📊 **规则丰富** | 覆盖 React、TypeScript、性能、安全、最佳实践 |
| 🤖 **AI 分析** | 支持 OpenAI API 深度分析 |
| 🔧 **自动修复** | 支持自动修复部分问题 |
| ⚙️ **CLI 参数** | 灵活配置 |
| 📄 **配置文件** | 支持 .fairrc.json |
| 📑 **多种输出** | JSON/GitHub 格式，支持程序化集成 |
| 🚀 **GitHub Action** | 支持 CI/CD 集成 |

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
| `--fix` | 自动修复 | false | `--fix` |
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
  ]
}
```

---

## 🤖 AI 分析

使用 OpenAI API 进行深度代码分析：

```bash
# 设置环境变量
export OPENAI_API_KEY=sk-your-key-here

# 启用 AI 分析
fair /path/to/project --ai

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
🤖 Frontend AI Review v1.2.0
──────────────────────────────────────────────────
Framework: react
Severity: suggestion
Rules: 16 enabled

Found 25 files to analyze

📁 src/App.tsx
────────────────────────────────────────────────────────────
🟡 react/exhaustive-deps line 23
   useEffect 依赖数组可能不完整

🔴 security/hardcoded-credentials line 5
   检测到硬编码凭证 'password'

📊 Summary
────────────────────────────────────────────────────────────
Files: 25 | 有问题: 8
   Errors: 2
   Warnings: 8
   Suggestions: 5

📈 By Category
   security: 2
   react: 3
   best-practice: 3
```

---

## 📦 内置规则 (16+)

### 🔴 React 规则

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `react/exhaustive-deps` | useEffect 依赖数组不完整 | warning |
| `react/no-array-index-key` | 禁止使用数组索引作为 key | warning |
| `react/hooks-rule-of-hooks` | Hooks 必须在顶层调用 | error |
| `react/no-direct-mutation-state` | 禁止直接修改 state | error |
| `react/button-has-type` | button 应指定 type | suggestion |

### 💚 Vue 规则

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `vue/no-ref-as-reactivity` | ref.value 响应式问题 | warning |
| `vue/require-default-prop` | Props 应有默认值 | warning |

### 💙 TypeScript 规则

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `typescript/no-any` | 禁止使用 any 类型 | warning |
| `typescript/no-unused-vars` | 禁止未使用变量 | warning |
| `typescript/explicit-return` | 建议显式返回类型 | suggestion |

### 🔒 安全规则

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `security/eval` | 禁止使用 eval | error |
| `security/hardcoded-credentials` | 禁止硬编码凭证 | error |
| `security/inner-html` | innerHTML XSS 风险 | error |

### ⚡ 性能规则

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `perf/console-log` | 建议移除 console.log | suggestion |
| `perf/anonymous-function` | 避免 JSX 匿名函数 | suggestion |
| `perf/array-push-in-loop` | 循环中频繁 push | warning |

### 📝 最佳实践

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| `best-practice/no-magic-numbers` | 禁止使用魔法数字 | suggestion |
| `best-practice/empty-catch` | 空的 catch 块 | warning |
| `best-practice/no-var` | 使用 const/let | warning |
| `best-practice/prefer-const` | 优先使用 const | suggestion |
| `best-practice/require-await` | 异步错误处理 | suggestion |

---

## 📁 项目结构

```
frontend-ai-review/
├── src/
│   ├── index.ts          # 主程序
│   └── types.ts          # 类型定义
├── .github/
│   └── workflows/        # GitHub Actions
│       └── code-review.yml
├── examples/
│   └── .fairrc.example  # 配置示例
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

# 本地测试
node dist/index.js /path/to/test-project
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
