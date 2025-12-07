/**
 * Tool: search_event_notifier
 * Searches for event notifier and event system implementation
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchEventNotifierTool extends CodebaseTool {
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
        () => this.grep('EventNotifier', this.runtimePath),
        () => this.grep('event-notifier', this.runtimePath),
        () => this.grep('notify\\(|emit\\(', this.runtimePath),
        () => this.grep('addEventListener|removeEventListener', this.runtimePath),
        () => this.grep('invokeEventCallback', this.runtimePath),
        () => this.find('*event-notifier*', this.runtimePath),
        () => this.find('*EventNotifier*', this.runtimePath)
      ];
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Rank by relevance
      const keywords = ['event', 'notifier', 'notify', 'emit', 'listener', 'callback', 'eventnotifier'];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      // Get file details
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
          domain: 'event-system',
          searchStrategy: 'event-pattern-matching',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'event-system',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchEventNotifier(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchEventNotifierTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

