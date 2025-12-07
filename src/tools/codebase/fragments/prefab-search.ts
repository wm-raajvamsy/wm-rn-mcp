import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchPrefabSystemTool extends CodebaseTool {
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
        () => this.grep('BasePrefab|class.*Prefab', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*prefab*', this.runtimePath),
        () => this.grep('prefab', this.codegenPath, { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['prefab', 'baseprefab', 'reusable'];
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
          domain: 'prefab-system',
          searchStrategy: 'prefab-class + packaging',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'prefab-system',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchPrefabSystem(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchPrefabSystemTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

