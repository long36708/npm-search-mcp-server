export interface NpmPackage {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  author?: string | { name: string; email?: string };
  maintainers?: Array<{ name: string; email?: string }>;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  license?: string;
  publishedAt?: string;
  downloads?: {
    weekly?: number;
    monthly?: number;
  };
  score?: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'popularity' | 'quality' | 'maintenance';
}

export interface SearchResult {
  packages: NpmPackage[];
  total: number;
  time: string;
}