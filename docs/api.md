# Frontend AI Review API

## Core Modules

### Analyzer

```typescript
import { analyze } from 'frontend-ai-review';

const result = await analyze({
  code: 'const a = 1;',
  framework: 'react'
});
```

### Fixer

```typescript
import { fixer } from 'frontend-ai-review';

const fixed = await fixer.applyFix(code, fix);
```

### SARIF

```typescript
import { toSarif, fromSarif } from 'frontend-ai-review';

const sarif = toSarif(issues);
const issues = fromSarif(sarif);
```

## Configuration

```typescript
import { loadConfig } from 'frontend-ai-review';

const config = loadConfig('./.fairrc');
```

## Rules

```typescript
import { getRules, registerRule } from 'frontend-ai-review/rules';

const rules = getRules();
```

## Types

```typescript
import type { Issue, Rule, Config } from 'frontend-ai-review/types';

const issue: Issue = {
  id: '1',
  ruleId: 'no-console',
  message: 'Unexpected console',
  severity: 'error',
  file: 'src/app.ts'
};
```

## CLI

```bash
# Run review
fair analyze src/

# Apply fixes
fair fix src/

# Check config
fair config
```
