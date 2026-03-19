# Frontend AI Review 🤖

<p align="center">
  <img src="./logo.svg" alt="Frontend AI Review Logo" width="128" height="128">
</p>

<p align="center">
  <a href="https://github.com/Yulingsong/frontend-ai-review/stargazers">
    <img src="https://img.shields.io/github/stars/Yulingsong/frontend-ai-review" alt="Stars">
  </a>
  <a href="https://github.com/Yulingsong/frontend-ai-review/network">
    <img src="https://img.shields.io/github/forks/Yulingsong/frontend-ai-review" alt="Forks">
  </a>
  <img src="https://img.shields.io/badge/version-2.3.3-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/node/v/frontend-ai-review-orange" alt="Node">
</p>

<p align="center">
  <strong>AI 驱动的代码审查工具 | 自动化代码检查</strong>
</p>

<p align="center">
  <a href="https://github.com/Yulingsong/frontend-ai-review/blob/master/README.md">中文</a> •
  <a href="https://github.com/Yulingsong/frontend-ai-review/blob/master/README.en.md">English</a>
</p>

---

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 🔍 **多框架支持** | React、Vue、Next.js、Nuxt.js、Svelte |
| ⚡ **高性能** | 并行分析、增量缓存 |
| 📊 **47+ 规则** | React、Vue、TypeScript、安全、性能 |
| 🤖 **AI 分析** | OpenAI、Claude、Gemini |
| 🔧 **自动修复** | 自动修复可修复的问题 |
| 🚀 **CI/CD 集成** | GitHub Actions、GitLab CI |

---

## 🚀 快速开始

```bash
# 安装
npm install -g frontend-ai-review

# 基本审查
fair .

# 启用 AI 分析
fair . --ai

# 自动修复
fair . --fix
```

---

## 📖 示例

### 输入代码

```tsx
// src/LoginForm.tsx
import React, { useState } from 'react';

export function LoginForm() {
  const [username, setUsername] = useState('');

  React.useEffect(() => {
    console.log('username:', username);
  }, []); // ❌ 缺少依赖

  const apiKey = 'sk-1234567890'; // ❌ 硬编码凭证

  return (
    <form>
      <input value={username} onChange={e => setUsername(e.target.value)} />
    </form>
  );
}
```

### 审查结果

```
🤖 Frontend AI Review v2.3.3

📁 src/LoginForm.tsx
────────────────────────────────────────────────────────────
🟡 react/exhaustive-deps line 8
   useEffect dependency array may be incomplete

🔴 security/hardcoded-credentials line 11
   Hardcoded credentials detected

🔵 perf/console-log line 9 💡 自动修复

📊 Summary
────────────────────────────────────────────────────────────
Issues: 3 | Errors: 1 | Warnings: 1 | Suggestions: 1
```

---

## 📦 安装

```bash
# 全局安装
npm install -g frontend-ai-review

# 或使用 npx
npx frontend-ai-review /path/to/project
```

---

## ⚙️ 配置

创建 `.fairrc.json`：

```json
{
  "severity": "warning",
  "category": ["react", "vue", "typescript", "security"],
  "ai": true,
  "aiModel": "gpt-4o-mini"
}
```

---

## 🤖 AI 提供商

```bash
# OpenAI
export OPENAI_API_KEY=sk-your-key
fair . --ai

# Anthropic
fair . --ai --ai-provider anthropic

# Gemini
fair . --ai --ai-provider gemini
```

---

## 📊 支持的规则

### React (10+)
- `react/exhaustive-deps` - useEffect 依赖
- `react/no-array-index-key` - 数组 key
- `react/hooks-rule-of-hooks` - Hook 规则

### Vue (6+)
- `vue/v-for-key` - v-for key
- `vue/v-if-with-v-for` - v-if/v-for

### TypeScript (6+)
- `typescript/no-any` - any 类型
- `typescript/no-unused-vars` - 未使用变量

### 安全 (8+)
- `security/eval` - eval 使用
- `security/hardcoded-credentials` - 硬编码凭证
- `security/sql-injection` - SQL 注入

### 性能 (7+)
- `perf/console-log` - console.log
- `perf/anonymous-function` - 匿名函数

---

## 📚 文档

- [配置详解](./docs/config.md) - 配置文件选项
- [规则详解](./docs/rules.md) - 所有规则说明
- [API 参考](./docs/api.zh-CN.md) - 编程接口
- [常见问题](./docs/faq.md) - FAQ
- [使用教程](./docs/tutorial.md) - 详细教程
- [故障排除](./TROUBLESHOOTING.md) - 问题排查
- [贡献指南](./CONTRIBUTING.md) - 如何贡献
- [行为准则](./CODE_OF_CONDUCT.md) - 社区准则

---

## 🛠️ 开发

```bash
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review
npm install
npm run dev
```

---

## ⭐ 贡献

欢迎 Star 和 PR！

---

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Yulingsong">@Yulingsong</a>
</p>
