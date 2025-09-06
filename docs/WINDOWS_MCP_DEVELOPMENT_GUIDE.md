# Windows下MCP开发兼容性完整指南

## 概述

本文档基于 `npm-search-mcp-server` 项目的实际开发经验，详细总结了在Windows环境下开发MCP（Model Context Protocol）服务器的兼容性注意事项和最佳实践。

## 核心兼容性问题

### 1. Shebang行不兼容 ❌

**问题描述**：
```bash
#!/usr/bin/env node
```
Windows系统不支持Unix风格的shebang行，导致无法直接执行`.js`文件。

**影响**：
- 无法通过命令行直接运行JavaScript文件
- MCP客户端无法正确启动服务器
- 出现"command not found"或"permission denied"错误

**解决方案**：
1. **创建Windows批处理包装器**：
   ```javascript
   // scripts/create-windows-wrapper.js
   const cmdContent = `@echo off
   node "%~dp0index.js" %*`;
   ```

2. **package.json配置**：
   ```json
   {
     "bin": {
       "your-mcp-server": "dist/src/index.js"
     },
     "scripts": {
       "postbuild": "node scripts/create-windows-wrapper.js"
     }
   }
   ```

3. **生成的批处理文件**（`dist/src/index.cmd`）：
   ```cmd
   @echo off
   node "%~dp0index.js" %*
   ```

### 2. 路径分隔符差异 🛤️

**问题描述**：
- Unix/Linux/macOS: `/` (正斜杠)
- Windows: `\` (反斜杠)

**影响**：
- 文件路径解析错误
- 模块导入失败
- 资源加载问题

**解决方案**：
1. **始终使用Node.js的path模块**：
   ```javascript
   import path from 'path';
   
   // 正确做法
   const filePath = path.join('dist', 'src', 'index.js');
   
   // 错误做法
   const filePath = 'dist/src/index.js'; // 可能在Windows上出错
   ```

2. **使用相对路径引用**：
   ```javascript
   // 正确做法
   import { MyModule } from './utils/module.js';
   
   // 避免硬编码绝对路径
   import { MyModule } from '/home/user/project/utils/module.js';
   ```

### 3. 权限设置问题 🔒

**问题描述**：
- Unix: `chmod +x script.js` 设置执行权限
- Windows: 文件权限模型完全不同

**影响**：
- 构建脚本在Windows上失败
- 无法设置文件执行权限
- 部署过程出错

**解决方案**：
1. **使用shx包提供跨平台兼容性**：
   ```json
   {
     "devDependencies": {
       "shx": "^0.3.4"
     },
     "scripts": {
       "build": "tsc && shx chmod +x dist/src/index.js"
     }
   }
   ```

2. **创建平台特定的可执行文件**：
   - Unix系统：依赖shebang和权限
   - Windows系统：依赖批处理文件

## MCP配置兼容性

### 1. 客户端配置优化 📋

**问题配置**（可能导致超时）：
```json
{
  "mcpServers": {
    "npm-search": {
      "command": "cmd",
      "args": ["npx", "-y", "longmo-npm-search-mcp-server"]
    }
  }
}
```

**推荐配置**：
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

### 2. 超时和重试机制 ⏱️

**服务器端超时控制**：
```javascript
// MCP服务器连接超时
async run(): Promise<void> {
  const transport = new StdioServerTransport();
  
  const connectPromise = this.server.connect(transport);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Server connection timeout')), 30000);
  });
  
  await Promise.race([connectPromise, timeoutPromise]);
}
```

**API请求超时**：
```javascript
// API请求超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);

