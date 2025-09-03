#!/usr/bin/env node

import { NpmSearchServer } from './server/mcp-server.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // 支持通过环境变量配置NPM registry，默认使用npm官方API避免配置警告
    const registryUrl = process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org';
    const server = new NpmSearchServer(registryUrl);
    await server.run();
  } catch (error) {
    logger.error('Failed to start NPM Search MCP Server', error as Error);
    process.exit(1);
  }
}

main();
