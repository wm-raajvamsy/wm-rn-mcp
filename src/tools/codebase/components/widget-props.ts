/**
 * Tool: search_widget_props
 * Searches for widget property definitions and prop interfaces
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { parseTypeScriptFile, extractTypeDefinitions } from '../shared/ast-parser.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchWidgetPropsTool extends CodebaseTool {
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
        () => this.find('*.props.ts', this.runtimePath + '/components'),
        () => this.grep('interface.*Props', this.runtimePath + '/components', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('interface.*Props', this.runtimePath + '/components', { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      // Add widget-specific search if provided
      if (args.widgetName) {
        const baseName = args.widgetName.replace('Wm', '').toLowerCase();
        searches.push(
          () => this.find(`*${baseName}*.props.ts`, this.runtimePath + '/components'),
          () => this.grep(`${args.widgetName}Props`, this.runtimePath + '/components')
        );
      }
      
      // Execute searches
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Rank files
      const keywords = ['props', 'interface', 'properties', args.query, args.widgetName || ''];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      // Extract prop definitions
      const propsWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => {
          const content = await this.read(file.path);
          const ast = parseTypeScriptFile(content);
          const types = extractTypeDefinitions(ast);
          
          // Filter to prop interfaces
          const propInterfaces = types.filter(t =>
            t.name.endsWith('Props') && t.kind === 'interface'
          );
          
          return {
            path: file.path,
            relevance: file.score,
            propInterfaces,
            preview: await this.getPreview(file.path, 400),
            lineCount: this.countLines(content)
          };
        })
      );
      
      return {
        success: true,
        data: {
          files: propsWithDetails,
          widgetName: args.widgetName,
          keywords
        },
        meta: {
          domain: 'widget-props',
          searchStrategy: 'prop-interface-discovery',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'widget-props',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchWidgetProps(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchWidgetPropsTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

