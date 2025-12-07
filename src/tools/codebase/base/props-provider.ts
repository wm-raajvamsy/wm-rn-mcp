/**
 * Tool: search_props_provider
 * Searches for PropsProvider implementation and property system
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchPropsProviderTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 10;
    
    try {
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('PropsProvider', this.runtimePath),
        () => this.grep('class.*PropsProvider', this.runtimePath),
        () => this.grep('getProperty|setProperty', this.runtimePath),
        () => this.grep('props\\.provider', this.runtimePath),
        () => this.find('*props-provider*', this.runtimePath),
        () => this.find('*PropsProvider*', this.runtimePath)
      ];
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Rank by relevance
      const keywords = ['propsprovider', 'props', 'provider', 'property', 'getproperty', 'setproperty'];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      // Get file details
      const filesWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => ({
          path: file.path,
          relevance: file.score,
          preview: await this.getPreview(file.path, 500),
          lineCount: this.countLines(await this.read(file.path)),
          type: this.getFileType(file.path)
        }))
      );
      
      return {
        success: true,
        data: {
          files: filesWithDetails,
          keywords
        },
        meta: {
          domain: 'props-provider',
          searchStrategy: 'class-and-method-pattern',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'props-provider',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchPropsProvider(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchPropsProviderTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

