import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SearchTool } from '../tools/search-tool.js';
import { logger } from '../utils/logger.js';

export class NpmSearchServer {
  private server: Server;
  private searchTool: SearchTool;

  constructor(registryUrl?: string) {
    this.server = new Server(
      {
        name: 'npm-search-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.searchTool = new SearchTool(registryUrl);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [this.searchTool.getTool()],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'search_npm_packages') {
        return await this.searchTool.execute(args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run(): Promise<void> {
    try {
      const transport = new StdioServerTransport();

      // 添加连接超时处理
      const connectPromise = this.server.connect(transport);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Server connection timeout')), 30000);
      });

      await Promise.race([connectPromise, timeoutPromise]);

      logger.info(`NPM Search MCP Server started in ${this.searchTool.getServiceMode()} mode`);
      logger.info(`Registry info: ${this.searchTool.getRegistryInfo()}`);

      // 添加错误处理监听器
      this.server.onerror = (error) => {
        logger.error('MCP Server error:', error);
      };

    } catch (error) {
      logger.error('Failed to start MCP Server', error as Error);
      throw error;
    }
  }
}
