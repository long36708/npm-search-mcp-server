# NPM Search MCP Server 项目架构优化建议

## 📊 当前项目结构分析

### 现有结构
```
npm-search-mcp-server/
├── index.ts              # 主入口文件 (126行)
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── tsconfig.base.json    # 基础TypeScript配置
├── Dockerfile            # Docker配置
├── smithery.yaml         # Smithery配置
├── README.md             # 项目文档
├── LICENSE               # 许可证
├── logo.png              # 项目标志
├── screenshot.png        # 项目截图
├── .gitignore            # Git忽略文件
├── dist/                 # 构建输出目录
├── docs/                 # 文档目录
│   ├── architecture.md
│   ├── technical-architecture.md
│   ├── deployment-architecture.md
│   ├── usage-guide.md
│   ├── quick-start.md
│   └── api-reference.md
└── node_modules/         # 依赖包
```

## 🎯 架构优化建议

### 1. 源码结构重组

#### 推荐的新结构
```
npm-search-mcp-server/
├── src/                          # 源码目录
│   ├── index.ts                  # 主入口文件
│   ├── server/                   # 服务器相关
│   │   ├── NpmSearchServer.ts    # 主服务器类
│   │   ├── handlers/             # 请求处理器
│   │   │   ├── index.ts
│   │   │   ├── toolHandlers.ts
│   │   │   └── errorHandlers.ts
│   │   └── transport/            # 传输层
│   │       ├── index.ts
│   │       └── stdio.ts
│   ├── tools/                    # 工具实现
│   │   ├── index.ts
│   │   ├── SearchTool.ts
│   │   └── types.ts
│   ├── services/                 # 业务服务
│   │   ├── index.ts
│   │   ├── NpmService.ts
│   │   └── CacheService.ts
│   ├── utils/                    # 工具函数
│   │   ├── index.ts
│   │   ├── validation.ts
│   │   ├── logger.ts
│   │   └── constants.ts
│   └── types/                    # 类型定义
│       ├── index.ts
│       ├── server.ts
│       ├── tools.ts
│       └── npm.ts
├── tests/                        # 测试文件
│   ├── unit/
│   │   ├── server/
│   │   ├── tools/
│   │   └── services/
│   ├── integration/
│   └── fixtures/
├── examples/                     # 示例代码
│   ├── basic-usage.js
│   ├── client-example.ts
│   └── docker-compose.yml
├── scripts/                      # 构建脚本
│   ├── build.js
│   ├── dev.js
│   └── release.js
├── docs/                         # 文档目录
├── dist/                         # 构建输出
├── coverage/                     # 测试覆盖率
├── .github/                      # GitHub配置
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── docs.yml
│   └── ISSUE_TEMPLATE/
├── config/                       # 配置文件
│   ├── jest.config.js
│   ├── eslint.config.js
│   └── prettier.config.js
└── 项目根文件...
```

### 2. 代码重构建议

#### 2.1 主服务器类分离
```typescript
// src/server/NpmSearchServer.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ToolHandlers } from './handlers/toolHandlers.js';
import { ErrorHandlers } from './handlers/errorHandlers.js';
import { Logger } from '../utils/logger.js';

export class NpmSearchServer {
  private server: Server;
  private logger: Logger;
  private toolHandlers: ToolHandlers;

  constructor() {
    this.logger = new Logger();
    this.server = new Server(
      {
        name: 'npm-search-server',
        version: process.env.npm_package_version || '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.toolHandlers = new ToolHandlers();
    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers(): void {
    this.toolHandlers.register(this.server);
  }

  private setupErrorHandling(): void {
    ErrorHandlers.setup(this.server, this.logger);
  }

  async start(): Promise<void> {
    // 启动逻辑
  }

  async stop(): Promise<void> {
    // 停止逻辑
  }
}
```

#### 2.2 工具处理器模块化
```typescript
// src/tools/SearchTool.ts
import { Tool } from '../types/tools.js';
import { NpmService } from '../services/NpmService.js';
import { validateSearchArgs } from '../utils/validation.js';

export class SearchTool implements Tool {
  name = 'search_npm_packages';
  description = 'Search for npm packages';
  
  private npmService: NpmService;

  constructor() {
    this.npmService = new NpmService();
  }

  get inputSchema() {
    return {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
      },
      required: ['query'],
    };
  }

  async execute(args: unknown) {
    const validArgs = validateSearchArgs(args);
    return await this.npmService.search(validArgs.query);
  }
}
```

