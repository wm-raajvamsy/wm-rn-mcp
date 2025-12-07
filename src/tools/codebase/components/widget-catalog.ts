/**
 * Tool: list_all_widgets
 * Lists all available widgets in the codebase
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { FileDiscovery } from '../shared/file-discovery.js';
import { CodebaseToolResult, CodebasePaths, WidgetCategory } from '../types.js';

export class ListAllWidgetsTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    category?: WidgetCategory;
    includeMetadata?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      const basePath = args.category && args.category !== 'all'
        ? `${this.runtimePath}/components/${args.category}`
        : `${this.runtimePath}/components`;
      
      // Find all widget .tsx files
      const widgetFiles = await this.find('*.{tsx,ts,jsx,js}', basePath);
      
      // Filter out test files and group by widget
      const filteredFiles = this.filterTestFiles(widgetFiles);
      const groupedWidgets = FileDiscovery.groupFilesByWidget(filteredFiles);
      
      // Build widget catalog
      const catalog = await Promise.all(
        groupedWidgets.map(async (widget) => {
          const metadata: any = {
            name: widget.name,
            category: widget.category,
            mainFile: widget.mainFile,
            fileCount: widget.files.length
          };
          
          if (args.includeMetadata) {
            // Extract additional metadata from main file
            try {
              const content = await this.read(widget.mainFile);
              metadata.hasRenderWidget = content.includes('renderWidget');
              metadata.extendsBaseComponent = content.includes('extends BaseComponent');
              metadata.lineCount = this.countLines(content);
              
              // Extract prop interface name
              const propMatch = content.match(/interface\s+(\w+Props)/);
              metadata.propInterface = propMatch ? propMatch[1] : null;
            } catch {
              // Skip metadata if file can't be read
            }
          }
          
          return metadata;
        })
      );
      
      // Sort by category then name
      catalog.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
      
      // Group by category for better organization
      const byCategory = catalog.reduce((acc, widget) => {
        if (!acc[widget.category]) {
          acc[widget.category] = [];
        }
        acc[widget.category].push(widget);
        return acc;
      }, {} as Record<string, any[]>);
      
      return {
        success: true,
        data: {
          widgets: catalog,
          byCategory,
          totalWidgets: catalog.length,
          categories: Object.keys(byCategory)
        },
        meta: {
          domain: 'widget-catalog',
          searchStrategy: 'directory-scan + grouping',
          totalFound: catalog.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'widget-catalog',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleListAllWidgets(args: any): Promise<CodebaseToolResult> {
  const tool = new ListAllWidgetsTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

