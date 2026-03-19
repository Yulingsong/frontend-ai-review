# Frontend AI Review 使用教程

## 完整示例：代码审查流程

### 步骤 1: 安装

```bash
npm install -g frontend-ai-review
```

### 步骤 2: 初始化配置

在项目根目录创建 `.fairrc.json`:

```json
{
  "severity": "warning",
  "category": ["react", "typescript", "security"],
  "exclude": ["node_modules/**", "dist/**"]
}
```

### 步骤 3: 运行审查

```bash
# 基本审查
fair .

# 启用 AI 分析
fair . --ai --ai-key $OPENAI_API_KEY
```

### 步骤 4: 查看结果

```
🤖 Frontend AI Review v2.2.0
──────────────────────────────────────────────────
Framework: react
Severity: warning

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
```

### 步骤 5: 自动修复

```bash
# 自动修复可修复的问题
fair . --fix
```

## 实际案例

### 案例 1: React 组件审查

假设有 `src/LoginForm.tsx`:

```tsx
import React, { useState } from 'react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ❌ 问题1: useEffect 依赖不完整
  React.useEffect(() => {
    console.log('username changed:', username);
  }, []); // 缺少 username 依赖

  // ❌ 问题2: 硬编码凭证
  const apiKey = 'sk-1234567890';

  const handleSubmit = () => {
    // ❌ 问题3: console.log 影响性能
    console.log('submitting:', username, password);
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, apiKey })
    });
  };

  return (
    <form>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSubmit}>登录</button>
    </form>
  );
}
```

运行审查:

```bash
fair ./src/LoginForm.tsx
```

输出:

```
📁 src/LoginForm.tsx
────────────────────────────────────────────────────────────
🟡 react/exhaustive-deps line 8
   useEffect dependency array may be incomplete
   Recommendation: Add 'username' to dependency array

🔴 security/hardcoded-credentials line 11
   Hardcoded credentials detected
   Recommendation: Use environment variables

🔵 perf/console-log line 14 💡 Fixable: Delete this line

📊 Summary
────────────────────────────────────────────────────────────
Issues: 3
```

### 案例 2: 自动修复

```bash
fair ./src/LoginForm.tsx --fix
```

修复后的代码:

```tsx
import React, { useState, useEffect } from 'react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ✅ 已修复: 添加了依赖
  useEffect(() => {
    console.log('username changed:', username);
  }, [username]);

  // ✅ 已修复: 移除硬编码
  const apiKey = process.env.API_KEY;

  const handleSubmit = () => {
    // ✅ 已修复: 移除 console.log
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, apiKey })
    });
  };
  // ...
}
```

## 团队协作配置

### 1. 基础配置 (.fairrc.json)

```json
{
  "severity": "warning",
  "output": "text",
  "category": ["react", "vue", "typescript", "security"]
}
```

### 2. 严格模式 (.fairrc.strict.json)

```json
{
  "extends": ".fairrc.json",
  "severity": "error",
  "ai": true,
  "rules": {
    "typescript/no-any": "error",
    "perf/console-log": "error"
  }
}
```

### 3. CI 配置

在 CI 环境中使用:

```bash
# 只检查错误
fair . -s error -o github

# 严格模式
fair . -c .fairrc.strict.json
```

## 规则自定义

### 1. 禁用规则

```json
{
  "rules": {
    "react/exhaustive-deps": "off",
    "perf/console-log": "off"
  }
}
```

### 2. 调整严重程度

```json
{
  "rules": {
    "react/exhaustive-deps": "error",
    "typescript/no-any": "warning"
  }
}
```

### 3. 自定义规则

```typescript
import { registerRule, Rule } from 'frontend-ai-review/rules';

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

## Git Hooks 集成

### pre-commit hook

```bash
# 安装
npm install --save-dev husky

# 初始化
npx husky init

# 添加 hook
echo 'npx fair . -s error' > .husky/pre-commit
```

现在每次提交都会自动运行代码审查。

## 输出格式

### 1. 文本格式 (默认)

```bash
fair . -o text
```

### 2. JSON 格式

```bash
fair . -o json
```

输出:

```json
{
  "version": "2.2.0",
  "issues": [
    {
      "file": "src/App.tsx",
      "line": 10,
      "rule": "perf/console-log",
      "severity": "suggestion",
      "message": "Remove console.log",
      "fixable": true
    }
  ]
}
```

### 3. GitHub Checks 格式

```bash
fair . -o github
```

用于 GitHub Actions。

### 4. SARIF 格式

```bash
fair . -o sarif > results.sarif
```

用于 GitHub Advanced Security。
