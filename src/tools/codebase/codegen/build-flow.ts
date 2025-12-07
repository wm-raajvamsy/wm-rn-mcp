/**
 * Tool: search_build_flow
 * Searches for build flow and build pipeline implementation
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchBuildFlowTool extends CodebaseTool {
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
        () => this.grep('BuildService|build-service', this.codegenPath),
        () => this.grep('build.*flow|build.*pipeline', this.codegenPath),
        () => this.grep('AppGenerator|app-generator', this.codegenPath),
        () => this.find('*build*', this.codegenPath),
        () => this.grep('profile|buildProfile', this.codegenPath),
        () => this.grep('generate.*app|generateApp', this.codegenPath)
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['build', 'flow', 'pipeline', 'generator', 'profile', 'app'];
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
          domain: 'build-flow',
          searchStrategy: 'build-pattern + pipeline-discovery',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'build-flow',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchBuildFlow(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchBuildFlowTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

