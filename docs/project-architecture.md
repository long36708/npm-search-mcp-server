# NPM Search MCP Server 项目架构图

## 项目概览

longmo-npm-search-mcp-server 是一个基于 Model Context Protocol (MCP) 的服务器，提供 NPM 包搜索功能。支持自定义 NPM registry 配置，具有良好的模块化设计和错误处理机制。

## 整体架构图

```mermaid
graph TB
    subgraph "Client Layer 客户端层"
        C1[Claude Desktop]
        C2[MCP Inspector]
        C3[Other MCP Clients]
    end
    
    subgraph "MCP Server Layer MCP服务器层"
        direction TB
        ENTRY[index.ts<br/>入口点] --> SERVER[mcp-server.ts<br/>MCP服务器]
        SERVER --> TOOL[search-tool.ts<br/>搜索工具]
    end
    
    subgraph "Service Layer 服务层"
        TOOL --> SERVICE[hybrid-npm-service.ts<br/>混合NPM服务]
    end
    
    subgraph "Utility Layer 工具层"
        LOGGER[logger.ts<br/>日志工具]
        VALIDATION[validation.ts<br/>验证工具]
        TYPES[types/index.ts<br/>类型定义]
    end
    
    subgraph "External Services 外部服务"
        NPM_REGISTRY[NPM Registry<br/>registry.npmjs.org]
        CUSTOM_REGISTRY[Custom Registry<br/>自定义镜像]
    end
    
    C1 -.-> SERVER
    C2 -.-> SERVER
    C3 -.-> SERVER
    
    SERVICE --> NPM_REGISTRY
    SERVICE --> CUSTOM_REGISTRY
    
    SERVER -.-> LOGGER
    TOOL -.-> LOGGER
    SERVICE -.-> LOGGER
    TOOL -.-> VALIDATION
    
    SERVER -.-> TYPES
    TOOL -.-> TYPES
    SERVICE -.-> TYPES
    
    style ENTRY fill:#e3f2fd
    style SERVER fill:#f3e5f5
    style TOOL fill:#e8f5e8
    style SERVICE fill:#fff3e0
    style LOGGER fill:#fce4ec
    style VALIDATION fill:#fce4ec
    style TYPES fill:#fce4ec
```

## 详细模块架构

```mermaid
graph TB
    subgraph "src/ 源码目录"
        direction TB
        
        subgraph "Entry Point 入口"
            INDEX["index.ts<br/>• 环境变量配置<br/>• 服务器启动<br/>• 错误处理"]
        end
        
        subgraph "server/ 服务器模块"
            MCP_SERVER["mcp-server.ts<br/>• MCP协议实现<br/>• 请求路由<br/>• 工具注册"]
        end
        
        subgraph "tools/ 工具模块"
            SEARCH_TOOL["search-tool.ts<br/>• 工具定义<br/>• 参数验证<br/>• 结果格式化"]
        end
        
        subgraph "services/ 服务模块"
            NPM_SERVICE["npm-service.ts<br/>• NPM API调用<br/>• Registry配置<br/>• 数据转换"]
        end
        
        subgraph "utils/ 工具模块"
            LOGGER_UTIL["logger.ts<br/>• 日志记录<br/>• 错误追踪"]
            VALIDATION_UTIL["validation.ts<br/>• 输入验证<br/>• 参数检查"]
        end
        
        subgraph "types/ 类型定义"
            TYPES_DEF["index.ts<br/>• 接口定义<br/>• 类型声明<br/>• 数据结构"]
        end
    end
    
    INDEX --> MCP_SERVER
    MCP_SERVER --> SEARCH_TOOL
    SEARCH_TOOL --> NPM_SERVICE
    
    SEARCH_TOOL -.-> VALIDATION_UTIL
    NPM_SERVICE -.-> LOGGER_UTIL
    MCP_SERVER -.-> LOGGER_UTIL
    INDEX -.-> LOGGER_UTIL
    
    SEARCH_TOOL -.-> TYPES_DEF
    NPM_SERVICE -.-> TYPES_DEF
    MCP_SERVER -.-> TYPES_DEF
```

## 数据流架构

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Tool as Search Tool
    participant Service as NPM Service
    participant Registry as NPM Registry
    
    Client->>Server: 1. 发送搜索请求
    Server->>Tool: 2. 调用搜索工具
    Tool->>Tool: 3. 验证参数
    Tool->>Service: 4. 执行搜索
    Service->>Registry: 5. API请求
    Registry-->>Service: 6. 返回数据
    Service->>Service: 7. 数据转换
    Service-->>Tool: 8. 返回结果
    Tool->>Tool: 9. 格式化输出
    Tool-->>Server: 10. 返回响应
    Server-->>Client: 11. 发送结果
