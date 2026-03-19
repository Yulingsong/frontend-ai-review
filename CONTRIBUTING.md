# Contributing to Frontend AI Review

感谢你对 Frontend AI Review 项目的兴趣！

## 如何贡献

### 1. 报告问题

如果你发现 bug 或有新功能建议，请先搜索是否已存在相同问题。如果没有，请创建新的 Issue。

### 2. 提交代码

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -am 'Add some feature'`)
4. 推送分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

### 3. 开发环境

```bash
# 克隆项目
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 添加必要的测试

## 提交信息规范

使用清晰的提交信息：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
```

## 添加新规则

1. 在 `src/rules/` 目录创建规则文件
2. 遵循现有规则的代码结构
3. 添加测试用例
4. 更新文档

---

感谢你的贡献！ 🎉
