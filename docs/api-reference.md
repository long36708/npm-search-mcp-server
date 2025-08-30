# NPM Search MCP Server API 参考

## 概述

NPM Search MCP Server 实现了 Model Context Protocol (MCP) 规范，提供 npm 包搜索功能。

## MCP 协议信息

- **协议版本**: MCP 1.0
- **服务器名称**: `npm-search-server`
- **服务器版本**: `0.1.0`
- **传输方式**: stdio

## 服务器能力

```json
{
  "capabilities": {
    "tools": {}
  }
}
```

## 工具列表

### search_npm_packages

搜索 npm 包的工具。

#### 工具信息
```json
{
  "name": "search_npm_packages",
  "description": "Search for npm packages",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query"
      }
    },
    "required": ["query"]
  }
}
```

#### 请求格式

**方法**: `tools/call`

**参数**:
```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "搜索查询字符串"
  }
}
```

#### 参数说明

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| query | string | 是 | 要搜索的包名或关键词 |

#### 响应格式

**成功响应**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "npm search 命令的输出结果"
    }
  ]
}
```

**错误响应**:
```json
{
  "error": {
    "code": -32602,
    "message": "Invalid search arguments"
  }
}
```

## 错误代码

| 错误代码 | 错误名称 | 描述 |
|----------|----------|------|
| -32601 | MethodNotFound | 未知的工具名称 |
| -32602 | InvalidParams | 无效的参数 |
| -32603 | InternalError | 内部服务器错误 |

## 使用示例

### 基本搜索

**请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_npm_packages",
    "arguments": {
      "query": "express"
    }
  }
}
```

**响应**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "NAME                      | DESCRIPTION                           | AUTHOR          | DATE       | VERSION  | KEYWORDS\nexpress                   | Fast, unopinionated, minimalist...   | =mikeal...      | 2021-03-25 | 4.17.3   | express framework sinatra web rest restful router app api\n..."
      }
    ]
  }
}
```

### 搜索特定关键词

**请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_npm_packages",
    "arguments": {
      "query": "react ui components"
    }
  }
}
```

### 错误处理示例

**无效参数请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_npm_packages",
    "arguments": {
      "invalid_param": "test"
    }
  }
}
```

**错误响应**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Invalid search arguments"
  }
}
```

## 搜索语法

### 基本搜索
- `express` - 搜索包含 "express" 的包
- `web framework` - 搜索包含 "web" 和 "framework" 的包

### 高级搜索语法

npm search 支持以下搜索语法：

#### 作者搜索
- `author:sindresorhus` - 搜索特定作者的包
- `maintainer:facebook` - 搜索特定维护者的包

#### 关键词搜索
- `keywords:cli` - 搜索带有特定关键词的包
- `keywords:react,component` - 搜索带有多个关键词的包

#### 描述搜索
- `description:framework` - 在描述中搜索特定词汇

#### 组合搜索
- `author:facebook keywords:react` - 组合多个条件

## 输出格式

### 标准输出格式

npm search 命令返回表格格式的数据，包含以下列：

| 列名 | 描述 |
|------|------|
| NAME | 包名称 |
| DESCRIPTION | 包描述（截断） |
| AUTHOR | 包作者 |
| DATE | 最后发布日期 |
| VERSION | 当前版本 |
| KEYWORDS | 相关关键词 |

### 示例输出
```
NAME                      | DESCRIPTION                           | AUTHOR          | DATE       | VERSION  | KEYWORDS
express                   | Fast, unopinionated, minimalist...   | =mikeal...      | 2021-03-25 | 4.17.3   | express framework sinatra web rest restful router app api
express-generator         | Express' application generator        | =mikeal...      | 2020-02-18 | 4.16.1   | express generator framework web app
express-session           | Simple session middleware for Express | =dougwilson...  | 2021-01-15 | 1.17.1   | express session middleware
```

## 性能考虑

### 搜索限制
- npm search 默认返回前 20 个结果
- 搜索查询长度建议不超过 100 字符
- 避免过于频繁的搜索请求

### 缓存机制
- npm 客户端具有内置缓存
- 相同查询的后续请求会更快
- 缓存有效期通常为几分钟到几小时

### 超时设置
- 默认搜索超时为 30 秒
- 网络较慢时可能需要更长时间
- 超时会返回 InternalError

## 客户端实现指南

### 连接服务器

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'npm-search-mcp-server']
});

const client = new Client({
  name: 'npm-search-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);
```

### 调用搜索工具

```typescript
const result = await client.request({
  method: 'tools/call',
  params: {
    name: 'search_npm_packages',
    arguments: {
      query: 'express'
    }
  }
});

console.log(result.content[0].text);
```

### 错误处理

```typescript
try {
  const result = await client.request({
    method: 'tools/call',
    params: {
      name: 'search_npm_packages',
      arguments: {
        query: 'express'
      }
    }
  });
} catch (error) {
  if (error.code === -32602) {
    console.error('Invalid parameters:', error.message);
  } else if (error.code === -32603) {
    console.error('Server error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 扩展和自定义

### 添加新工具

要添加新的搜索相关工具，可以扩展服务器实现：

```typescript
// 添加包详情工具
this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_npm_packages',
      description: 'Search for npm packages',
      inputSchema: { /* ... */ }
    },
    {
      name: 'get_package_info',
      description: 'Get detailed package information',
      inputSchema: {
        type: 'object',
        properties: {
          packageName: {
            type: 'string',
            description: 'Package name'
          }
        },
        required: ['packageName']
      }
    }
  ]
}));
```

### 自定义搜索逻辑

可以修改搜索实现以支持更复杂的查询：

```typescript
private async searchPackages(query: string): Promise<string> {
  // 自定义搜索逻辑
  const { stdout } = await execPromise(`npm search "${query}" --json`);
  const results = JSON.parse(stdout);
  
  // 处理和格式化结果
  return this.formatResults(results);
}
```

## 版本兼容性

| 服务器版本 | MCP 版本 | Node.js 版本 | npm 版本 |
|------------|----------|--------------|----------|
| 0.1.x | 1.0 | >= 16.0.0 | >= 7.0.0 |

## 更新日志

### v0.1.1
- 初始版本
- 基本搜索功能
- MCP 1.0 协议支持

### 计划功能
- 包详情查询
- 版本历史
- 依赖分析
- 安全审计