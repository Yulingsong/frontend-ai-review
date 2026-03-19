# 故障排除

## 常见问题

### 安装问题

#### 问题：安装失败，提示权限错误

**解决方案：**

```bash
# 方法 1：使用 sudo
sudo npm install -g veritas

# 方法 2：配置 npm 全局路径
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH="$PATH:$HOME/.npm-global/bin"' >> ~/.zshrc
source ~/.zshrc
npm install -g veritas
```

#### 问题：找不到 `veritas` 命令

**解决方案：**

```bash
# 检查安装
npm list -g veritas

# 检查 PATH
echo $PATH

# 使用 npx
npx veritas generate <file>
```

### 使用问题

#### 问题：AI 生成失败

**解决方案：**

1. 检查 API Key 是否正确设置
2. 检查网络连接
3. 查看详细日志：
   ```bash
   veritas --verbose generate src/...
   ```

#### 问题：生成的测试质量不好

**解决方案：**

1. 提供更多上下文信息
2. 使用流量录制功能
3. 手动调整生成的测试

### 性能问题

#### 问题：分析大项目很慢

**解决方案：**

```bash
# 使用并行分析
veritas generate src/... --parallel

# 使用缓存
veritas generate src/... --cache

# 使用 Git 增量
veritas analyze --git --staged
```

### 错误信息

#### "Parse error"

**解决方案：**

1. 确保代码可以正常解析
2. 检查文件编码是否为 UTF-8
3. 确保代码语法正确

#### "Network error"

**解决方案：**

1. 检查网络连接
2. 配置代理：
   ```bash
   export HTTP_PROXY=http://proxy:8080
   export HTTPS_PROXY=http://proxy:8080
   ```

#### "API key not found"

**解决方案：**

```bash
# 设置环境变量
export OPENAI_API_KEY=sk-xxx
export ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## 获取帮助

如果以上方法都无法解决你的问题，请：

1. 搜索 [GitHub Issues](https://github.com/Yulingsong/veritas/issues)
2. 创建新的 Issue 并描述问题
3. 加入社区讨论
