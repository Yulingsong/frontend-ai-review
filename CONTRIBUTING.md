# Frontend AI Review 贡献指南

## 开发环境设置

```bash
# 克隆项目
git clone https://github.com/Yulingsong/frontend-ai-review.git
cd frontend-ai-review

# 安装依赖
npm install

# 运行测试
npm test

# 开发模式
npm run dev
```

## 项目结构

```
src/
├── analyzer.ts      # 代码分析器
├── config/         # 配置模块
├── fixer.ts        # 代码修复
├── i18n/          # 国际化
├── index.ts       # 入口文件
├── interactive.ts # 交互模块
├── llm/           # LLM 集成
├── plugin.ts      # 插件系统
├── rules/         # 规则集
├── sarif.ts       # SARIF 格式
├── types/         # 类型定义
└── utils/        # 工具函数
```

## 添加新规则

1. 在 `src/rules/` 创建规则文件
2. 实现规则逻辑
3. 添加测试用例
4. 更新规则索引

## 添加测试

```typescript
import { describe, it, expect } from 'vitest';

describe('ModuleName', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 添加测试覆盖

## 提交规范

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `test:` 测试用例
- `refactor:` 代码重构
