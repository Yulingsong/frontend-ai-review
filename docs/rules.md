# Frontend AI Review 规则详解

## 规则分类

| 分类 | 数量 | 描述 |
|------|------|------|
| React | 10+ | React 最佳实践 |
| Vue | 6+ | Vue 最佳实践 |
| TypeScript | 6+ | TypeScript 最佳实践 |
| Security | 8+ | 安全问题 |
| Performance | 7+ | 性能优化 |
| Best Practice | 10+ | 通用最佳实践 |

---

## React 规则

### react/exhaustive-deps

**严重程度**: warning

**描述**: useEffect 依赖数组可能不完整

**示例**:

```tsx
// ❌ 错误
useEffect(() => {
  console.log(count);
}, []); // missing 'count'

// ✅ 正确
useEffect(() => {
  console.log(count);
}, [count]);
```

**自动修复**: 否

---

### react/no-array-index-key

**严重程度**: warning

**描述**: 不应使用数组索引作为 key

**示例**:

```tsx
// ❌ 错误
items.map((item, index) => (
  <div key={index}>{item.name}</div>
))

// ✅ 正确
items.map((item) => (
  <div key={item.id}>{item.name}</div>
))
```

**自动修复**: 否

---

### react/hooks-rule-of-hooks

**严重程度**: error

**描述**: Hook 必须在组件顶层调用

**示例**:

```tsx
// ❌ 错误
function MyComponent() {
  if (condition) {
    useEffect(() => {}, []); // 不在顶层
  }
}

// ✅ 正确
function MyComponent() {
  useEffect(() => {}, [condition]); // 在顶层
}
```

**自动修复**: 否

---

### react/no-direct-mutation-state

**严重程度**: error

**描述**: 不能直接修改 state

**示例**:

```tsx
// ❌ 错误
function MyComponent() {
  const [count, setCount] = useState(0);
  count = 1; // 直接修改
}

// ✅ 正确
function MyComponent() {
  const [count, setCount] = useState(0);
  setCount(1); // 使用 setter
}
```

**自动修复**: 否

---

### react/button-has-type

**严重程度**: suggestion

**描述**: button 必须有 type 属性

**示例**:

```tsx
// ❌ 错误
<button>Submit</button>

// ✅ 正确
<button type="submit">Submit</button>
<button type="button">Cancel</button>
<button type="reset">Reset</button>
```

**自动修复**: 是 (自动添加 `type="button"`)

---

### react/prop-types

**严重程度**: warning

**描述**: 组件应该定义 PropTypes 或使用 TypeScript

**示例**:

```tsx
// ❌ 错误
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

// ✅ 正确 (TypeScript)
function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ✅ 正确 (PropTypes)
Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func
};
```

**自动修复**: 否

---

## Vue 规则

### vue/v-for-key

**严重程度**: warning

**描述**: v-for 必须有 key

**示例**:

```html
<!-- ❌ 错误 -->
<div v-for="item in items">{{ item.name }}</div>

<!-- ✅ 正确 -->
<div v-for="item in items" :key="item.id">{{ item.name }}</div>
```

**自动修复**: 是

---

### vue/v-if-with-v-for

**严重程度**: error

**描述**: 不应同时使用 v-if 和 v-for

**示例**:

```html
<!-- ❌ 错误 -->
<div v-for="item in items" v-if="item.active">{{ item.name }}</div>

<!-- ✅ 正确: 先过滤再渲染 -->
<template v-for="item in items">
  <div v-if="item.active" :key="item.id">{{ item.name }}</div>
</template>

<!-- 或使用计算属性 -->
<template v-for="item in activeItems">
  <div :key="item.id">{{ item.name }}</div>
</template>
```

**自动修复**: 否

---

### vue/no-unused-vars

**严重程度**: warning

**描述**: 不应有未使用的变量

---

### vue/require-default-prop

**严重程度**: warning

**描述**: 必须为 props 提供默认值

---

### vue/require-explicit-emits

**严重程度**: suggestion

**描述**: 必须显式声明 emits

---

### vue/multi-word-component-names

**严重程度**: suggestion

**描述**: 组件名应该是多单词的

---

## TypeScript 规则

### typescript/no-any

**严重程度**: warning

**描述**: 不应使用 `any` 类型

**示例**:

```typescript
// ❌ 错误
function parse(value: any): any { }

// ✅ 正确
function parse(value: string): number { }
```

**自动修复**: 否

---

### typescript/no-unused-vars

**严重程度**: warning

**描述**: 不应有未使用的变量

**示例**:

```typescript
// ❌ 错误
function unused() {
  const x = 1;
}

// ✅ 正确
function used() {
  const x = 1;
  return x;
}
```

**自动修复**: 是 (删除未使用的变量)

---

### typescript/no-explicit-any

**严重程度**: warning

**描述**: 不应显式使用 `any`

---

### typescript/explicit-function-return-type

**严重程度**: suggestion

**描述**: 应显式声明函数返回类型

---

### typescript/prefer-optional-chain

**严重程度**: suggestion

**描述**: 应使用可选链

**示例**:

```typescript
// ❌ 错误
if (data && data.user && data.user.profile) { }

// ✅ 正确
if (data?.user?.profile) { }
```

