#!/usr/bin/env node

/**
 * 项目架构重构脚本
 * 自动化重组项目结构并迁移代码
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 新的目录结构
const directories = [
  'src',
  'src/server',
  'src/server/handlers',
  'src/server/transport',
  'src/tools',
  'src/services',
  'src/utils',
  'src/types',
  'tests',
  'tests/unit',
  'tests/unit/server',
  'tests/unit/tools',
  'tests/unit/services',
  'tests/integration',
  'tests/fixtures',
  'examples',
  'scripts',
  'config',
  '.github',
  '.github/workflows',
  '.github/ISSUE_TEMPLATE'
];

// 文件模板
const templates = {
  'src/types/index.ts': `export * from './server.js';
export * from './tools.js';
export * from './npm.js';
`,

  'src/types/server.ts': `export interface ServerConfig {
  name: string;
  version: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ServerCapabilities {
  tools: Record<string, unknown>;
}
`,

  'src/types/tools.ts': `export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(args: unknown): Promise<unknown>;
}

export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}
`,

  'src/types/npm.ts': `export interface SearchArgs {
  query: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  keywords: string[];
}
`,

  'src/utils/logger.ts': `export class Logger {
  private level: string;

  constructor(level = 'info') {
    this.level = level;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(\`[DEBUG] \${message}\`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(\`[INFO] \${message}\`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(\`[WARN] \${message}\`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(\`[ERROR] \${message}\`, ...args);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}
`,

  'src/utils/validation.ts': `import { SearchArgs } from '../types/npm.js';

export const isValidSearchArgs = (args: unknown): args is SearchArgs => {
  return (
    typeof args === 'object' &&
    args !== null &&
    typeof (args as SearchArgs).query === 'string'
  );
};

export const validateSearchArgs = (args: unknown): SearchArgs => {
  if (!isValidSearchArgs(args)) {
    throw new Error('Invalid search arguments');
  }
  return args;
};
`,

  'src/utils/constants.ts': `export const DEFAULT_SERVER_CONFIG = {
  name: 'npm-search-server',
  version: '0.1.0',
  logLevel: 'info' as const,
};

export const DEFAULT_CACHE_TTL = 300; // 5 minutes
export const DEFAULT_NPM_TIMEOUT = 30000; // 30 seconds
`,

  'config/jest.config.js': `export default {
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
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
`,

  'config/prettier.config.js': `export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
};
`,

  '.github/workflows/ci.yml': `name: CI

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
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run lint
    - run: npm run test:coverage
    - run: npm run build
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/
`,

  'examples/basic-usage.js': `#!/usr/bin/env node

/**
 * 基本使用示例
 */

import { NpmSearchServer } from '../dist/server/NpmSearchServer.js';

async function main() {
  const server = new NpmSearchServer();
  
  try {
    console.log('Starting NPM Search MCP Server...');
    await server.start();
    console.log('Server started successfully!');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
`,

  'tests/unit/tools/SearchTool.test.ts': `import { SearchTool } from '../../../src/tools/SearchTool.js';

describe('SearchTool', () => {
  let searchTool: SearchTool;

  beforeEach(() => {
    searchTool = new SearchTool();
  });

  describe('constructor', () => {
    it('should initialize with correct name and description', () => {
      expect(searchTool.name).toBe('search_npm_packages');
      expect(searchTool.description).toBe('Search for npm packages');
    });
  });

  describe('inputSchema', () => {
    it('should have correct schema', () => {
      const schema = searchTool.inputSchema;
      expect(schema.type).toBe('object');
      expect(schema.properties.query).toBeDefined();
      expect(schema.required).toContain('query');
    });
  });

  describe('execute', () => {
    it('should validate arguments', async () => {
      await expect(searchTool.execute({})).rejects.toThrow('Invalid search arguments');
      await expect(searchTool.execute({ query: 123 })).rejects.toThrow('Invalid search arguments');
    });
  });
});
`
};

async function createDirectories() {
  console.log('Creating directory structure...');
  
  for (const dir of directories) {
    const dirPath = path.join(projectRoot, dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(\`✓ Created directory: \${dir}\`);
    } catch (error) {
      console.error(\`✗ Failed to create directory \${dir}:\`, error.message);
    }
  }
}

async function createTemplateFiles() {
  console.log('\\nCreating template files...');
  
  for (const [filePath, content] of Object.entries(templates)) {
    const fullPath = path.join(projectRoot, filePath);
    try {
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(\`✓ Created file: \${filePath}\`);
    } catch (error) {
      console.error(\`✗ Failed to create file \${filePath}:\`, error.message);
    }
  }
}

async function moveExistingFiles() {
  console.log('\\nMoving existing files...');
  
  const moves = [
    { from: 'index.ts', to: 'src/index.ts' }
  ];
  
  for (const { from, to } of moves) {
    const fromPath = path.join(projectRoot, from);
    const toPath = path.join(projectRoot, to);
    
    try {
      const exists = await fs.access(fromPath).then(() => true).catch(() => false);
      if (exists) {
        await fs.rename(fromPath, toPath);
        console.log(\`✓ Moved \${from} to \${to}\`);
      }
    } catch (error) {
      console.error(\`✗ Failed to move \${from} to \${to}:\`, error.message);
    }
  }
}

async function updatePackageJson() {
  console.log('\\nUpdating package.json...');
  
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // 更新脚本
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev": "tsx watch src/index.ts",
      "build": "tsc && shx chmod +x dist/*.js",
      "build:watch": "tsc --watch",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "lint": "eslint src/**/*.ts",
      "lint:fix": "eslint src/**/*.ts --fix",
      "format": "prettier --write src/**/*.ts",
      "start": "node dist/index.js",
      "clean": "shx rm -rf dist coverage"
    };
    
    // 更新入口点
    packageJson.main = "dist/index.js";
    
    // 添加开发依赖
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@types/jest": "^29.5.0",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      "@typescript-eslint/parser": "^6.0.0",
      "eslint": "^8.0.0",
      "jest": "^29.5.0",
      "prettier": "^3.0.0",
      "tsx": "^4.0.0"
    };
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✓ Updated package.json');
  } catch (error) {
    console.error('✗ Failed to update package.json:', error.message);
  }
}

async function updateTsConfig() {
  console.log('\\nUpdating TypeScript configuration...');
  
  const tsConfig = {
    "extends": "./tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src"
    },
    "include": [
      "src/**/*.ts"
    ],
    "exclude": [
      "node_modules",
      "dist",
      "tests"
    ]
  };
  
  try {
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    console.log('✓ Updated tsconfig.json');
  } catch (error) {
    console.error('✗ Failed to update tsconfig.json:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting project architecture refactoring...\\n');
  
  try {
    await createDirectories();
    await createTemplateFiles();
    await moveExistingFiles();
    await updatePackageJson();
    await updateTsConfig();
    
    console.log('\\n✅ Project refactoring completed successfully!');
    console.log('\\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run build');
    console.log('3. Run: npm test');
    console.log('4. Review and customize the generated files');
    console.log('5. Update imports in existing code');
    
  } catch (error) {
    console.error('\\n❌ Refactoring failed:', error.message);
    process.exit(1);
  }
}

main();