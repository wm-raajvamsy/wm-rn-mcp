/**
 * Tool: search_transformer_registry
 * Searches for transformer registry and widget transformers
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { extractTransformerRegistrations } from '../shared/pattern-matcher.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchTransformerRegistryTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    widgetName?: string;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 15;
    
    try {
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('TransformerRegistry|transformer-registry', this.codegenPath),
        () => this.grep('Transformer.*class|class.*Transformer', this.codegenPath),
        () => this.find('*transformer*', this.codegenPath),
        () => this.grep('registry\\.register', this.codegenPath)
      ];
      
      if (args.widgetName) {
        searches.push(
          () => this.grep(`${args.widgetName}.*Transformer|transformer.*${args.widgetName}`, this.codegenPath)
        );
      }
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Extract transformer registrations
      const registrations: any[] = [];
      for (const file of allFiles.slice(0, 20)) {
        try {
          const content = await this.read(file);
          const regs = extractTransformerRegistrations(content);
          if (regs.length > 0) {
            registrations.push({
              file,
              transformers: regs
            });
          }
        } catch {
          // Skip files that can't be read
        }
      }
      
      const keywords = ['transformer', 'registry', 'widget', args.widgetName || ''];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      const filesWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => ({
          path: file.path,
          relevance: file.score,
          preview: await this.getPreview(file.path, 400),
          lineCount: this.countLines(await this.read(file.path)),
          type: this.getFileType(file.path)
        }))
      );
      
      return {
        success: true,
        data: {
          files: filesWithDetails,
          registrations,
          widgetName: args.widgetName,
          keywords
        },
        meta: {
          domain: 'transformer-registry',
          searchStrategy: 'registry-pattern + transformer-extraction',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'transformer-registry',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchTransformerRegistry(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchTransformerRegistryTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

