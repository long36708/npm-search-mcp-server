# longmo-npm-search-mcp-server 使用指南（更新版）

## 概述

longmo-npm-search-mcp-server 是一个基于 Model Context Protocol (MCP) 的服务器，提供 NPM 包搜索功能。经过重构，现在采用模块化架构，提供更好的可维护性和扩展性。

## 安装与构建

### 从源码安装

```bash
git clone <repository-url>
cd npm-search-mcp-server
npm install
npm run build
```

### 直接使用

```bash
npm install longmo-npm-search-mcp-server
```

## 基本使用

### 启动服务器

```bash
# 使用构建后的文件（重构后的正确路径）
node dist/src/index.js

# 或使用 npm 脚本
npm run debug:stdio
```

### 在 MCP 客户端中使用

1. 配置 MCP 客户端连接到服务器
2. 使用 `search_npm_packages` 工具搜索 NPM 包

## 调试与开发

### MCP Inspector（推荐）

使用官方的图形界面调试工具：

```bash
# 启动 MCP Inspector
npm run debug
# 或
pnpx @modelcontextprotocol/inspector node dist/src/index.js
```

### 命令行调试

```bash
# 直接启动服务器
npm run debug:stdio

# 测试工具列表
npm run test:mcp

# 手动测试初始化
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' | node dist/src/index.js

# 测试工具列表
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | node dist/src/index.js

# 测试搜索功能
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "search_npm_packages", "arguments": {"query": "react"}}}' | node dist/src/index.js
```

## 工具说明

### search_npm_packages

搜索 NPM 包的工具。

**参数：**
- `query` (string, 必需): 搜索关键词

**返回：**
- 包含匹配包信息的 JSON 数组，包括：
  - 包名和版本
  - 描述和关键词
  - 维护者信息
  - 下载统计
  - 质量评分

**示例：**
```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "react"
  }
}
```

**响应示例：**
```json
{
  "packages": [
    {
      "name": "react",
      "version": "19.1.1",
      "description": "React is a JavaScript library for building user interfaces.",
      "downloads": {
        "weekly": 44755208,
        "monthly": 187989476
      },
      "score": {
        "final": 2107.6587,
        "detail": {
          "popularity": 1,
          "quality": 1,
          "maintenance": 1
        }
      }
    }
  ],
  "total": 429013,
  "time": "2025-08-30T09:09:02.435Z"
}
```

## 项目架构（重构后）

重构后的模块化架构：

```
src/
├── index.ts              # 应用程序入口点
├── types/index.ts        # TypeScript类型定义
├── utils/
│   ├── logger.ts        # 日志工具
│   └── validation.ts    # 输入验证工具
├── services/npm-service.ts # NPM API服务层
├── tools/search-tool.ts   # MCP工具实现
└── server/mcp-server.ts   # MCP服务器主类
```

### 架构优势

- **模块化设计**: 每个模块职责明确，易于维护
- **类型安全**: 完整的 TypeScript 类型定义
- **错误处理**: 统一的错误处理和日志记录
- **可扩展性**: 新功能可以轻松添加到相应模块

## 开发脚本

```bash
# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev
npm run watch

# 代码检查
npm run lint
npm run lint:fix

# 代码格式化
npm run format

# 清理构建文件
npm run clean

# 调试相关
npm run debug          # MCP Inspector 图形界面调试
npm run debug:stdio    # 命令行调试
npm run test:mcp       # 快速测试工具
```

## 配置选项

服务器支持以下配置选项：

- **搜索结果限制**: 默认返回前 20 个结果
- **超时设置**: 默认 30 秒超时
- **日志级别**: 支持 INFO、ERROR 等级别
- **协议版本**: 支持 MCP 2024-11-05 版本

## 故障排除

### 常见问题

1. **连接失败**
   - 检查服务器是否正在运行
   - 验证 MCP 客户端配置
   - 确认使用正确的入口文件 `dist/src/index.js`（重构后路径）

2. **搜索无结果**
   - 检查网络连接
   - 验证搜索关键词
   - 查看服务器日志输出

3. **构建问题**
   - 运行 `npm run clean` 清理旧文件
   - 重新运行 `npm run build`
   - 检查 TypeScript 配置

4. **调试问题**
   - 使用 MCP Inspector 进行图形界面调试
   - 检查 JSON-RPC 消息格式
   - 查看详细的错误日志

5. **bin 路径问题**
   - 确认 package.json 中 bin 指向 `dist/src/index.js`
   - 重构后入口文件路径已更新

### 调试输出示例

服务器提供详细的日志输出：

```
[INFO] 2025-08-30T09:09:01.570Z - NPM Search MCP Server started
[INFO] 2025-08-30T09:09:01.570Z - Searching NPM packages: react
[INFO] 2025-08-30T09:09:02.435Z - Found 20 packages for query: react
```

### MCP 协议测试

验证服务器是否正常工作：

```bash
# 1. 初始化测试
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' | node dist/src/index.js

# 预期输出：
# {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"npm-search-mcp-server","version":"1.0.0"}},"jsonrpc":"2.0","id":1}

# 2. 工具列表测试
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | node dist/src/index.js

# 预期输出：
# {"result":{"tools":[{"name":"search_npm_packages","description":"Search for npm packages","inputSchema":{"type":"object","properties":{"query":{"type":"string","description":"Search query"}},"required":["query"]}}]},"jsonrpc":"2.0","id":2}
```

## 性能优化

- 使用更具体的搜索关键词以获得更相关的结果
- 网络延迟可能影响搜索速度
- 考虑实现缓存机制以提高重复查询的性能

## 版本信息

- **当前版本**: 0.1.1
- **MCP 协议版本**: 2024-11-05
- **Node.js 要求**: >= 16.0.0
- **TypeScript 版本**: ^5.6.2

## 相关文档

- [API Reference](./api-reference.md) - 详细的 API 文档
- [Quick Start Guide](./quick-start.md) - 快速开始教程
- [Architecture](./architecture.md) - 项目架构文档

## 更新日志

### v0.1.1 (最新)
- ✅ 重构为模块化架构
- ✅ 添加完整的 TypeScript 类型定义
- ✅ 改进错误处理和日志记录
- ✅ 更新 bin 路径指向重构后的入口文件
- ✅ 添加 MCP Inspector 调试支持
- ✅ 添加多种调试和开发脚本