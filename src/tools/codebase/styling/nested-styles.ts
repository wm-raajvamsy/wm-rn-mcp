/**
 * Tool: search_nested_styles
 * Searches for nested style patterns and selectors
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { extractRnStyleSelectors } from '../shared/pattern-matcher.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchNestedStylesTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    component?: string;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 15;
    
    try {
      // Find all .styledef.ts files
      const styledefFiles = await this.find('*.styledef.ts', this.codegenPath);
      
      // Filter by component if specified
      const filesToSearch = args.component
        ? styledefFiles.filter(f => f.toLowerCase().includes(args.component!.toLowerCase()))
        : styledefFiles;
      
      // Extract nested selectors
      const nestedStyles: any[] = [];
      
      for (const file of filesToSearch) {
        try {
          const content = await this.read(file);
          const selectors = extractRnStyleSelectors(content, true);
          
          // Filter to only nested selectors
          const nested = selectors.filter(s => s.nested);
          if (nested.length > 0) {
            nestedStyles.push({
              file,
              selectors: nested,
              count: nested.length
            });
          }
        } catch {
          // Skip files that can't be read
        }
      }
      
      // Sort by count descending
      nestedStyles.sort((a, b) => b.count - a.count);
      
      // Get top results
      const topResults = nestedStyles.slice(0, maxResults);
      
      // Create examples
      const examples = topResults.flatMap(ns =>
        ns.selectors.slice(0, 3).map((s: any) => ({
          component: s.component,
          selector: s.selector,
          nestedSelector: s.nestedSelector,
          className: s.className,
          usage: `rnStyleSelector('${s.component}', '${s.selector}', '${s.nestedSelector}')`,
          file: ns.file
        }))
      );
      
      // Get all nested selectors
      const allNestedSelectors = nestedStyles.flatMap(ns => ns.selectors);
      
      return {
        success: true,
        data: {
          nestedStyles: topResults,
          examples,
          totalNestedSelectors: allNestedSelectors.length,
          totalFiles: nestedStyles.length
        },
        meta: {
          domain: 'nested-styles',
          searchStrategy: 'nested-selector-extraction',
          totalFound: nestedStyles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'nested-styles',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchNestedStyles(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchNestedStylesTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

