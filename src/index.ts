#!/usr/bin/env node

import { NpmSearchServer } from './server/mcp-server.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    const server = new NpmSearchServer();
    await server.run();
  } catch (error) {
    logger.error('Failed to start NPM Search MCP Server', error as Error);
    process.exit(1);
  }
}

main();