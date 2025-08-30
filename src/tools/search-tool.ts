import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { NpmService } from '../services/npm-service.js';
import { validateSearchQuery, validateSearchOptions } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

export class SearchTool {
  private npmService: NpmService;
  
  constructor() {
    this.npmService = new NpmService();
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
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
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
}