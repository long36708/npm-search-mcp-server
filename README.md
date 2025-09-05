# longmo-npm-search-mcp-server

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
│   └── hybrid-npm-service.ts   # 混合NPM服务层
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

# 构建项目（生成dist目录）
npm run build

# 全局安装使用
npm install -g .

# 或直接运行构建后的文件
node dist/src/index.js
```

## 🪟 Windows 兼容性

**重要提示**: 此MCP服务器现已完全支持Windows系统！

### Windows 用户快速开始

```bash
# 全局安装
npm install -g longmo-npm-search-mcp-server

# 直接使用
longmo-npm-search-mcp-server

# 或使用 npx
npx longmo-npm-search-mcp-server
```

### 已解决的Windows问题

1. ✅ **Shebang兼容性**: 自动生成Windows批处理包装器
2. ✅ **路径分隔符**: 使用跨平台路径处理
3. ✅ **权限设置**: 使用`shx`提供跨平台支持
4. ✅ **构建流程**: 自动创建Windows兼容文件

详细的Windows兼容性信息请查看: [Windows兼容性指南](docs/WINDOWS_COMPATIBILITY.md)

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

### 启动服务器

```bash
# 全局安装后使用
longmo-npm-search-mcp-server

# 或使用npx（推荐）
npx longmo-npm-search-mcp-server

# 或直接运行构建后的文件
node dist/src/index.js

# 调试模式
npm run debug:stdio
```

### 配置NPM Registry模式

服务器支持两种模式：

1. **CLI模式（默认）**: 使用本地npm配置
   ```bash
   # 默认使用CLI模式，读取本地npm配置
   npx longmo-npm-search-mcp-server
   ```

2. **API模式**: 使用指定的registry URL
   ```bash
   # 设置环境变量使用API模式
   export NPM_REGISTRY_URL=https://registry.npmjs.org
   npx longmo-npm-search-mcp-server
   ```

环境变量配置：
- `NPM_REGISTRY_URL`: 设置自定义npm registry URL（启用API模式）
- 不设置：使用CLI模式（本地npm配置）

### 调试与开发

```bash
# MCP Inspector图形界面调试（推荐）
npm run debug

# 命令行测试
npm run test:mcp

# 手动测试工具列表
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | npx longmo-npm-search-mcp-server

# 手动测试搜索功能
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "search_npm_packages", "arguments": {"query": "react"}}}' | npx longmo-npm-search-mcp-server
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

## codebuddy 配置示例

```json
{    
  "npm-search": {
      "timeout": 60,
      "type": "stdio",
      "command": "pnpx",
      "args": [
        "longmo-npm-search-mcp-server"
      ]
    },
}
 ```

> 注意使用 pnpx 时候不需要加 -y，使用npx的时候推荐加 -y

## 重构说明

原始项目是一个单一的126行index.ts文件，包含所有功能。重构后：

- **分离关注点**: 将不同功能分离到专门的模块中
- **提高可读性**: 每个文件都有明确的目的
- **增强可测试性**: 模块化设计便于编写单元测试
- **改善维护性**: 更容易添加新功能和修复bug
- **类型安全**: 完整的TypeScript类型系统支持