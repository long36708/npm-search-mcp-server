# NPM Search MCP Server 使用指南

## 概述

NPM Search MCP Server 是一个基于 Model Context Protocol (MCP) 的服务器，允许您通过 MCP 客户端搜索 npm 包。本指南将详细介绍如何安装、配置和使用该服务器。

## 安装方式

### 1. 通过 Smithery 安装（推荐）

Smithery 是一个 MCP 服务器管理工具，可以自动安装和配置：

```bash
npx -y @smithery/cli install npm-search-mcp-server --client claude
```

### 2. 通过 NPM 全局安装

```bash
# 全局安装
npm install -g npm-search-mcp-server

# 运行服务器
npm-search-mcp-server
```

### 3. 通过 NPX 直接运行

```bash
npx -y npm-search-mcp-server
```

### 4. 使用 UV 包管理器

```bash
# 使用 uvx 直接运行
uvx npm-search-mcp-server
```

## 客户端配置

### Claude Desktop 配置

在 Claude Desktop 的配置文件中添加以下配置：

#### 使用 NPX（推荐）
```json
{
  "mcpServers": {
    "npm-search": {
      "command": "npx",
      "args": ["-y", "npm-search-mcp-server"]
    }
  }
}
```

#### 使用全局安装
```json
{
  "mcpServers": {
    "npm-search": {
      "command": "npm-search-mcp-server"
    }
  }
}
```

#### 使用 UV
```json
{
  "mcpServers": {
    "npm-search": {
      "command": "uvx",
      "args": ["npm-search-mcp-server"]
    }
  }
}
```

### Zed 编辑器配置

在 Zed 的 `settings.json` 文件中添加：

```json
{
  "context_servers": {
    "npm-search-mcp-server": {
      "command": "npx",
      "args": ["-y", "npm-search-mcp-server"]
    }
  }
}
```

### VS Code 配置

如果使用支持 MCP 的 VS Code 扩展：

```json
{
  "mcp.servers": {
    "npm-search": {
      "command": "npx",
      "args": ["-y", "npm-search-mcp-server"],
      "env": {}
    }
  }
}
```

## 可用工具

### search_npm_packages

搜索 npm 包的主要工具。

#### 参数
- `query` (string, 必需): 搜索查询字符串

#### 示例请求
```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "express"
  }
}
```

#### 示例响应
```
NAME                      | DESCRIPTION                           | AUTHOR          | DATE       | VERSION  | KEYWORDS
express                   | Fast, unopinionated, minimalist...   | =mikeal...      | 2021-03-25 | 4.17.3   | express framework sinatra web rest restful router app api
express-generator         | Express' application generator        | =mikeal...      | 2020-02-18 | 4.16.1   | express generator framework web app
express-session           | Simple session middleware for Express | =dougwilson...  | 2021-01-15 | 1.17.1   | express session middleware
```

## 使用示例

### 基本搜索

#### 搜索特定包
```
用户: "搜索 express 包"
Claude: 我来为您搜索 express 相关的 npm 包。
```

#### 搜索框架
```
用户: "找一些 React 相关的包"
Claude: 我来搜索 React 相关的 npm 包。
```

#### 搜索工具类库
```
用户: "搜索日期处理的库"
Claude: 我来搜索日期处理相关的 npm 包。
```

### 高级搜索技巧

#### 使用关键词搜索
```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "web framework"
  }
}
```

#### 搜索特定作者的包
```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "author:sindresorhus"
  }
}
```

#### 搜索特定关键词
```json
{
  "name": "search_npm_packages",
  "arguments": {
    "query": "keywords:cli"
  }
}
```

## 常见使用场景

### 1. 项目依赖选择

当您需要为项目选择合适的依赖时：

```
用户: "我需要一个 HTTP 客户端库，帮我搜索一下"
Claude: 我来为您搜索 HTTP 客户端相关的 npm 包。
```

### 2. 技术栈研究

研究特定技术栈的生态系统：

```
用户: "搜索 Vue.js 相关的 UI 组件库"
Claude: 我来搜索 Vue.js UI 组件库相关的包。
```

### 3. 工具发现

