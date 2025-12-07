import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchFragmentSystemTool extends CodebaseTool {
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
        () => this.grep('BaseFragment|BasePage|BasePartial|BasePrefab', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*fragment*', this.runtimePath),
        () => this.find('*page*', this.runtimePath),
        () => this.grep('class.*Fragment|class.*Page', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('onReady|onPageReady|onPageLeave', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['fragment', 'page', 'partial', 'prefab', 'basefragment'];
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
          domain: 'fragment-system',
          searchStrategy: 'fragment-types + lifecycle',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'fragment-system',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchFragmentSystem(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchFragmentSystemTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

