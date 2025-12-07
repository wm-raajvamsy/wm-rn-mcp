/**
 * Tool: search_lifecycle_hooks
 * Searches for lifecycle hook patterns and implementations
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchLifecycleHooksTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    hookType?: 'mount' | 'unmount' | 'update' | 'render' | 'all';
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 15;
    
    try {
      const searches: Array<() => Promise<string[]>> = [];
      
      // Hook type specific searches
      if (args.hookType === 'mount' || args.hookType === 'all') {
        searches.push(
          () => this.grep('componentDidMount', this.runtimePath),
          () => this.grep('componentWillMount', this.runtimePath)
        );
      }
      
      if (args.hookType === 'unmount' || args.hookType === 'all') {
        searches.push(
          () => this.grep('componentWillUnmount', this.runtimePath)
        );
      }
      
      if (args.hookType === 'update' || args.hookType === 'all') {
        searches.push(
          () => this.grep('componentDidUpdate', this.runtimePath),
          () => this.grep('shouldComponentUpdate', this.runtimePath),
          () => this.grep('componentWillUpdate', this.runtimePath)
        );
      }
      
      if (args.hookType === 'render' || args.hookType === 'all') {
        searches.push(
          () => this.grep('renderWidget', this.runtimePath),
          () => this.grep('render\\(', this.runtimePath)
        );
      }
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Rank by relevance
      const keywords = ['lifecycle', 'component', 'hook', 'mount', 'unmount', 'update', 'render'];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      // Get file details
      const filesWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => ({
          path: file.path,
          relevance: file.score,
          preview: await this.getPreview(file.path, 400),
          lineCount: this.countLines(await this.read(file.path)),
          type: this.getFileType(file.path)
        }))
      );
      
      return {
        success: true,
        data: {
          files: filesWithDetails,
          hookType: args.hookType || 'all',
          keywords
        },
        meta: {
          domain: 'lifecycle',
          searchStrategy: 'hook-type-specific',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'lifecycle',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchLifecycleHooks(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchLifecycleHooksTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