**自动修复**: 是

---

### typescript/no-non-null-assertion

**严重程度**: suggestion

**描述**: 不应使用非空断言

---

## 安全规则

### security/eval

**严重程度**: error

**描述**: 不应使用 eval()

**示例**:

```javascript
// ❌ 错误
eval('(' + jsonString + ')');
new Function('return ' + jsonString)();

// ✅ 正确
JSON.parse(jsonString);
```

**自动修复**: 否

---

### security/hardcoded-credentials

**严重程度**: error

**描述**: 不应硬编码凭证

**示例**:

```typescript
// ❌ 错误
const apiKey = 'sk-1234567890abcdef';
const password = 'secret123';

// ✅ 正确
const apiKey = process.env.API_KEY;
const password = await getPassword();
```

**自动修复**: 否

---

### security/sql-injection

**严重程度**: error

**描述**: 可能有 SQL 注入风险

**示例**:

```typescript
// ❌ 错误
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ 正确
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**自动修复**: 否

---

### security/command-injection

**严重程度**: error

**描述**: 可能有命令注入风险

**示例**:

```typescript
// ❌ 错误
exec(`git commit -m "${message}"`);

// ✅ 正确
exec('git commit -m ?', [message]);
```

**自动修复**: 否

---

### security/no-danger

**严重程度**: warning

**描述**: 不应使用 dangerouslySetInnerHTML

---

### security/no-inner-html

**严重程度**: warning

**描述**: 不应使用 innerHTML

---

### security/no-eval

**严重程度**: error

**描述**: 同 security/eval

---

### security/no-unsafe-regex

**严重程度**: warning

**描述**: 不安全的正则表达式 (ReDoS)

---

## 性能规则

### perf/console-log

**严重程度**: suggestion

**描述**: 应删除 console.log

**示例**:

```typescript
// ❌ 错误
console.log('debug:', value);

// ✅ 正确
// 删除 console.log
```

**自动修复**: 是 (删除该行)

---

### perf/anonymous-function

**严重程度**: suggestion

**描述**: 避免在渲染中创建匿名函数

**示例**:

```tsx
// ❌ 错误
<button onClick={(e) => handleClick(e)}>Click</button>

// ✅ 正确
<button onClick={handleClick}>Click</button>
```

**自动修复**: 否

---

### perf/memo

**严重程度**: suggestion

**描述**: 考虑使用 useMemo/useCallback

---

### perf/no-inline-styles

**严重程度**: suggestion

**描述**: 避免内联样式

---

### perf/optimize-regex

**严重程度**: suggestion

**描述**: 优化正则表达式

---

### perf/prefer-fragment

**严重程度**: suggestion

**描述**: 优先使用 Fragment

---

### perf/dont-use-label

**严重程度**: suggestion

**描述**: 避免使用 label

---

## 最佳实践规则

### best-practice/no-magic-numbers

**严重程度**: suggestion

**描述**: 不应使用魔法数字

**示例**:

```typescript
// ❌ 错误
if (status === 1) { } // 1 是什么?

// ✅ 正确
enum Status { Active = 1, Inactive = 0 }
if (status === Status.Active) { }

// 或使用常量
const ACTIVE_STATUS = 1;
if (status === ACTIVE_STATUS) { }
```

**自动修复**: 否

---

### best-practice/import-order

**严重程度**: suggestion

**描述**: import 顺序不规范

**示例**:

```typescript
// ❌ 错误
import { b } from 'b';
import { a } from 'a';
import utils from './utils';

// ✅ 正确
// 1. React/Vue 等框架
import React, { useState } from 'react';

// 2. 第三方库
import axios from 'axios';

// 3. 相对路径
import utils from './utils';

// 4. 样式
import './styles.css';
```

**自动修复**: 是 (自动排序)

---

### best-practice/no-var

**严重程度**: suggestion

**描述**: 应使用 let/const 代替 var

**示例**:

```javascript
// ❌ 错误
var x = 1;

// ✅ 正确
const x = 1;
let y = 2;
```

**自动修复**: 是

---

### best-practice/prefer-const

**严重程度**: suggestion

**描述**: 优先使用 const

**示例**:

```javascript
// ❌ 错误
let x = 1; // x 从未被修改

// ✅ 正确
const x = 1;
```

**自动修复**: 是

---

### best-practice/no-throw-literal

**严重程度**: suggestion

**描述**: 应抛出 Error 对象

**示例**:

```typescript
// ❌ 错误
throw 'Something went wrong';

// ✅ 正确
throw new Error('Something went wrong');
```

---

### best-practice/return-await

**严重程度**: suggestion

**描述**: 在 try-catch 外应 await

---

## 自定义规则

### 注册自定义规则

```typescript
import { registerRule, Rule } from 'frontend-ai-review/rules';

const myRule: Rule = {
  id: 'my/custom-rule',
  category: 'best-practice',
  severity: 'warning',
  message: '描述',
  
  create(context) {
    return {
      // AST visitor
    };
  }
};

registerRule(myRule);
```

### 禁用规则

```json
{
  "rules": {
    "react/exhaustive-deps": "off"
  }
}
```

### 修改严重程度

```json
{
  "rules": {
    "react/exhaustive-deps": "error"
  }
}
```
