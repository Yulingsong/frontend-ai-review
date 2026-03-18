#!/bin/bash
# Auto Optimizer Runner
# Run from project root

cd /Users/half/Desktop/frontend-ai-review

# Build first
npm run build

# Run the optimizer (compile and run TypeScript directly)
npx tsx scripts/auto-optimizer.ts

echo "Auto-optimization complete at $(date)"
