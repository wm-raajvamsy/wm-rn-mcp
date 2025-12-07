import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchPageStructureTool extends CodebaseTool {
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
        () => this.grep('BasePage|class.*Page', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('onPageReady|onPageLeave|onPageInit', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*page*', this.runtimePath),
        () => this.grep('goToPage|NavigationService', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['page', 'basepage', 'onpageready', 'navigation'];
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
          domain: 'page-structure',
          searchStrategy: 'page-lifecycle + navigation',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'page-structure',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchPageStructure(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchPageStructureTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

