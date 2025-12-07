import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchBindingMechanismTool extends CodebaseTool {
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
        // Binding in runtime
        () => this.grep('bind:|twoWayBinding', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('datavalue.*bind|caption.*bind', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        
        // Binding transformation in codegen
        () => this.grep('bind:|bindExpression|transformBind', this.codegenPath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('BindTransformer|bind-transformer', this.codegenPath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        
        // WmMemo and watch integration
        () => this.grep('WmMemo.*watch|watch\\(\\)', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['bind', 'binding', 'datavalue', 'two-way', 'watch'];
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
          domain: 'binding-mechanism',
          searchStrategy: 'bind-expression + transformation',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'binding-mechanism',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchBindingMechanism(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchBindingMechanismTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

