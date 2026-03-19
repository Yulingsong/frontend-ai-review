# Frontend AI Review (English)

> AI-powered code review tool for frontend developers

[中文](./README.md) | English

## What is Frontend AI Review?

Frontend AI Review is an AI-powered code review tool designed for frontend developers. It can:
- Automatically detect code issues
- Support React, Vue, TypeScript and other frameworks
- Provide AI-powered analysis
- Auto-fix fixable issues

## Features

| Feature | Description |
|---------|-------------|
| 🔍 Multi-Framework | React, Vue, Next.js, Nuxt.js, Svelte |
| ⚡ High Performance | Parallel analysis, incremental caching |
| 📊 47+ Rules | React, Vue, TypeScript, Security, Performance |
| 🤖 Multi AI | OpenAI, Anthropic Claude, Google Gemini |
| 🔧 Auto-Fix | Automatically fix fixable issues |
| 🚀 CI/CD | GitHub Actions, GitLab CI, Jenkins |

## Installation

```bash
# Global install
npm install -g frontend-ai-review

# Or use npx
npx frontend-ai-review /path/to/project
```

## Quick Start

```bash
# Basic usage
fair .

# Output JSON
fair . -o json

# Enable AI analysis
fair . --ai

# Auto-fix
fair . --fix
```

## CLI Options

| Option | Description |
|--------|-------------|
| `-o, --output` | Output format |
| `-s, --severity` | Minimum severity |
| `-c, --category` | Check categories |
| `-e, --exclude` | Exclude files |
| `-r, --rules` | Specific rules |
| `--ai` | Enable AI analysis |
| `--ai-model` | AI model |
| `--fix` | Auto-fix issues |
| `--parallel` | Parallel analysis |
| `--cache` | Enable caching |

## Configuration

Create `.fairrc.json`:

```json
{
  "severity": "warning",
  "category": ["react", "vue", "typescript", "security"],
  "ai": false
}
```

## Links

- [GitHub](https://github.com/Yulingsong/frontend-ai-review)
- [Documentation](./docs/README.zh-CN.md)
