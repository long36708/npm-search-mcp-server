import { NpmPackage, SearchOptions, SearchResult } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class HybridNpmService {
  private readonly baseUrl?: string;
  private readonly useCliMode: boolean;

  constructor(registryUrl?: string) {
    // 混合模式逻辑：
    // 1. 如果没有指定registryUrl，使用CLI模式（保持原有行为）
    // 2. 如果指定了registryUrl，使用API模式（新功能）
    this.useCliMode = !registryUrl && !process.env.NPM_REGISTRY_URL;

    if (!this.useCliMode) {
      const customRegistry = registryUrl || process.env.NPM_REGISTRY_URL;
      this.baseUrl = customRegistry
        ? `${customRegistry.replace(/\/$/, '')}/-/v1/search`
        : 'https://registry.npmjs.org/-/v1/search';

      logger.info(`Using API mode with registry: ${this.baseUrl}`);
    } else {
      logger.info('Using CLI mode (npm search command) - inherits user npm config');
    }
  }

  async searchPackages(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    if (this.useCliMode) {
      return this.searchWithCli(query, options);
    } else {
      return this.searchWithApi(query, options);
    }
  }

  private async searchWithCli(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const { limit = 20 } = options;

    try {
      logger.info(`Searching NPM packages with CLI: ${query}`);

      // 使用npm search命令，继承用户的npm配置
      const { stdout, stderr } = await execPromise(`npm search "${query}" --json`);

      // 过滤掉npm配置警告信息
      const npmConfigWarnings = [
        'Unknown user config "auto-install-peers"',
        'Unknown user config "ELECTRON_MIRROR"',
        'Unknown user config "store-dir"',
        'Unknown user config "strict-peer-dependencies"',
        'Unknown user config "run"',
        'Unknown user config "electron_mirror"',
        'Unknown user config "home"',
        'Unknown user config "is-current"'
      ];

      // 检查stderr是否只包含已知的配置警告
      const hasOnlyConfigWarnings = stderr && npmConfigWarnings.some(warning => stderr.includes(warning));

      // 如果stderr包含已知的配置警告，忽略它们
      if (stderr && hasOnlyConfigWarnings) {
        // 忽略这些警告，继续执行
      } else if (stderr && !stderr.includes('WARN')) {
        // 如果stderr不包含WARN信息，则抛出错误
        throw new Error(`npm search error: ${stderr}`);
      }

      let packages: NpmPackage[] = [];

      if (stdout.trim()) {
        try {
          const rawData = JSON.parse(stdout);
          packages = this.transformCliResults(rawData, limit);
        } catch (parseError) {
          // 如果JSON解析失败，尝试解析文本格式
          packages = this.parseTextResults(stdout, limit);
        }
      }

      logger.info(`Found ${packages.length} packages for query: ${query}`);

      return {
        packages,
        total: packages.length,
        time: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error searching NPM packages with CLI: ${query}`, error as Error);
      throw error;
    }
  }

  private async searchWithApi(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const { limit = 20, offset = 0 } = options;

    const searchParams = new URLSearchParams({
      text: query,
      size: limit.toString(),
      from: offset.toString(),
    });

    const url = `${this.baseUrl}?${searchParams}`;

    try {
      logger.info(`Searching NPM packages with API: ${query}`);

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
      logger.error(`Error searching NPM packages with API: ${query}`, error as Error);
      throw error;
    }
  }

  private transformCliResults(rawData: any[], limit: number): NpmPackage[] {
    return rawData.slice(0, limit).map((item: any) => ({
      name: item.name,
      version: item.version,
      description: item.description,
      keywords: item.keywords || [],
      author: item.author,
      maintainers: item.maintainers || [],
      homepage: item.homepage,
      repository: item.repository,
      license: item.license,
      publishedAt: item.date,
      downloads: {
        weekly: undefined,
        monthly: undefined,
      },
      score: undefined,
    }));
  }

  private parseTextResults(stdout: string, limit: number): NpmPackage[] {
    // 解析npm search的文本输出格式
    const lines = stdout.split('\n').filter(line => line.trim());
    const packages: NpmPackage[] = [];

    for (const line of lines.slice(0, limit)) {
      const parts = line.split('\t').map(part => part.trim());
      if (parts.length >= 3) {
        packages.push({
          name: parts[0],
          version: parts[1] || 'unknown',
          description: parts[2] || '',
          keywords: [],
          author: undefined,
          maintainers: [],
          homepage: undefined,
          repository: undefined,
          license: undefined,
          publishedAt: undefined,
          downloads: {
            weekly: undefined,
            monthly: undefined,
          },
          score: undefined,
        });
      }
    }

    return packages;
  }

  getMode(): 'cli' | 'api' {
    return this.useCliMode ? 'cli' : 'api';
  }

  getRegistryInfo(): string {
    if (this.useCliMode) {
      return 'CLI mode - uses npm configuration';
    } else {
      return `API mode - ${this.baseUrl}`;
    }
  }
}
