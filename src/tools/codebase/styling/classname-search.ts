/**
 * Tool: search_class_names
 * Extracts and catalogs all rnStyleSelector class names
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { extractRnStyleSelectors } from '../shared/pattern-matcher.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchClassNamesTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    component?: string;
    includeNested?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      // Find all .styledef.ts and .styledef.js files
      const tsFiles = await this.find('*.styledef.ts', this.codegenPath);
      const jsFiles = await this.find('*.styledef.js', this.codegenPath);
      const styledefFiles = [...tsFiles, ...jsFiles];
      
      // Filter by component if specified
      const filesToSearch = args.component
        ? styledefFiles.filter(f => f.toLowerCase().includes(args.component!.toLowerCase()))
        : styledefFiles;
      
      // Extract class names from all files
      const allClassNames: any[] = [];
      const fileContents = new Map<string, string>();
      
      for (const file of filesToSearch) {
        try {
          const content = await this.read(file);
          fileContents.set(file, content);
          
          const extracted = extractRnStyleSelectors(content, args.includeNested ?? true);
          allClassNames.push(...extracted.map(cn => ({
            ...cn,
            file: file
          })));
        } catch {
          // Skip files that can't be read
        }
      }
      
      // Group class names by component
      const byComponent = allClassNames.reduce((acc, cn) => {
        if (!acc[cn.component]) {
          acc[cn.component] = [];
        }
        acc[cn.component].push(cn);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Generate usage examples
      const examples = allClassNames.slice(0, 10).map(cn => ({
        className: cn.className,
        usage: `rnStyleSelector('${cn.component}', '${cn.selector}'${cn.nestedSelector ? `, '${cn.nestedSelector}'` : ''})`,
        component: cn.component,
        file: cn.file
      }));
      
      return {
        success: true,
        data: {
          classNames: allClassNames,
          byComponent,
          examples,
          totalClassNames: allClassNames.length,
          totalComponents: Object.keys(byComponent).length
        },
        meta: {
          domain: 'class-names',
          searchStrategy: 'rnStyleSelector-extraction',
          totalFound: allClassNames.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'class-names',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchClassNames(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchClassNamesTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

