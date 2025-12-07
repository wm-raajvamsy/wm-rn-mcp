/**
 * Tool: search_css_parser
 * Searches for CSS/LESS parsing logic
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchCssParserTool extends CodebaseTool {
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
        () => this.grep('CssParser|css-parser|LessParser', this.codegenPath),
        () => this.grep('parseCss|parseLess|parse.*css', this.codegenPath),
        () => this.find('*css*parser*', this.codegenPath),
        () => this.find('*less*parser*', this.codegenPath),
        () => this.grep('cssTree|postcss', this.codegenPath)
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['parser', 'css', 'less', 'parse', 'stylesheet'];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
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
          domain: 'css-parser',
          searchStrategy: 'parser-pattern-matching',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'css-parser',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchCssParser(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchCssParserTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

