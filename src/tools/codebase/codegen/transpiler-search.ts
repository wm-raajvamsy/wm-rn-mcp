/**
 * Tool: search_transpiler_engine
 * Searches for transpiler engine implementation
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths, TranspilationPhase } from '../types.js';

export class SearchTranspilerEngineTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    phase?: TranspilationPhase;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 10;
    
    try {
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('Transpiler|transpiler', this.codegenPath),
        () => this.grep('TranspilerService|transpiler-service', this.codegenPath),
        () => this.find('*transpiler*', this.codegenPath),
        () => this.grep('transpile\\(|transpileMarkup', this.codegenPath)
      ];
      
      // Add phase-specific searches
      if (args.phase === 'parse') {
        searches.push(
          () => this.grep('parse|parser', this.codegenPath, { filePattern: '*transpiler*' })
        );
      } else if (args.phase === 'transform') {
        searches.push(
          () => this.grep('transform|transformer', this.codegenPath, { filePattern: '*transpiler*' })
        );
      } else if (args.phase === 'generate') {
        searches.push(
          () => this.grep('generate|generator', this.codegenPath, { filePattern: '*transpiler*' })
        );
      }
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      const keywords = ['transpiler', 'transpile', 'service', 'engine', args.phase || 'all'];
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
          phase: args.phase || 'all',
          keywords
        },
        meta: {
          domain: 'transpiler-engine',
          searchStrategy: 'service-pattern + phase-specific',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'transpiler-engine',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchTranspilerEngine(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchTranspilerEngineTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

