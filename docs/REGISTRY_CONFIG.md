# NPM Registry 配置指南

## 问题描述

重构后的版本默认使用 `https://registry.npmjs.org/-/v1/search` 进行NPM包搜索，但在内网环境下可能无法访问外网API。

## 解决方案

现在支持通过环境变量配置自定义NPM registry。

## 配置方法

### 1. 环境变量配置

```bash
# 设置自定义NPM registry
export NPM_REGISTRY_URL="https://your-internal-registry.com"

# 启动服务器
node dist/src/index.js
```

### 2. 常见内网registry配置

#### 使用cnpm镜像
```bash
export NPM_REGISTRY_URL="https://registry.npmmirror.com"
node dist/src/index.js
```

#### 使用公司内网registry
```bash
export NPM_REGISTRY_URL="https://npm.your-company.com"
node dist/src/index.js
```

#### 使用Verdaccio私有registry
```bash
export NPM_REGISTRY_URL="http://localhost:4873"
node dist/src/index.js
```

### 3. Docker环境配置

```dockerfile
FROM node:18
# ... 其他配置
ENV NPM_REGISTRY_URL=https://registry.npmmirror.com
CMD ["node", "dist/src/index.js"]
```

### 4. 调试时配置

```bash
# MCP Inspector调试
NPM_REGISTRY_URL="https://registry.npmmirror.com" npm run debug

# 命令行调试
NPM_REGISTRY_URL="https://registry.npmmirror.com" npm run debug:stdio

# 手动测试
NPM_REGISTRY_URL="https://registry.npmmirror.com" echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "search_npm_packages", "arguments": {"query": "react"}}}' | node dist/src/index.js
```

## 技术实现

### 代码变更

1. **NpmService** 支持构造函数传入registry URL
2. **SearchTool** 传递registry配置到NpmService
3. **NpmSearchServer** 支持registry配置参数
4. **入口文件** 读取环境变量并传递配置

### API端点转换

- **官方NPM**: `https://registry.npmjs.org/-/v1/search`
- **自定义registry**: `{CUSTOM_REGISTRY}/-/v1/search`

例如：
- 输入: `https://registry.npmmirror.com`
- 转换为: `https://registry.npmmirror.com/-/v1/search`

## 查看当前配置

### 1. 查看环境变量

```bash
# 查看当前NPM_REGISTRY_URL设置
echo $NPM_REGISTRY_URL

# 查看所有环境变量中包含NPM的
env | grep NPM

# 如果未设置，命令不会有输出，表示使用默认registry
```

### 2. 查看服务器日志

启动服务器时会显示当前使用的registry：

```bash
node dist/src/index.js
# 输出示例：
# [INFO] 2025-08-30T09:12:56.365Z - Using NPM registry: https://registry.npmmirror.com/-/v1/search
# [INFO] 2025-08-30T09:12:56.365Z - NPM Search MCP Server started
```

### 3. 临时查看配置

```bash
# 临时设置并查看
NPM_REGISTRY_URL="https://registry.npmmirror.com" node -e "console.log('Registry:', process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org (default)')"
```

## 验证配置

### 测试连接

```bash
# 测试registry是否可访问
curl "https://your-registry.com/-/v1/search?text=react&size=1"

# 测试当前配置的registry
curl "${NPM_REGISTRY_URL:-https://registry.npmjs.org}/-/v1/search?text=react&size=1"
```

### 验证服务器

```bash
# 设置registry并测试
export NPM_REGISTRY_URL="https://registry.npmmirror.com"
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "search_npm_packages", "arguments": {"query": "react"}}}' | node dist/src/index.js
```

## 故障排除

### 常见问题

1. **Registry不支持搜索API**
   - 确认registry支持 `/-/v1/search` 端点
   - 某些私有registry可能不支持搜索功能

2. **网络连接问题**
   - 检查防火墙设置
   - 验证内网DNS解析

3. **认证问题**
   - 某些私有registry需要认证
   - 当前版本暂不支持认证，可在后续版本中添加

### 日志调试

服务器会输出详细的日志信息：

```
[INFO] 2025-08-30T09:12:56.365Z - NPM Search MCP Server started
[INFO] 2025-08-30T09:12:56.365Z - Using registry: https://registry.npmmirror.com/-/v1/search
[INFO] 2025-08-30T09:12:56.365Z - Searching NPM packages: react
```

## 默认行为

如果未设置 `NPM_REGISTRY_URL` 环境变量，服务器将使用默认的官方NPM registry：
`https://registry.npmjs.org/-/v1/search`