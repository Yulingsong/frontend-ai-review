# Frontend AI Review 常见问题

## 安装问题

### Q: 安装失败，提示权限错误

**A**: 使用以下方法之一:

```bash
# 方法 1: 使用 sudo
sudo npm install -g frontend-ai-review

# 方法 2: 配置 npm 全局路径
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH="$PATH:$HOME/.npm-global/bin"' >> ~/.zshrc
source ~/.zshrc
npm install -g frontend-ai-review
```

### Q: 找不到 `fair` 命令

**A**: 
1. 检查安装: `npm list -g frontend-ai-review`
2. 检查 PATH: `echo $PATH | grep npm`
3. 尝试: `npx fair .`

---

## 使用问题

### Q: 如何运行代码检查?

```bash
# 基本用法
fair /path/to/project

# 指定目录
fair ./src

# 当前目录
fair .
```

### Q: 如何只检查特定分类?

```bash
# 只检查 React
fair . -c react

# 只检查 Vue 和 TypeScript
fair . -c vue,typescript
```

### Q: 如何只检查特定规则?

```bash
fair . -r react/exhaustive-deps
fair . -r react/exhaustive-deps,react/no-array-index-key
```

### Q: 如何排除某些文件?

```bash
fair . -e "node_modules/**" -e "dist/**" -e "**/*.test.ts"
```

或在配置文件中:

```json
{
  "exclude": ["node_modules/**", "dist/**"]
}
```

### Q: 如何只显示错误?

```bash
fair . -s error
```

或在配置中:

```json
{
  "severity": "error"
}
```

---

## 配置问题

### Q: 配置文件应该叫什么?

**A**: 按优先级:
1. `.fairrc.json`
2. `.fairrc`
3. `fair.config.json`
4. `~/.fairrc` (用户目录)

### Q: 如何查看当前配置?

```bash
fair config --show
```

### Q: 如何验证配置?

```bash
fair config --validate
```

---

## 输出格式

### Q: 如何输出 JSON 格式?

```bash
fair . -o json
```

### Q: 如何输出 GitHub Checks 格式?

```bash
fair . -o github
```

用于 GitHub Actions:

```yaml
- name: Frontend AI Review
  uses: Yulingsong/frontend-ai-review@v1
  with:
    output: github
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Q: 如何输出 SARIF 格式?

```bash
fair . -o sarif
```

用于 GitHub Advanced Security:

```bash
fair . -o sarif > results.sarif
```

---

## AI 分析

### Q: 如何启用 AI 分析?

```bash
fair . --ai
```

### Q: 支持哪些 AI 提供商?

**A**: 
- OpenAI (默认)
- Anthropic Claude
- Google Gemini
- Azure OpenAI
- Cohere
- Mistral
- 阿里 Qwen

### Q: 如何切换 AI 提供商?

```bash
# Anthropic
fair . --ai --ai-provider anthropic

# Gemini
fair . --ai --ai-provider gemini

# Azure
fair . --ai --ai-provider azure --azure-endpoint https://xxx.openai.azure.com
```

### Q: 为什么 AI 分析失败?

**A**: 常见原因:
1. 未设置 API Key: `export OPENAI_API_KEY=sk-xxx`
2. 网络问题 (需要代理)
3. API 配额用尽

### Q: 可以不用 AI 吗?

**A**: 可以，直接运行:

```bash
fair .  # 不带 --ai
```

---

## 自动修复

### Q: 如何自动修复问题?

```bash
fair . --fix
```

### Q: 哪些规则支持自动修复?

| 规则 | 支持 |
|------|------|
| `perf/console-log` | ✅ 删除该行 |
| `best-practice/no-var` | ✅ 转为 let/const |
| `best-practice/prefer-const` | ✅ 转为 const |
| `best-practice/import-order` | ✅ 排序 import |
| `vue/v-for-key` | ✅ 添加 key |
| `react/button-has-type` | ✅ 添加 type |

---

## 性能问题

### Q: 检查大项目很慢?

**A**: 启用以下优化:

```bash
# 1. 并行分析
fair . --parallel

# 2. 增量缓存
fair . --cache

# 3. Git 增量 (只检查改动的文件)
fair . --git --staged
fair . --git --branch main

# 4. 排除不需要的目录
fair . -e "node_modules/**" -e "dist/**"
```

### Q: 内存占用过高?

**A**: 
1. 使用并行时注意内存
2. 排除大型目录
3. 使用 `--cache` 减少重复分析

---

## CI/CD 集成

### Q: 如何在 GitHub Actions 中使用?

```yaml
name: Code Review
on: [push, pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install fair
        run: npm install -g frontend-ai-review
      
      - name: Run Review
        run: fair . -s warning -o github
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Q: 如何在 GitLab CI 中使用?

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

---

## 错误处理

### Q: 出现 "Parse error"

**A**: 
1. 确保代码可以正常解析
2. 检查文件编码是否为 UTF-8
3. 检查是否有语法错误

### Q: 出现 "Module not found"

**A**: 
1. 确保在项目根目录运行
2. 检查 node_modules 是否安装
3. 尝试: `npm install`

### Q: 出现 "Config error"

**A**: 
1. 检查配置文件格式是否为有效 JSON
2. 检查是否有尾随逗号
3. 验证: `fair config --validate`

---

## 规则问题

### Q: 如何禁用某个规则?

```json
{
  "rules": {
    "react/exhaustive-deps": "off"
  }
}
```

或 CLI:

```bash
fair . -r react/exhaustive-deps=off
```

### Q: 如何改变规则严重程度?

```json
{
  "rules": {
    "react/exhaustive-deps": "error"
  }
}
```

### Q: 规则太多?

**A**: 只启用需要的分类:

```json
{
  "category": ["react", "typescript"]
}
```

---

## 调试

### Q: 如何查看详细日志?

当前版本暂无详细日志参数，可以检查:
1. 配置文件是否正确
2. 运行 `--help` 查看选项

### Q: 如何报告 bug?

请在 [GitHub Issues](https://github.com/Yulingsong/frontend-ai-review/issues) 报告，包含:
- `fair --version` 输出
- 复现步骤
- 示例代码

---

## 其他

### Q: 和 ESLint 有什么区别?

| 特性 | ESLint | Frontend AI Review |
|------|--------|-------------------|
| 静态分析 | ✅ | ✅ |
| AI 分析 | ❌ | ✅ |
| 自动修复 | ✅ | 部分 |
| 交互模式 | ❌ | ✅ |
| 多语言 | 多 | 前端为主 |

### Q: 可以同时使用 ESLint 吗?

**A**: 可以，两者互补:

```bash
# 先用 ESLint 修复格式问题
npm run lint

# 再用 fair 检查最佳实践
fair .
```

### Q: 如何贡献?

1. Fork 项目
2. 创建分支: `git checkout -b feature/xxx`
3. 提交: `git commit -am 'Add xxx'`
4. 推送到分支: `git push origin feature/xxx`
5. 创建 Pull Request

### Q: 如何获取帮助?

- GitHub: https://github.com/Yulingsong/frontend-ai-review/issues
- 文档: https://github.com/Yulingsong/frontend-ai-review#readme
