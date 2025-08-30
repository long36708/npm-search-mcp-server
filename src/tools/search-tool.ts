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
    try {
      const { query } = args;
      
      validateSearchQuery(query);
      validateSearchOptions(args);
      
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
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(resultWithMode, null, 2),
          },
        ],
      };
    } catch (error) {
      logger.error('Error in search tool execution', error as Error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
  
  getServiceMode(): 'cli' | 'api' {
    return this.npmService.getMode();
  }
  
  getRegistryInfo(): string {
    return this.npmService.getRegistryInfo();
  }
}