```

## 配置架构

```mermaid
graph LR
    subgraph "Configuration Sources 配置源"
        ENV[Environment Variables<br/>环境变量]
        ARGS[Constructor Arguments<br/>构造参数]
        DEFAULT[Default Values<br/>默认值]
    end
    
    subgraph "Configuration Flow 配置流"
        ENV --> REGISTRY_CONFIG[Registry Configuration<br/>Registry配置]
        ARGS --> REGISTRY_CONFIG
        DEFAULT --> REGISTRY_CONFIG
    end
    
    subgraph "Registry Options Registry选项"
        REGISTRY_CONFIG --> NPM_OFFICIAL[NPM Official<br/>registry.npmjs.org]
        REGISTRY_CONFIG --> TAOBAO[Taobao Mirror<br/>registry.npmmirror.com]
        REGISTRY_CONFIG --> TENCENT[Tencent Mirror<br/>mirrors.cloud.tencent.com]
        REGISTRY_CONFIG --> CUSTOM[Custom Registry<br/>自定义镜像]
    end
```

## 项目结构

```
npm-search-mcp-server/
├── src/                          # 源码目录
│   ├── index.ts                  # 应用入口点
│   ├── server/                   # 服务器模块
│   │   └── mcp-server.ts         # MCP服务器实现
│   ├── tools/                    # 工具模块
│   │   └── search-tool.ts        # NPM搜索工具
│   ├── services/                 # 服务模块
│   │   └── npm-service.ts        # NPM API服务
│   ├── utils/                    # 工具模块
│   │   ├── logger.ts             # 日志工具
│   │   └── validation.ts         # 验证工具
│   └── types/                    # 类型定义
│       └── index.ts              # 类型声明
├── docs/                         # 文档目录
│   ├── architecture.md           # 架构文档
│   ├── project-architecture.md   # 项目架构图
│   ├── api-reference.md          # API参考
│   ├── quick-start.md            # 快速开始
│   └── usage-guide.md            # 使用指南
├── scripts/                      # 脚本目录
│   └── check-config.js           # 配置检查脚本
├── dist/                         # 编译输出
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript配置
├── Dockerfile                    # Docker配置
└── README.md                     # 项目说明
```

## 核心特性

### 1. 模块化设计
- **分层架构**: 清晰的分层结构，职责分离
- **依赖注入**: 支持配置注入，便于测试和扩展
- **接口抽象**: 良好的类型定义和接口设计

### 2. 配置灵活性
- **环境变量支持**: `NPM_REGISTRY_URL` 环境变量配置
- **多Registry支持**: 支持官方NPM、淘宝镜像、腾讯镜像等
- **运行时配置**: 支持启动时动态配置

### 3. 错误处理
- **统一日志**: 集中的日志管理
- **参数验证**: 输入参数的严格验证
- **异常捕获**: 完善的错误处理机制

### 4. 开发体验
- **TypeScript**: 完整的类型支持
- **热重载**: 开发模式下的自动重载
- **调试支持**: MCP Inspector集成

## 扩展点

### 1. 缓存机制
```typescript
// 可扩展的缓存接口
interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
}
```

### 2. 多工具支持
```typescript
// 工具注册机制
interface ToolRegistry {
  register(tool: Tool): void;
  getTools(): Tool[];
}
```

### 3. 中间件支持
```typescript
// 请求中间件
interface Middleware {
  handle(request: any, next: Function): Promise<any>;
}
```

## 部署架构

```mermaid
graph TB
    subgraph "Development 开发环境"
        DEV_SRC[Source Code] --> DEV_BUILD[npm run dev]
        DEV_BUILD --> DEV_SERVER[Local Server]
    end
    
    subgraph "Production 生产环境"
        PROD_SRC[Source Code] --> PROD_BUILD[npm run build]
        PROD_BUILD --> PROD_DIST[dist/]
        PROD_DIST --> DOCKER[Docker Image]
        DOCKER --> DEPLOY[Deployment]
    end
    
    subgraph "Testing 测试环境"
        TEST_SRC[Source Code] --> TEST_BUILD[npm test]
        TEST_BUILD --> TEST_COVERAGE[Coverage Report]
    end
```

## 性能考虑

1. **请求缓存**: 对频繁搜索的包进行缓存
2. **连接池**: NPM API请求的连接复用
3. **限流机制**: 防止API请求过于频繁
4. **数据压缩**: 大量数据的压缩传输

## 安全考虑

1. **输入验证**: 严格的参数验证和清理
2. **错误信息**: 避免敏感信息泄露
3. **依赖安全**: 定期更新依赖包
4. **网络安全**: HTTPS通信和证书验证