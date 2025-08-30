import { NpmPackage, SearchOptions, SearchResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class NpmService {
  private readonly baseUrl = 'https://registry.npmjs.org/-/v1/search';
  
  async searchPackages(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const { limit = 20, offset = 0, sortBy = 'relevance' } = options;
    
    const searchParams = new URLSearchParams({
      text: query,
      size: limit.toString(),
      from: offset.toString(),
    });
    
    const url = `${this.baseUrl}?${searchParams}`;
    
    try {
      logger.info(`Searching NPM packages: ${query}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NPM API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const packages: NpmPackage[] = data.objects?.map((item: any) => ({
        name: item.package.name,
        version: item.package.version,
        description: item.package.description,
        keywords: item.package.keywords,
        author: item.package.author,
        maintainers: item.package.maintainers,
        homepage: item.package.links?.homepage,
        repository: item.package.links?.repository,
        license: item.package.license,
        publishedAt: item.package.date,
        downloads: {
          weekly: item.downloads?.weekly,
          monthly: item.downloads?.monthly,
        },
        score: item.score,
      })) || [];
      
      logger.info(`Found ${packages.length} packages for query: ${query}`);
      
      return {
        packages,
        total: data.total || 0,
        time: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error searching NPM packages: ${query}`, error as Error);
      throw error;
    }
  }
}