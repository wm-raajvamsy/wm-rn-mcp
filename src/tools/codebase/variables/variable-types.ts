import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchVariableTypesTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    variableType: 'live' | 'service' | 'device' | 'navigation' | 'timer';
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 10;
    const varType = args.variableType;
    
    try {
      const searches: Array<() => Promise<string[]>> = [
        () => this.find(`*${varType}*variable*`, this.runtimePath + '/variables'),
        () => this.grep(`class.*${varType}Variable`, this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep(`${varType}Variable.*extends`, this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = [varType, 'variable', `${varType}variable`];
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
          variableType: varType,
          keywords
        },
        meta: {
          domain: 'variable-types',
          searchStrategy: 'type-specific-discovery',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'variable-types',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchVariableTypes(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchVariableTypesTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

