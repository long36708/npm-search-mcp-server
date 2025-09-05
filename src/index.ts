#!/usr/bin/env node

import { NpmSearchServer } from './server/mcp-server.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // 支持通过环境变量配置NPM registry
    // 如果没有设置环境变量，则不传递registryUrl，使用CLI模式继承用户npm配置
    const registryUrl = process.env.NPM_REGISTRY_URL || undefined;
    const server = new NpmSearchServer(registryUrl);
    await server.run();
  } catch (error) {
    logger.error('Failed to start NPM Search MCP Server', error as Error);
    process.exit(1);
  }
}

main();
