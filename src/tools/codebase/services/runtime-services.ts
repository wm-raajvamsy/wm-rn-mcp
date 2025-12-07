import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchRuntimeServicesTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    serviceName?: string;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 10;
    
    try {
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('Service|.*Service.*class', this.runtimePath + '/core', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('NavigationService|ModalService|ToastService', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*service*', this.runtimePath + '/core')
      ];
      
      if (args.serviceName) {
        searches.push(
          () => this.grep(args.serviceName!, this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
          () => this.find(`*${args.serviceName!.toLowerCase()}*`, this.runtimePath)
        );
      }
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['service', 'navigation', 'modal', 'toast', args.serviceName || ''];
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
          serviceName: args.serviceName,
          keywords
        },
        meta: {
          domain: 'runtime-services',
          searchStrategy: 'service-class-discovery',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'runtime-services',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchRuntimeServices(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchRuntimeServicesTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

