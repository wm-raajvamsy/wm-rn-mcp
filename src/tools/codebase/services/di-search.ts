import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchDiSystemTool extends CodebaseTool {
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
        () => this.grep('injector|Injector', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*injector*', this.runtimePath),
        () => this.grep('inject|dependency.*inject', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('\\.get\\(\\)|register\\(', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['injector', 'dependency', 'inject', 'di', 'register'];
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
          domain: 'di-system',
          searchStrategy: 'injector-pattern',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'di-system',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchDiSystem(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchDiSystemTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