#### 2.3 服务层抽象
```typescript
// src/services/NpmService.ts
import { exec } from 'child_process';
import util from 'util';
import { Logger } from '../utils/logger.js';
import { CacheService } from './CacheService.js';

const execPromise = util.promisify(exec);

export class NpmService {
  private logger: Logger;
  private cache: CacheService;

  constructor() {
    this.logger = new Logger();
    this.cache = new CacheService();
  }

  async search(query: string): Promise<string> {
    // 检查缓存
    const cached = await this.cache.get(`search:${query}`);
    if (cached) {
      this.logger.info('Cache hit for query:', query);
      return cached;
    }

    try {
      const { stdout, stderr } = await execPromise(`npm search "${query}"`);
      
      if (stderr) {
        throw new Error(`npm search error: ${stderr}`);
      }

      // 缓存结果
      await this.cache.set(`search:${query}`, stdout, 300); // 5分钟缓存
      
      return stdout;
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }
}
```

### 3. 配置文件优化

#### 3.1 环境配置
```typescript
// src/utils/config.ts
export interface Config {
  server: {
    name: string;
    version: string;
    logLevel: string;
  };
  npm: {
    registry: string;
    timeout: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
}

export const config: Config = {
  server: {
    name: process.env.SERVER_NAME || 'npm-search-server',
    version: process.env.npm_package_version || '0.1.0',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  npm: {
    registry: process.env.NPM_REGISTRY || 'https://registry.npmjs.org',
    timeout: parseInt(process.env.NPM_TIMEOUT || '30000'),
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300'),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100'),
  },
};
```

#### 3.2 更新的 package.json
```json
{
  "name": "npm-search-mcp-server",
  "version": "0.1.1",
  "description": "MCP server for searching npm",
  "license": "MIT",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "npm-search-mcp-server": "dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && shx chmod +x dist/*.js",
    "build:watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "prepare": "npm run build",
    "start": "node dist/index.js",
    "clean": "shx rm -rf dist coverage"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.0.1"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^22.10.5",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "shx": "^0.3.4",
    "tsx": "^4.0.0",
    "typescript": "^5.6.2"
  }
}
```

### 4. 测试架构

#### 4.1 单元测试示例
```typescript
// tests/unit/tools/SearchTool.test.ts
import { SearchTool } from '../../../src/tools/SearchTool.js';
import { NpmService } from '../../../src/services/NpmService.js';

jest.mock('../../../src/services/NpmService.js');

describe('SearchTool', () => {
  let searchTool: SearchTool;
  let mockNpmService: jest.Mocked<NpmService>;

  beforeEach(() => {
    searchTool = new SearchTool();
    mockNpmService = jest.mocked(new NpmService());
  });

  describe('execute', () => {
    it('should search for packages successfully', async () => {
      const mockResult = 'express\nreact\nvue';
      mockNpmService.search.mockResolvedValue(mockResult);

      const result = await searchTool.execute({ query: 'web framework' });

      expect(mockNpmService.search).toHaveBeenCalledWith('web framework');
      expect(result).toBe(mockResult);
    });

    it('should handle invalid arguments', async () => {
      await expect(searchTool.execute({})).rejects.toThrow('Invalid search arguments');
    });
  });
});
```

### 5. 开发工具配置

#### 5.1 ESLint 配置
```javascript
// config/eslint.config.js
export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': 'warn',
    },
  },
];
```

#### 5.2 Jest 配置
```javascript
// config/jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### 6. CI/CD 优化

#### 6.1 GitHub Actions 工作流
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run lint
    - run: npm run test:coverage
    - run: npm run build
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 🚀 实施步骤

### 阶段1: 基础重构 (1-2天)
1. 创建新的目录结构
2. 拆分 `index.ts` 为多个模块
3. 添加基础的类型定义
4. 更新构建配置

### 阶段2: 功能增强 (2-3天)
1. 添加缓存服务
2. 实现日志系统
3. 添加配置管理
4. 优化错误处理

### 阶段3: 测试和工具 (2-3天)
1. 添加单元测试
2. 配置代码质量工具
3. 设置CI/CD流程
4. 完善文档

### 阶段4: 高级功能 (可选)
1. 添加更多搜索工具
2. 实现插件系统
3. 添加监控和指标
4. 性能优化

## 📈 预期收益

### 代码质量
- ✅ 更好的模块化和可维护性
- ✅ 类型安全和错误处理
- ✅ 测试覆盖率提升
- ✅ 代码复用性增强

### 开发体验
- ✅ 更快的开发和调试
- ✅ 自动化的代码质量检查
- ✅ 完善的文档和示例
- ✅ 标准化的开发流程

### 项目管理
- ✅ 清晰的项目结构
- ✅ 自动化的CI/CD流程
- ✅ 版本管理和发布流程
- ✅ 社区贡献友好

这个优化方案将显著提升项目的可维护性、扩展性和开发体验！