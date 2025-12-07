import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchVariableSystemTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    variableType?: 'live' | 'service' | 'device' | 'navigation' | 'timer' | 'all';
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 10;
    
    try {
      const searches: Array<() => Promise<string[]>> = [];
      
      // Core variable system files
      searches.push(
        () => this.grep('class.*Variable', this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('BaseVariable', this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*variable*', this.runtimePath + '/variables')
      );
      
      // Type-specific searches
      if (args.variableType && args.variableType !== 'all') {
        searches.push(
          () => this.grep(`${args.variableType}Variable|${args.variableType}-variable`, this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' }),
          () => this.find(`*${args.variableType}*variable*`, this.runtimePath + '/variables')
        );
      }
      
      // Lifecycle and operations
      searches.push(
        () => this.grep('invoke|getData|setData', this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('VariableEvents|BEFORE_INVOKE|AFTER_INVOKE', this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' })
      );
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['variable', 'basevariable', args.variableType || '', 'invoke', 'dataset'];
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
          variableType: args.variableType || 'all',
          keywords
        },
        meta: {
          domain: 'variable-system',
          searchStrategy: 'type-specific + lifecycle-methods',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'variable-system',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchVariableSystem(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchVariableSystemTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

