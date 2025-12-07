/**
 * Tool: search_widget_by_name
 * Searches for a specific widget by exact name
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { FileDiscovery } from '../shared/file-discovery.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchWidgetByNameTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    widgetName: string;
    includeRelated?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      // Normalize widget name
      const normalizedName = args.widgetName.startsWith('Wm')
        ? args.widgetName
        : `Wm${args.widgetName.charAt(0).toUpperCase()}${args.widgetName.slice(1)}`;
      
      const baseName = normalizedName.replace('Wm', '').toLowerCase();
      
      // Search for widget files
      const searches: Array<() => Promise<string[]>> = [
        () => this.find(`*${baseName}*.tsx`, this.runtimePath + '/components'),
        () => this.grep(`class.*${normalizedName}`, this.runtimePath + '/components', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep(`export.*${normalizedName}`, this.runtimePath + '/components')
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      let files = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Find related files if requested
      if (args.includeRelated && files.length > 0) {
        const mainFile = files[0];
        const related = await FileDiscovery.findRelatedFiles(mainFile);
        files.push(...related);
        files = this.deduplicate(files);
      }
      
      // Get file details
      const filesWithDetails = await Promise.all(
        files.map(async (file) => {
          const preview = await this.getPreview(file, 400);
          const content = await this.read(file);
          
          return {
            path: file,
            preview,
            lineCount: this.countLines(content),
            type: this.getFileType(file),
            relevance: 100
          };
        })
      );
      
      // Determine widget category
      const category = this.inferCategory(baseName);
      
      return {
        success: true,
        data: {
          widgetName: normalizedName,
          files: filesWithDetails,
          category,
          found: files.length > 0
        },
        meta: {
          domain: 'widget-by-name',
          searchStrategy: 'exact-name-match + related-files',
          totalFound: files.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'widget-by-name',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  private inferCategory(widgetName: string): string {
    const name = widgetName.toLowerCase();
    
    if (['button', 'label', 'text', 'icon'].includes(name)) return 'basic';
    if (['panel', 'container', 'card'].includes(name)) return 'container';
    if (['list', 'grid', 'table', 'datatable'].includes(name)) return 'data';
    if (['form', 'field'].includes(name)) return 'form';
    if (['checkbox', 'radioset', 'select', 'input'].includes(name)) return 'input';
    if (['gridlayout', 'linearlayout'].includes(name)) return 'layout';
    
    return 'advanced';
  }
}

export async function handleSearchWidgetByName(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchWidgetByNameTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

