# NPM Search MCP Server 快速开始

## 5分钟快速上手

### 第一步：安装

选择以下任一方式安装：

```bash
# 方式1：通过 Smithery（最简单）
npx -y @smithery/cli install npm-search-mcp-server --client claude

# 方式2：直接使用 npx（无需安装）
npx -y npm-search-mcp-server

# 方式3：全局安装
npm install -g npm-search-mcp-server
```

### 第二步：配置客户端

#### Claude Desktop 配置

1. 打开 Claude Desktop 设置
2. 找到 MCP 服务器配置
3. 添加以下配置：

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

4. 重启 Claude Desktop

### 第三步：开始使用

在 Claude 中输入以下任一指令：

```
搜索 express 包
找一些 React 相关的库
我需要一个 HTTP 客户端库
搜索日期处理的工具
```

## 常用搜索示例

### Web 开发
```
搜索 web 框架
找一些 API 开发的库
搜索前端构建工具
```

### 工具类库
```
搜索 lodash 替代品
找一些测试框架
搜索代码格式化工具
```

### 特定技术栈
```
搜索 Vue 组件库
找一些 Node.js 中间件
搜索 TypeScript 工具
```

## 搜索技巧

### 使用关键词
- `web framework` - 搜索 web 框架
- `cli tool` - 搜索命令行工具
- `testing library` - 搜索测试库

### 使用作者筛选
- `author:sindresorhus` - 搜索特定作者的包
- `author:facebook` - 搜索 Facebook 的包

### 使用关键词标签
- `keywords:react` - 搜索带有 react 标签的包
- `keywords:cli` - 搜索命令行工具

## 故障排除

### 问题：服务器无法连接
**解决方案：**
1. 检查网络连接
2. 确认 Node.js 版本 >= 16
3. 重启客户端应用

### 问题：搜索无结果
**解决方案：**
1. 尝试更通用的关键词
2. 检查拼写是否正确
3. 使用英文关键词搜索

### 问题：配置不生效
**解决方案：**
1. 检查 JSON 格式是否正确
2. 确认配置文件路径
3. 完全重启客户端

## 下一步

- 查看 [完整使用指南](./usage-guide.md)
- 了解 [技术架构](./technical-architecture.md)
- 参与 [项目贡献](../README.md#contributing)