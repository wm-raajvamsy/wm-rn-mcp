/**
 * Tool: search_html_parser
 * Searches for HTML/markup parsing logic
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchHtmlParserTool extends CodebaseTool {
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
        () => this.grep('HtmlParser|html-parser|MarkupParser', this.codegenPath),
        () => this.grep('parseHtml|parseMarkup|parse.*html', this.codegenPath),
        () => this.find('*html*parser*', this.codegenPath),
        () => this.find('*markup*parser*', this.codegenPath),
        () => this.grep('DOMParser|xmldom', this.codegenPath)
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['parser', 'html', 'markup', 'parse', 'dom'];
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
          domain: 'html-parser',
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
          domain: 'html-parser',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchHtmlParser(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchHtmlParserTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

