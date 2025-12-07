/**
 * Tool: search_base_component
 * Searches for BaseComponent implementation and core infrastructure files
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, FocusArea, CodebasePaths } from '../types.js';

export class SearchBaseComponentTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    focus?: FocusArea;
    includeTests?: boolean;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 10;
    
    try {
      // Search strategies
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('class.*BaseComponent', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('export.*BaseComponent', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.find('*base.component*', this.runtimePath),
        () => this.find('*BaseComponent*', this.runtimePath)
      ];
      
      // Add focus-specific searches
      if (args.focus === 'lifecycle') {
        searches.push(
          () => this.grep('componentDidMount', this.runtimePath),
          () => this.grep('componentWillUnmount', this.runtimePath),
          () => this.grep('render\\(', this.runtimePath, { filePattern: 'base-component*' })
        );
      } else if (args.focus === 'properties') {
        searches.push(
          () => this.grep('this\\.props\\.|this\\.state\\.', this.runtimePath, { filePattern: 'base-component*' }),
          () => this.grep('getProperty|setProperty', this.runtimePath)
        );
      } else if (args.focus === 'styling') {
        searches.push(
          () => this.grep('this\\.styles|applyStyles', this.runtimePath, { filePattern: 'base-component*' })
        );
      } else if (args.focus === 'events') {
        searches.push(
          () => this.grep('notify|addEventListener|emit', this.runtimePath, { filePattern: 'base-component*' })
        );
      }
      
      // Execute parallel searches
      const results = await Promise.all(searches.map(fn => fn()));
      let allFiles = this.deduplicate(results.flat());
      
      // Filter tests if needed
      if (!args.includeTests) {
        allFiles = this.filterTestFiles(allFiles);
      }
      
      // Rank by relevance
      const keywords = [
        'basecomponent', 'base', 'component',
        ...(args.focus === 'lifecycle' ? ['lifecycle', 'mount', 'unmount'] : []),
        ...(args.focus === 'properties' ? ['property', 'props', 'state'] : []),
        ...(args.focus === 'styling' ? ['style', 'styling', 'theme'] : []),
        ...(args.focus === 'events' ? ['event', 'notify', 'emit'] : [])
      ];
      
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      // Get file details
      const filesWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => {
          const preview = await this.getPreview(file.path, 500);
          const content = await this.read(file.path);
          
          return {
            path: file.path,
            relevance: file.score,
            preview,
            lineCount: this.countLines(content),
            type: this.getFileType(file.path)
          };
        })
      );
      
      return {
        success: true,
        data: {
          files: filesWithDetails,
          keywords,
          focus: args.focus || 'all'
        },
        meta: {
          domain: 'base-component',
          searchStrategy: 'multi-pattern + focus-specific',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'base-component',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchBaseComponent(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchBaseComponentTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

