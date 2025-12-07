/**
 * Tool: read_widget_structure
 * Reads and parses widget component file structure
 */

import { CodebaseTool } from '../shared/base-tool.js';
import {
  parseTypeScriptFile,
  extractMethodSignatures,
  extractPropertyDefinitions,
  extractImports,
  extractExports
} from '../shared/ast-parser.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class ReadWidgetStructureTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    filePath: string;
    extractProps?: boolean;
    extractEvents?: boolean;
    extractStyles?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      // Read main file
      const content = await this.read(args.filePath);
      const ast = parseTypeScriptFile(content);
      
      // Extract basic structure
      const methods = extractMethodSignatures(ast, true);
      const properties = extractPropertyDefinitions(ast, true);
      const imports = extractImports(ast);
      const exports = extractExports(ast);
      
      // Extract widget-specific patterns
      const structure: any = {
        methods,
        properties,
        imports,
        exports
      };
      
      // Extract event handlers
      if (args.extractEvents !== false) {
        structure.eventHandlers = methods.filter(m => 
          m.name.startsWith('on') || m.name.includes('Handle') || m.name.includes('Callback')
        );
      }
      
      // Extract render methods
      structure.renderMethods = methods.filter(m =>
        m.name === 'render' || m.name === 'renderWidget' || m.name.startsWith('render')
      );
      
      // Extract style methods
      if (args.extractStyles !== false) {
        structure.styleMethods = methods.filter(m =>
          m.name.includes('Style') || m.name.includes('Theme')
        );
      }
      
      // Extract prop interface
      if (args.extractProps !== false) {
        structure.propInterface = this.extractPropInterface(content);
      }
      
      // Extract component class name
      structure.componentClass = this.extractComponentClass(content);
      
      return {
        success: true,
        data: {
          filePath: args.filePath,
          content,
          structure,
          stats: {
            lines: this.countLines(content),
            methods: methods.length,
            properties: properties.length,
            eventHandlers: structure.eventHandlers?.length || 0,
            renderMethods: structure.renderMethods.length,
            size: Buffer.byteLength(content)
          }
        },
        meta: {
          domain: 'widget-structure',
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'widget-structure',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  private extractPropInterface(content: string): any {
    // Extract interface that ends with Props
    const match = content.match(/interface\s+(\w+Props)\s*\{([^}]+)\}/s);
    if (match) {
      return {
        name: match[1],
        definition: match[2].trim()
      };
    }
    return null;
  }
  
  private extractComponentClass(content: string): string | null {
    const match = content.match(/export\s+class\s+(Wm\w+|[A-Z]\w+)\s+extends/);
    return match ? match[1] : null;
  }
}

export async function handleReadWidgetStructure(args: any): Promise<CodebaseToolResult> {
  const tool = new ReadWidgetStructureTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

