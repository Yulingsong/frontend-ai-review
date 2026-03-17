# Frontend AI Review 🤖

<p align="center">
  <img src="https://img.shields.io/badge/version-2.2.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18-orange" alt="Node Version">
  <a href="https://www.npmjs.com/package/frontend-ai-review">
    <img src="https://img.shields.io/npm/dm/frontend-ai-review" alt="NPM Downloads">
  </a>
</p>

<p align="center">
  <strong>AI-powered code review tool for frontend developers</strong>
</p>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔍 **Multi-Framework** | React, Vue, Next.js, Nuxt.js, Svelte |
| ⚡ **High Performance** | Parallel analysis, incremental caching |
| 📊 **47+ Rules** | React, Vue, TypeScript, Security, Performance, Best Practices |
| 🤖 **Multi AI Support** | OpenAI, Anthropic, Google Gemini, Azure, Cohere, Mistral, Qwen |
| 🔧 **Auto-Fix** | Automatically fix fixable issues |
| ⚙️ **CLI Options** | Flexible configuration |
| 📄 **Config File** | Supports .fairrc.json |
| 📑 **Multiple Outputs** | Text/JSON/GitHub/SARIF format |
| 🚀 **CI/CD Integration** | GitHub Actions, GitLab CI, Jenkins |
| 🧪 **Test Support** | Built-in unit tests |
| 🌍 **i18n** | English, Chinese, Japanese, Spanish, French, German |

---

## 🚀 Quick Start

### Installation

```bash
# Install globally with npm
npm install -g frontend-ai-review

# Or use npx
npx frontend-ai-review /path/to/project
```

### Local Usage

```bash
# Clone the project
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review

# Install dependencies
npm install

# Build
npm run build

# Run
node dist/index.js /path/to/project
```

---

## 📖 CLI Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `-o, --output` | Output format | text | `-o json` |
| `-s, --severity` | Minimum severity | suggestion | `-s warning` |
| `-c, --category` | Categories | all | `-c react,vue` |
| `-e, --exclude` | Exclude files | - | `-e "node_modules/**"` |
| `-r, --rules` | Specific rules | all | `-r react/exhaustive-deps` |
| `--ai` | Enable AI analysis | false | `--ai` |
| `--ai-model` | AI model | gpt-4o-mini | `--ai-model gpt-4` |
| `--ai-provider` | AI provider | openai | `--ai-provider anthropic` |
| `--fix` | Auto-fix issues | false | `--fix` |
| `--parallel` | Parallel analysis | false | `--parallel` |
| `--cache` | Enable caching | false | `--cache` |
| `--git` | Git incremental | false | `--git --staged` |
| `-i, --interactive` | Interactive mode | false | `-i` |
| `--init` | Create config | - | `--init` |
| `-h` | Show help | - | `-h` |

---

## 📄 Configuration File

Create `.fairrc.json` in your project root:

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

## 🤖 AI Analysis

Supports multiple AI providers:

```bash
# OpenAI (default)
export OPENAI_API_KEY=sk-your-key
fair /path/to/project --ai

# Anthropic Claude
export ANTHROPIC_API_KEY=sk-ant-your-key
fair /path/to/project --ai --ai-provider anthropic

# Google Gemini
export GEMINI_API_KEY=your-gemini-key
fair /path/to/project --ai --ai-provider gemini

# Azure OpenAI
export AZURE_OPENAI_API_KEY=your-key
fair /path/to/project --ai --ai-provider azure --azure-endpoint https://your-resource.openai.azure.com

# Cohere
export COHERE_API_KEY=your-key
fair /path/to/project --ai --ai-provider cohere

# Mistral
export MISTRAL_API_KEY=your-key
fair /path/to/project --ai --ai-provider mistral

# Alibaba Qwen
export QWEN_API_KEY=your-key
fair /path/to/project --ai --ai-provider qwen
```

---

## 🔧 Auto-Fix

Automatically fix fixable issues:

```bash
fair /path/to/project --fix
```

### Supported Rules

| Rule | Fix |
|------|-----|
| `perf/console-log` | Delete console.log line |
| `best-practice/no-var` | Replace var with let |
| `best-practice/prefer-const` | Replace let with const |

---

## ⚡ Performance

```bash
# Parallel analysis - recommended for large projects
fair /path/to/project --parallel

# Incremental caching - skip unchanged files
fair /path/to/project --cache

# Git-based incremental analysis
fair /path/to/project --git --staged
fair /path/to/project --git --branch main
fair /path/to/project --git --since HEAD~3
```

---

## 🚀 CI/CD Integration

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

See [.gitlab-ci/.gitlab-ci.yml](.gitlab-ci/.gitlab-ci.yml)

### Jenkins

See [.jenkins/Jenkinsfile](.jenkins/Jenkinsfile)

---

## 📊 Output Example

```
🤖 Frontend AI Review v2.2.0
──────────────────────────────────────────────────
Framework: react
Severity: suggestion
Rules: 47 enabled

Found 25 files to analyze

📁 src/App.tsx
────────────────────────────────────────────────────────────
🟡 react/exhaustive-deps line 23
   useEffect dependency array may be incomplete

🔴 security/hardcoded-credentials line 5
   Hardcoded credentials detected

🔵 perf/console-log line 10 💡 Fixable: Delete this line

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

## 📦 Built-in Rules (47+)

### 🔴 React (10)

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `react/exhaustive-deps` | useEffect dependency incomplete | warning |
| `react/no-array-index-key` | No array index as key | warning |
| `react/hooks-rule-of-hooks` | Hooks must be at top level | error |
| `react/no-direct-mutation-state` | No direct state mutation | error |
| `react/button-has-type` | Button type required | suggestion |
| `react/prop-types` | Prop types required | warning |

### 💚 Vue (6)

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `vue/v-for-key` | v-for needs key | warning |
| `vue/v-if-with-v-for` | v-if with v-for | error |

### 💙 TypeScript (6)

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `typescript/no-any` | No any type | warning |
| `typescript/no-unused-vars` | No unused vars | warning |

### 🔒 Security (8)

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `security/eval` | No eval | error |
| `security/hardcoded-credentials` | No credentials | error |
| `security/sql-injection` | SQL injection | error |
| `security/command-injection` | Command injection | error |

### ⚡ Performance (7)

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `perf/console-log` | Remove console.log | suggestion |
| `perf/anonymous-function` | No anonymous functions | suggestion |

### 📝 Best Practice (10)

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `best-practice/no-magic-numbers` | No magic numbers | suggestion |
| `best-practice/import-order` | Import order | suggestion |

---

## 🛠️ Development

```bash
# Clone
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review

# Install
npm install

# Dev mode
npm run dev

# Build
npm run build

# Test
npm run test
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📝 License

MIT License

---

## 🏆 Credits

- [Babel](https://babeljs.io/) - JavaScript compiler
- [Picocolors](https://github.com/alexeyraspopov/picocolors) - Terminal colors
- [Glob](https://github.com/isaacs/node-glob) - File matching
