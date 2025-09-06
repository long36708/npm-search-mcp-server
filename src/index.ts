#!/usr/bin/env node

import { NpmSearchServer } from './server/mcp-server.js';
import { logger } from './utils/logger.js';

async function main() {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  while (retryCount < maxRetries) {
    try {
      // 支持通过环境变量配置NPM registry
      // 如果没有设置环境变量，则不传递registryUrl，使用CLI模式继承用户npm配置
      const registryUrl = process.env.NPM_REGISTRY_URL || undefined;

      logger.info(`Starting NPM Search MCP Server (attempt ${retryCount + 1}/${maxRetries})`);

      const server = new NpmSearchServer(registryUrl);
      await server.run();

      logger.info('NPM Search MCP Server started successfully');
      break; // 成功启动，退出重试循环

    } catch (error) {
      retryCount++;
      logger.error(`Failed to start NPM Search MCP Server (attempt ${retryCount}/${maxRetries})`, error as Error);

      if (retryCount >= maxRetries) {
        logger.error('Max retry attempts reached. Exiting...');
        process.exit(1);
      }

      logger.info(`Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

main();
