import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { HybridNpmService } from '../services/hybrid-npm-service.js';
import { validateSearchQuery, validateSearchOptions } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

export class SearchTool {
  private npmService: HybridNpmService;

  constructor(registryUrl?: string) {
    this.npmService = new HybridNpmService(registryUrl);
  }

  getTool(): Tool {
    return {
      name: 'search_npm_packages',
      description: 'Search for npm packages',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
        },
        required: ['query'],
      },
    };
  }

  async execute(args: any): Promise<any> {
    let retryCount = 0;
    const maxRetries = 2;
    const retryDelay = 1000; // 1秒

    while (retryCount <= maxRetries) {
      try {
        const { query } = args;

        validateSearchQuery(query);
        validateSearchOptions(args);

        logger.info(`Executing search tool (attempt ${retryCount + 1}/${maxRetries + 1}): ${query}`);

        const result = await this.npmService.searchPackages(query, {
          limit: args.limit,
          offset: args.offset,
          sortBy: args.sortBy,
        });

        // 添加模式信息到结果中
        const resultWithMode = {
          ...result,
          mode: this.npmService.getMode(),
          registry: this.npmService.getRegistryInfo(),
        };

        logger.info(`Search completed successfully for query: ${query}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resultWithMode, null, 2),
            },
          ],
        };
      } catch (error) {
        retryCount++;
        logger.error(`Error in search tool execution (attempt ${retryCount}/${maxRetries + 1})`, error as Error);

        if (retryCount > maxRetries) {
          logger.error(`Max retry attempts reached for query: ${args.query}`);
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${(error as Error).message} (after ${maxRetries + 1} attempts)`,
              },
            ],
            isError: true,
          };
        }

        logger.info(`Retrying search in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // 这个返回理论上不会到达，但为了TypeScript类型安全
    return {
      content: [
        {
          type: 'text',
          text: 'Unexpected error in search tool',
        },
      ],
      isError: true,
    };
  }

  getServiceMode(): 'cli' | 'api' {
    return this.npmService.getMode();
  }

  getRegistryInfo(): string {
    return this.npmService.getRegistryInfo();
  }
}
