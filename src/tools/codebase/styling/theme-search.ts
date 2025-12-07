/**
 * Tool: search_theme_compilation
 * Searches for theme compilation and processing logic
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchThemeCompilationTool extends CodebaseTool {
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
        () => this.grep('ThemeService|theme-service', this.codegenPath),
        () => this.grep('compileTheme|compile-theme', this.codegenPath),
        () => this.grep('theme.*compilation', this.codegenPath),
        () => this.grep('processTheme|process-theme', this.codegenPath),
        () => this.find('*theme*service*', this.codegenPath),
        () => this.find('*theme*compile*', this.codegenPath),
        // Also search runtime for theme application
        () => this.grep('applyTheme|theme.*apply', this.runtimePath),
        () => this.find('*theme*', this.runtimePath + '/core')
      ];
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Rank by relevance
      const keywords = ['theme', 'compile', 'compilation', 'service', 'process', 'apply'];
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
          domain: 'theme-compilation',
          searchStrategy: 'service-pattern + compilation-keywords',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'theme-compilation',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchThemeCompilation(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchThemeCompilationTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

