/**
 * Tool: search_widget_components
 * Searches for widget component implementations
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { FileDiscovery } from '../shared/file-discovery.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths, WidgetCategory } from '../types.js';

export class SearchWidgetComponentsTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    category?: WidgetCategory;
    includeRelated?: boolean;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 15;
    
    try {
      const basePath = args.category && args.category !== 'all'
        ? `${this.runtimePath}/components/${args.category}`
        : `${this.runtimePath}/components`;
      
      // Multi-strategy search
      const searches: Array<() => Promise<string[]>> = [];
      
      // Strategy 1: Direct widget name search
      const widgetName = this.extractWidgetName(args.query);
      if (widgetName) {
        searches.push(
          () => this.find(`*${widgetName.toLowerCase()}*`, basePath),
          () => this.grep(`class.*${widgetName}`, basePath, { filePattern: '*.{tsx,ts,jsx,js}' })
        );
      }
      
      // Strategy 2: Category-based discovery
      if (args.category && args.category !== 'all') {
        searches.push(
          () => this.find('*.{tsx,ts,jsx,js}', basePath)
        );
      }
      
      // Strategy 3: Keyword search
      const keywords = args.query.toLowerCase().split(' ');
      for (const keyword of keywords.slice(0, 3)) {
        searches.push(
          () => this.grep(keyword, basePath, { filePattern: '*.{tsx,ts,jsx,js}' })
        );
      }
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      let widgetFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Find related files if requested
      if (args.includeRelated) {
        const relatedFiles: string[] = [];
        for (const file of widgetFiles) {
          const related = await FileDiscovery.findRelatedFiles(file);
          relatedFiles.push(...related);
        }
        widgetFiles.push(...relatedFiles);
        widgetFiles = this.deduplicate(widgetFiles);
      }
      
      // Group by widget
      const groupedWidgets = FileDiscovery.groupFilesByWidget(widgetFiles);
      
      // Rank widgets
      const rankedWidgets = groupedWidgets
        .sort((a, b) => {
          const aScore = this.calculateWidgetScore(a, keywords);
          const bScore = this.calculateWidgetScore(b, keywords);
          return bScore - aScore;
        })
        .slice(0, maxResults);
      
      // Get widget details
      const widgetsWithDetails = await Promise.all(
        rankedWidgets.map(async (widget) => {
          const preview = await this.getPreview(widget.mainFile, 300);
          
          return {
            name: widget.name,
            files: widget.files,
            category: widget.category,
            mainFile: widget.mainFile,
            hasStyles: widget.files.some(f => f.includes('.styles.js')),
            hasProps: widget.files.some(f => f.includes('.props.ts')),
            preview
          };
        })
      );
      
      return {
        success: true,
        data: {
          widgets: widgetsWithDetails,
          totalFound: groupedWidgets.length,
          query: args.query,
          category: args.category || 'all'
        },
        meta: {
          domain: 'widget-components',
          searchStrategy: 'multi-pattern + category-filter + related-files',
          totalFound: groupedWidgets.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'widget-components',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  private extractWidgetName(query: string): string | null {
    // Extract widget name patterns like WmButton, button, etc.
    const match = query.match(/\b(Wm)?([A-Z][a-z]+)\b/);
    return match ? match[2] : null;
  }
  
  private calculateWidgetScore(widget: any, keywords: string[]): number {
    let score = 0;
    const name = widget.name.toLowerCase();
    
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        score += 10;
      }
    }
    
    // Bonus for complete widget sets
    if (widget.hasStyles) score += 5;
    if (widget.hasProps) score += 5;
    
    return score;
  }
}

export async function handleSearchWidgetComponents(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchWidgetComponentsTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

