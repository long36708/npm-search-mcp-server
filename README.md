# NPM Search MCP Server

一个用于搜索NPM包的Model Context Protocol (MCP)服务器。

## 项目架构

重构后的项目采用模块化架构，具有清晰的关注点分离：

```
src/
├── index.ts              # 应用程序入口点
├── types/
│   └── index.ts         # TypeScript类型定义
├── utils/
│   ├── logger.ts        # 日志工具
│   └── validation.ts    # 输入验证工具
├── services/
│   └── npm-service.ts   # NPM API服务层
├── tools/
│   └── search-tool.ts   # MCP工具实现
└── server/
    └── mcp-server.ts    # MCP服务器主类
```

## 架构优势

1. **模块化设计**: 每个模块都有明确的职责
2. **类型安全**: 完整的TypeScript类型定义
3. **错误处理**: 统一的错误处理和日志记录
4. **可测试性**: 模块化设计便于单元测试
5. **可维护性**: 清晰的代码组织结构

## 构建和运行

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行服务器
npm start
```

## 开发

```bash
# 监听模式构建
npm run watch

# 运行测试
npm test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 使用方法

### 启动服务器（重构后）

```bash
# 使用重构后的正确入口点
node dist/src/index.js

# 或使用npm脚本进行调试
npm run debug:stdio
```

### 调试与开发

```bash
# MCP Inspector图形界面调试（推荐）
npm run debug

# 命令行测试
npm run test:mcp

# 手动测试工具列表
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | node dist/src/index.js

# 手动测试搜索功能
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "search_npm_packages", "arguments": {"query": "react"}}}' | node dist/src/index.js
```

该服务器提供一个工具：

- `search_npm_packages`: 搜索NPM包

### 示例

```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "react"
  }
}
```

### 响应示例

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
      }
    }
  ],
  "total": 429013
}
```

## 重构说明

原始项目是一个单一的126行index.ts文件，包含所有功能。重构后：

- **分离关注点**: 将不同功能分离到专门的模块中
- **提高可读性**: 每个文件都有明确的目的
- **增强可测试性**: 模块化设计便于编写单元测试
- **改善维护性**: 更容易添加新功能和修复bug
- **类型安全**: 完整的TypeScript类型系统支持