寻找开发工具和实用程序：

```
用户: "找一些代码格式化的工具"
Claude: 我来搜索代码格式化相关的工具。
```

### 4. 学习和探索

探索新的技术和库：

```
用户: "最近有什么流行的前端框架吗？"
Claude: 我来搜索一些流行的前端框架。
```

## 搜索结果解读

### 结果字段说明

- **NAME**: 包名称
- **DESCRIPTION**: 包描述
- **AUTHOR**: 包作者
- **DATE**: 最后更新日期
- **VERSION**: 当前版本
- **KEYWORDS**: 相关关键词

### 如何选择合适的包

1. **查看描述**: 确保包的功能符合您的需求
2. **检查作者**: 知名作者通常意味着更好的维护
3. **查看更新日期**: 最近更新的包通常更活跃
4. **版本号**: 稳定版本（1.0+）通常更可靠
5. **关键词**: 帮助理解包的用途和特性

## 故障排除

### 常见问题

#### 1. 服务器无法启动
```bash
# 检查 Node.js 版本
node --version

# 确保版本 >= 16.0.0
# 如果版本过低，请升级 Node.js
```

#### 2. 搜索结果为空
- 检查网络连接
- 确认搜索查询是否正确
- 尝试使用更通用的关键词

#### 3. 权限错误
```bash
# 如果遇到权限问题，尝试使用 sudo（仅限 Linux/macOS）
sudo npm install -g npm-search-mcp-server
```

#### 4. 配置文件问题
- 确保 JSON 格式正确
- 检查文件路径是否存在
- 重启客户端应用

### 调试模式

使用 MCP Inspector 进行调试：

```bash
# 使用 npx 安装的情况
npx @modelcontextprotocol/inspector npx -y npm-search-mcp-server

# 本地开发调试
cd /path/to/npm-search-mcp-server
npx @modelcontextprotocol/inspector node dist/index.js
```

### 日志查看

服务器运行时会输出日志信息：

```
Npm Search MCP server running on stdio
[MCP Error] 错误信息...
```

## 性能优化

### 搜索优化建议

1. **使用具体的关键词**: 避免过于宽泛的搜索
2. **组合关键词**: 使用多个关键词缩小搜索范围
3. **利用 npm 搜索语法**: 使用 `author:`, `keywords:` 等前缀

### 缓存机制

npm search 命令本身具有缓存机制，重复搜索会更快。

## 安全注意事项

1. **验证包来源**: 安装前检查包的作者和仓库
2. **查看下载量**: 高下载量通常意味着更可信
3. **检查许可证**: 确保许可证符合您的项目需求
4. **审查依赖**: 注意包的依赖关系

## 最佳实践

### 搜索策略

1. **从通用到具体**: 先用宽泛关键词，再细化搜索
2. **多角度搜索**: 尝试不同的关键词组合
3. **关注维护状态**: 选择活跃维护的包
4. **考虑包大小**: 避免过大的依赖包

### 集成建议

1. **定期更新**: 保持服务器版本最新
2. **监控性能**: 注意搜索响应时间
3. **备份配置**: 保存客户端配置文件
4. **文档记录**: 记录常用的搜索查询

## 扩展功能

### 自定义搜索

虽然当前版本只支持基本搜索，但您可以：

1. **组合多次搜索**: 使用不同关键词进行多次搜索
2. **后处理结果**: 在客户端进一步过滤结果
3. **保存常用查询**: 记录常用的搜索模式

### 与其他工具集成

- **包管理器**: 结合 npm、yarn、pnpm 使用
- **IDE 插件**: 在开发环境中直接搜索
- **CI/CD**: 在构建流程中验证依赖

## 社区和支持

### 获取帮助

- **GitHub Issues**: 报告问题和建议
- **文档**: 查看最新文档
- **社区**: 参与 MCP 社区讨论

### 贡献指南

欢迎贡献代码和改进建议：

1. Fork 项目仓库
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 更新日志

### 版本 0.1.1
- 基本搜索功能
- MCP 协议支持
- 多客户端兼容

### 未来计划
- 包详情查询
- 版本历史查看
- 依赖关系分析
- 安全漏洞检查