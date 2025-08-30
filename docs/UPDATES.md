# longmo-npm-search-mcp-server 项目更新说明

## 最新更新 (v0.1.1)

### 🔄 重构完成

项目已从单体架构重构为模块化架构，主要变更：

#### 1. 架构变更
- **原架构**: 单一 `index.ts` 文件（126行）
- **新架构**: 模块化结构，分离关注点

```
src/
├── index.ts              # 应用程序入口点
├── types/index.ts        # TypeScript类型定义
├── utils/                # 工具函数
├── services/             # 服务层
├── tools/                # MCP工具实现
└── server/               # MCP服务器核心
```

#### 2. 入口文件变更
- **重要**: bin路径已更新为 `dist/src/index.js`
- **原路径**: `dist/index.js` (已废弃)
- **新路径**: `dist/src/index.js` (当前使用)

#### 3. 新增调试功能

```bash
# MCP Inspector 图形界面调试
npm run debug

# 命令行调试
npm run debug:stdio

# 快速测试
npm run test:mcp
```

#### 4. 手动调试命令

```bash
# 测试工具列表
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | node dist/src/index.js

# 测试搜索功能
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "search_npm_packages", "arguments": {"query": "react"}}}' | node dist/src/index.js
```

### ✅ 验证结果

重构后的服务器已通过完整测试：

- ✅ MCP协议初始化正常
- ✅ 工具列表查询成功
- ✅ NPM搜索功能完全正常
- ✅ 日志记录工作正常
- ✅ 错误处理机制完善

### 📚 文档更新

- ✅ 创建了更新版使用指南: `docs/usage-guide-updated.md`
- ✅ 更新了README.md中的使用说明
- ✅ 添加了完整的调试命令说明

### 🚀 使用建议

1. **开发调试**: 使用 `npm run debug` 启动MCP Inspector
2. **命令行测试**: 使用 `npm run debug:stdio` 进行快速测试
3. **生产使用**: 直接运行 `node dist/src/index.js`

### 📋 待办事项

- [ ] 添加单元测试
- [ ] 实现缓存机制
- [ ] 添加更多搜索选项
- [ ] 性能优化

---

**注意**: 如果您之前使用的是旧版本，请确保更新您的配置以使用新的入口路径 `dist/src/index.js`。