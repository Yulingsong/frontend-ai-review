/**
 * Fair API Server
 * 提供 REST API 服务
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

const app = express();
const upload = multer({ dest: '/tmp/fair-' });

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.5.0' });
});

// 代码审查 API
app.post('/api/review', upload.array('files'), async (req, res) => {
  try {
    const { severity = 'warning', ai = false, category, rules } = req.body;
    const files = req.files as any[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // 创建临时目录
    const tempDir = '/tmp/fair-review-' + Date.now();
    fs.mkdirSync(tempDir);

    // 复制文件
    for (const file of files) {
      const dest = path.join(tempDir, file.originalname);
      fs.copyFileSync(file.path, dest);
      fs.unlinkSync(file.path);
    }

    // 运行 fair
    let cmd = `cd ${tempDir} && fair . -s ${severity} -o json`;
    if (ai) cmd += ' --ai';
    if (category) cmd += ` -c ${category}`;
    if (rules) cmd += ` -r ${rules}`;

    const { stdout } = await execAsync(cmd, { timeout: 300000 });
    
    // 清理
    fs.rmSync(tempDir, { recursive: true, force: true });

    res.json(JSON.parse(stdout));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 单文件审查
app.post('/api/review/file', async (req, res) => {
  try {
    const { code, language = 'javascript', severity = 'warning', ai = false } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const tempFile = '/tmp/fair-single-' + Date.now() + '.' + language;
    fs.writeFileSync(tempFile, code);

    let cmd = `fair ${tempFile} -s ${severity} -o json`;
    if (ai) cmd += ' --ai';

    const { stdout } = await execAsync(cmd, { timeout: 60000 });
    
    fs.unlinkSync(tempFile);
    res.json(JSON.parse(stdout));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取规则列表
app.get('/api/rules', (req, res) => {
  res.json({
    categories: ['react', 'vue', 'typescript', 'security', 'performance', 'best-practice'],
    rules: [
      { id: 'react/exhaustive-deps', category: 'react', severity: 'warning' },
      { id: 'security/eval', category: 'security', severity: 'error' },
      // ... 更多规则
    ]
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Fair API Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Review: POST http://localhost:${PORT}/api/review`);
});
