export function validateSearchQuery(query: string): void {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query must be a non-empty string');
  }
  
  if (query.trim().length === 0) {
    throw new Error('Search query cannot be empty');
  }
  
  if (query.length > 200) {
    throw new Error('Search query is too long (max 200 characters)');
  }
}

export function validateSearchOptions(options: any): void {
  if (options.limit !== undefined) {
    if (typeof options.limit !== 'number' || options.limit < 1 || options.limit > 100) {
      throw new Error('Limit must be a number between 1 and 100');
    }
  }
  
  if (options.offset !== undefined) {
    if (typeof options.offset !== 'number' || options.offset < 0) {
      throw new Error('Offset must be a non-negative number');
    }
  }
}