const response = await fetch(url, {
  signal: controller.signal,
  headers: {
    'User-Agent': 'npm-search-mcp-server/1.0.0',
    'Accept': 'application/json',
  }
});
```

**CLI命令超时**：
```javascript
// CLI命令超时控制
const execResult = await Promise.race([
  execPromise(`npm search "${query}" --json`),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('npm search command timeout')), 30000)
  )
]) as { stdout: string; stderr: string };
```

### 3. 重试机制 🔄

**主程序重试**：
```javascript
// 主启动程序重试机制
async function main() {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  while (retryCount < maxRetries) {
    try {
      const server = new NpmSearchServer(registryUrl);
      await server.run();
      logger.info('NPM Search MCP Server started successfully');
      break;
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        logger.error('Max retry attempts reached. Exiting...');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}
```

**搜索工具重试**：
```javascript
// 搜索工具重试机制
async execute(args: any): Promise<any> {
  let retryCount = 0;
  const maxRetries = 2;
  const retryDelay = 1000; // 1秒
  
  while (retryCount <= maxRetries) {
    try {
      const result = await this.npmService.searchPackages(query, options);
      return result;
    } catch (error) {
      retryCount++;
      if (retryCount > maxRetries) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message} (after ${maxRetries + 1} attempts)` }],
          isError: true,
        };
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}
```

## 错误处理和日志记录

### 1. 配置警告过滤 🚨

**问题**: npm配置警告被当作错误处理
**解决方案**:
```javascript
// 过滤npm配置警告
const npmConfigWarnings = [
  'Unknown user config "auto-install-peers"',
  'Unknown user config "ELECTRON_MIRROR"',
  'Unknown user config "store-dir"',
  'Unknown user config "strict-peer-dependencies"',
  'Unknown user config "run"',
  'Unknown user config "electron_mirror"',
  'Unknown user config "home"',
  'Unknown user config "is-current"'
];

const hasOnlyConfigWarnings = stderr && npmConfigWarnings.some(warning => stderr.includes(warning));

if (stderr && hasOnlyConfigWarnings) {
  // 忽略这些警告，继续执行
} else if (stderr && !stderr.includes('WARN')) {
  throw new Error(`npm search error: ${stderr}`);
}
```

### 2. 统一错误处理 📊

**错误分类处理**:
```javascript
// 超时错误特殊处理
if (error instanceof Error && error.name === 'AbortError') {
  logger.error(`NPM API request timeout for query: ${query}`);
  throw new Error(`NPM API request timeout: ${query}`);
}

if (error instanceof Error && error.message === 'npm search command timeout') {
  logger.error(`npm search command timeout for query: ${query}`);
  throw new Error(`npm search command timeout: ${query}`);
}
```

### 3. 日志记录最佳实践 📝

**统一日志格式**:
```javascript
export class Logger {
  info(message: string, ...args: any[]): void {
    console.error(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }
  
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }
  
  warn(message: string, ...args: any[]): void {
    console.error(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }
  
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}
```

## 开发最佳实践

### 1. TypeScript配置优化 📝

**推荐配置**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 2. 包管理配置 📦

**package.json关键配置**:
```json
{
  "type": "module",
  "bin": {
    "your-mcp-server": "dist/src/index.js"
  },
  "os": ["darwin", "linux", "win32"],
  "scripts": {
    "build": "tsc && shx chmod +x dist/src/index.js",
    "postbuild": "node scripts/create-windows-wrapper.js",
    "prepare": "npm run build",
    "clean": "shx rm -rf dist"
  },
  "files": ["dist", "README.md", "LICENSE"]
}
```

### 3. 环境变量处理 🌍

**支持的环境变量**:
```javascript
// 支持通过环境变量配置NPM registry
const registryUrl = process.env.NPM_REGISTRY_URL || undefined;

// 环境变量示例
{
  "env": {
    "NODE_ENV": "production",
    "NPM_REGISTRY_URL": "https://registry.npmjs.org"
  }
}
```

### 4. 混合模式支持 🔄

**CLI模式 vs API模式**:
```javascript
constructor(registryUrl?: string) {
  // 混合模式逻辑：
  // 1. 如果没有指定registryUrl，使用CLI模式（保持原有行为）
  // 2. 如果指定了registryUrl，使用API模式（新功能）
  this.useCliMode = !registryUrl && !process.env.NPM_REGISTRY_URL;

  if (!this.useCliMode) {
    const customRegistry = registryUrl || process.env.NPM_REGISTRY_URL;
    this.baseUrl = customRegistry
      ? `${customRegistry.replace(/\/$/, '')}/-/v1/search`
      : 'https://registry.npmjs.org/-/v1/search';
  }
}
```

## 构建和部署

### 1. 自动构建流程 🔄

**完整的构建流程**:
```bash
# 1. TypeScript编译
tsc

# 2. 设置Unix权限
shx chmod +x dist/src/index.js

# 3. 创建Windows包装器
node scripts/create-windows-wrapper.js

# 4. 生成的文件结构
dist/src/
├── index.js      # 主入口文件 (Unix/Linux/macOS)
├── index.cmd     # Windows批处理包装器
└── ...           # 其他编译文件
```

### 2. 跨平台测试 🧪

**测试检查清单**:
- [ ] Windows下直接运行 `node dist/src/index.js`
- [ ] Windows下运行批处理文件 `dist/src/index.cmd`
- [ ] 使用npx启动服务器
- [ ] 全局安装后运行
- [ ] MCP客户端连接测试
- [ ] 超时和重试机制测试
- [ ] 错误处理测试

### 3. 发布准备 📦

**发布前检查**:
```json
{
  "scripts": {
    "prepublishOnly": "npm run build && node scripts/pre-publish.js"
  }
}
```

## 常见问题排查

### 1. 命令未找到 🚫

**症状**:
```
'longmo-npm-search-mcp-server' is not recognized as an internal or external command
```

**解决方案**:
1. 检查npm全局bin目录是否在PATH中
   ```bash
   npm config get prefix
   ```
2. 验证全局安装状态
   ```bash
   npm list -g longmo-npm-search-mcp-server
   ```
3. 使用完整路径运行
   ```bash
   node "C:/Users/YourUsername/AppData/Roaming/npm/node_modules/longmo-npm-search-mcp-server/dist/src/index.js"
   ```

### 2. 权限错误 🔒

**症状**:
```
Error: EACCES: permission denied
```

**解决方案**:
1. 以管理员身份运行命令提示符
2. 检查文件系统权限
3. 验证npm配置
4. 重新安装包

### 3. 网络连接问题 🌐

**症状**:
```
Error: NPM API request timeout
Error: npm search command timeout
```

**解决方案**:
1. 检查防火墙设置
2. 验证代理配置
3. 测试网络连通性
4. 增加超时时间

### 4. MCP连接问题 🔗

**症状**:
```
failed to initialize MCP client for npm-search: transport error: context deadline exceeded
```

**解决方案**:
1. 增加MCP客户端超时设置
2. 优化服务器启动时间
3. 检查stdio通信配置
4. 验证服务器日志

## 性能优化建议

### 1. 启动优化 ⚡

**减少启动时间**:
- 使用ESM模块系统
- 优化依赖导入
- 延迟加载非关键模块
- 预编译TypeScript

### 2. 内存管理 💾

**内存优化**:
- 及时清理超时请求
- 避免内存泄漏
- 使用流式处理大数据
- 限制并发请求数量

### 3. 连接池管理 🔄

**连接池优化**:
- 复用HTTP连接
- 限制并发连接数
- 实现连接健康检查
- 优雅关闭连接

## 总结

通过遵循本指南中的兼容性注意事项和最佳实践，可以确保MCP服务器在Windows环境下稳定运行，同时保持良好的跨平台兼容性。

### 关键要点
1. **正确处理Shebang和路径问题** - 使用批处理包装器和path模块
2. **实施完善的超时和重试机制** - 避免因网络问题导致的服务中断
3. **优化错误处理和日志记录** - 提供详细的诊断信息
4. **创建适当的Windows包装器** - 确保跨平台兼容性
5. **进行充分的跨平台测试** - 验证所有功能在不同系统上的表现

### 推荐的开发流程
1. 在开发过程中使用跨平台工具和库
2. 定期在Windows、Linux和macOS上测试
3. 实施自动化测试覆盖所有平台
4. 监控生产环境中的平台特定问题
5. 及时更新依赖包以获得最新的兼容性修复

这样开发的MCP服务器能够在Windows、Linux和macOS上无缝运行，为用户提供一致的体验。
