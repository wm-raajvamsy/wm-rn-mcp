/**
 * Tool: read_base_component
 * Reads and parses BaseComponent file structure
 */

import { CodebaseTool } from '../shared/base-tool.js';
import {
  parseTypeScriptFile,
  extractMethodSignatures,
  extractPropertyDefinitions,
  extractLifecycleHooks,
  extractImports,
  extractExports,
  extractTypeDefinitions
} from '../shared/ast-parser.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class ReadBaseComponentTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    filePath: string;
    extract?: Array<'methods' | 'properties' | 'lifecycle' | 'imports' | 'exports' | 'types'>;
    includeComments?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const extract = args.extract || ['methods', 'properties', 'lifecycle'];
    
    try {
      // Read file
      const content = await this.read(args.filePath);
      
      // Parse AST
      const ast = parseTypeScriptFile(content);
      
      // Extract structures
      const structure: any = {};
      
      if (extract.includes('methods')) {
        structure.methods = extractMethodSignatures(ast, args.includeComments);
      }
      if (extract.includes('properties')) {
        structure.properties = extractPropertyDefinitions(ast, args.includeComments);
      }
      if (extract.includes('lifecycle')) {
        structure.lifecycle = extractLifecycleHooks(ast);
      }
      if (extract.includes('imports')) {
        structure.imports = extractImports(ast);
      }
      if (extract.includes('exports')) {
        structure.exports = extractExports(ast);
      }
      if (extract.includes('types')) {
        structure.types = extractTypeDefinitions(ast);
      }
      
      return {
        success: true,
        data: {
          filePath: args.filePath,
          content,
          structure,
          stats: {
            lines: this.countLines(content),
            methods: structure.methods?.length || 0,
            properties: structure.properties?.length || 0,
            size: Buffer.byteLength(content)
          }
        },
        meta: {
          domain: 'base-component',
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

export async function handleReadBaseComponent(args: any): Promise<CodebaseToolResult> {
  const tool = new ReadBaseComponentTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

