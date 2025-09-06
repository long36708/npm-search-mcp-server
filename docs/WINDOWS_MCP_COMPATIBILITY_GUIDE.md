# Windows下MCP开发兼容性指南

## 概述

本文档基于 `npm-search-mcp-server` 项目的实际开发经验，总结了在Windows环境下开发MCP（Model Context Protocol）服务器的兼容性注意事项和最佳实践。

## 核心兼容性问题

### 1. Shebang行不兼容

**问题**: Windows不支持Unix风格的shebang行 (`#!/usr/bin/env node`)

**解决方案**:
- 创建Windows批处理包装器 (`index.cmd`)
- 使用Node.js直接执行JavaScript文件
- 在package.json中配置正确的bin入口点

### 2. 路径分隔符差异

**问题**: Unix使用`/`而Windows使用`\`作为路径分隔符

**解决方案**:
- 始终使用Node.js的`path`模块处理路径
- 避免硬编码路径分隔符
- 使用相对路径引用

### 3. 权限设置问题

**问题**: `chmod +x`命令在Windows上无效

**解决方案**:
- 使用`shx`包提供跨平台兼容性
- 创建`.cmd`批处理文件作为可执行包装器
- 在构建脚本中处理权限设置

## MCP配置优化

### 客户端配置

**推荐配置**:
```json
{
  "mcpServers": {
    "npm-search": {
      "timeout": 120,
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "longmo-npm-search-mcp-server"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 超时和重试机制

**服务器端超时**:
- MCP服务器连接: 30秒超时
- API请求: 15秒超时（使用AbortController）
- CLI命令: 30秒超时

**重试机制**:
- 主启动程序: 3次重试，间隔2秒
- 搜索工具: 2次重试，间隔1秒

## 错误处理

### 配置警告过滤

过滤npm配置警告，避免将无害警告当作错误处理：

```javascript
const npmConfigWarnings = [
  'Unknown user config "auto-install-peers"',
  'Unknown user config "ELECTRON_MIRROR"',
  // ... 其他已知警告
];
```

### 统一错误处理

- 超时错误特殊处理
- 网络错误分类处理
- 详细的错误日志记录

## 开发最佳实践

### 1. 跨平台开发原则
- 始终使用Node.js内置模块处理系统相关操作
- 避免平台特定的API调用
- 测试所有主要操作系统

### 2. 构建流程优化
1. TypeScript编译
2. Unix权限设置（使用shx）
3. Windows包装器生成
4. 跨平台文件结构验证

### 3. 文件结构
```
dist/src/
├── index.js      # 主入口文件 (Unix/Linux/macOS)
├── index.cmd     # Windows批处理包装器
└── ...           # 其他编译文件
```

## 常见问题排查

### 1. 命令未找到
- 确保npm全局bin目录在PATH中
- 检查全局安装状态
- 验证文件权限和路径

### 2. 权限错误
- 以管理员身份运行命令提示符
- 检查文件系统权限
- 验证npm配置

### 3. 网络连接问题
- 检查防火墙设置
- 验证代理配置
- 测试网络连通性

## 总结

通过遵循这些兼容性注意事项，可以确保MCP服务器在Windows环境下稳定运行，同时保持良好的跨平台兼容性。关键要点包括：

1. 正确处理Shebang和路径问题
2. 实施完善的超时和重试机制
3. 优化错误处理和日志记录
4. 创建适当的Windows包装器
5. 进行充分的跨平台测试

这样开发的MCP服务器能够在Windows、Linux和macOS上无缝运行，为用户提供一致的体验。
