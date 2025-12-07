/**
 * Tool: search_css_to_rn
 * Searches for CSS to React Native style transformation logic
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchCssToRnTool extends CodebaseTool {
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
        () => this.grep('css.*react.*native|css.*rn', this.codegenPath),
        () => this.grep('convertCss|transformCss|parseCss', this.codegenPath),
        () => this.grep('StyleSheet.*create', this.codegenPath),
        () => this.grep('cssToRN|css2rn', this.codegenPath),
        () => this.find('*css*transform*', this.codegenPath),
        () => this.find('*css*parser*', this.codegenPath),
        () => this.find('*style*converter*', this.codegenPath)
      ];
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Rank by relevance
      const keywords = ['css', 'transform', 'convert', 'react-native', 'stylesheet', 'parser'];
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
          domain: 'css-to-rn',
          searchStrategy: 'transformation-pattern-matching',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'css-to-rn',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchCssToRn(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchCssToRnTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

