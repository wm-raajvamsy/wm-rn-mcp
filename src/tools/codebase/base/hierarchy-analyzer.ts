/**
 * Tool: analyze_component_hierarchy
 * Analyzes component hierarchy and relationships
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { extractImports } from '../shared/ast-parser.js';
import { parseTypeScriptFile } from '../shared/ast-parser.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class AnalyzeComponentHierarchyTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    componentName?: string;
    depth?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxDepth = args.depth || 3;
    
    try {
      // Find all component files
      const componentFiles = await this.find('*.tsx', this.runtimePath + '/components');
      
      // Build hierarchy map
      const hierarchy: any = {
        baseComponent: {
          name: 'BaseComponent',
          children: [],
          file: ''
        }
      };
      
      // Analyze each component
      for (const file of componentFiles) {
        try {
          const content = await this.read(file);
          const ast = parseTypeScriptFile(content);
          const imports = extractImports(ast);
          
          // Check if extends BaseComponent
          if (content.includes('extends BaseComponent') || content.includes('extends Base')) {
            const componentName = this.extractComponentName(content);
            if (componentName) {
              hierarchy.baseComponent.children.push({
                name: componentName,
                file,
                imports: imports.map(i => i.source)
              });
            }
          }
        } catch {
          // Skip files that can't be parsed
        }
      }
      
      // Filter by component name if specified
      let result = hierarchy;
      if (args.componentName) {
        result = this.filterHierarchy(hierarchy, args.componentName);
      }
      
      return {
        success: true,
        data: {
          hierarchy: result,
          totalComponents: hierarchy.baseComponent.children.length
        },
        meta: {
          domain: 'component-hierarchy',
          searchStrategy: 'inheritance-analysis',
          totalFound: componentFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'component-hierarchy',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  private extractComponentName(content: string): string | null {
    const match = content.match(/class\s+(Wm\w+|[A-Z]\w+Component)/);
    return match ? match[1] : null;
  }
  
  private filterHierarchy(hierarchy: any, componentName: string): any {
    const filtered = { ...hierarchy };
    filtered.baseComponent.children = filtered.baseComponent.children.filter(
      (child: any) => child.name.toLowerCase().includes(componentName.toLowerCase())
    );
    return filtered;
  }
}

export async function handleAnalyzeComponentHierarchy(args: any): Promise<CodebaseToolResult> {
  const tool = new AnalyzeComponentHierarchyTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

