# Windows 兼容性指南

## 问题分析

这个 npm-search-mcp-server 在 Windows 上会遇到以下问题：

### 1. Shebang 行不兼容
```bash
#!/usr/bin/env node
```
**问题**: Windows 不支持 Unix 风格的 shebang 行，导致无法直接执行 `.js` 文件。

**解决方案**: 创建了 Windows 批处理文件 `index.cmd` 作为包装器。

### 2. 路径分隔符问题
**问题**: Unix 使用 `/`，Windows 使用 `\` 作为路径分隔符。

**解决方案**: 使用 Node.js 的 `path` 模块和相对路径引用。

### 3. 权限设置问题
**问题**: `chmod +x` 命令在 Windows 上无效。

**解决方案**: 使用 `shx` 包提供跨平台兼容性，并创建 `.cmd` 文件。

## 修复内容

### 1. 更新了 package.json
```json
{
  "scripts": {
    "build": "tsc && shx chmod +x dist/src/index.js",
    "postbuild": "node scripts/create-windows-wrapper.js"
  },
  "os": ["darwin", "linux", "win32"]
}
```

### 2. 创建了 Windows 包装器脚本
文件: `scripts/create-windows-wrapper.js`
- 自动生成 `dist/src/index.cmd` 文件
- 提供 Windows 兼容的启动方式

### 3. 生成的 Windows 批处理文件
文件: `dist/src/index.cmd`
```cmd
@echo off
node "%~dp0index.js" %*
```

## Windows 用户使用指南

### 安装
```bash
npm install -g longmo-npm-search-mcp-server
```

### 使用方式

#### 方式 1: 直接使用 npm 全局命令
```bash
longmo-npm-search-mcp-server
```

#### 方式 2: 使用 npx
```bash
npx longmo-npm-search-mcp-server
```

#### 方式 3: 手动运行
```bash
node path/to/dist/src/index.js
```

### 在 MCP 客户端中配置

#### Claude Desktop 配置示例
```json
{
  "mcpServers": {
    "npm-search": {
      "command": "longmo-npm-search-mcp-server",
      "args": []
    }
  }
}
```

#### 如果全局安装有问题，使用完整路径
```json
{
  "mcpServers": {
    "npm-search": {
      "command": "node",
      "args": ["C:/Users/YourUsername/AppData/Roaming/npm/node_modules/longmo-npm-search-mcp-server/dist/src/index.js"]
    }
  }
}
```

## 测试兼容性

### 验证安装
```bash
# 检查是否正确安装
npm list -g longmo-npm-search-mcp-server

# 测试基本功能
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | longmo-npm-search-mcp-server
```

### 常见问题排查

#### 问题 1: 命令未找到
**解决**: 确保 npm 全局 bin 目录在 PATH 中
```bash
npm config get prefix
```

#### 问题 2: 权限错误
**解决**: 以管理员身份运行命令提示符

#### 问题 3: Node.js 版本不兼容
**解决**: 确保使用 Node.js 18+ 版本
```bash
node --version
```

## 开发者注意事项

1. **始终使用 `shx` 进行跨平台命令**
2. **为 Windows 用户提供 `.cmd` 包装器**
3. **避免使用平台特定的路径分隔符**
4. **测试所有主要操作系统**

## 技术细节

### 自动构建流程
1. `npm run build` 编译 TypeScript
2. `shx chmod +x` 设置 Unix 权限
3. `postbuild` 脚本创建 Windows 包装器
4. 生成跨平台兼容的可执行文件

### 文件结构
```
dist/src/
├── index.js      # 主入口文件 (Unix/Linux/macOS)
├── index.cmd     # Windows 批处理包装器
└── ...           # 其他编译文件
```

这样的设置确保了在所有主要操作系统上的兼容性。