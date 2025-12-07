/**
 * Tool: read_theme_variables
 * Reads theme variable definitions and values
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class ReadThemeVariablesTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    themeName?: string;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      // Find theme variable files
      const searches: Array<() => Promise<string[]>> = [
        () => this.find('*theme*variable*', this.codegenPath),
        () => this.find('*theme*.js', this.codegenPath),
        () => this.find('*variables*.js', this.runtimePath),
        () => this.grep('themeVariables|theme-variables', this.codegenPath)
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      let themeFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Filter by theme name if provided
      if (args.themeName) {
        themeFiles = themeFiles.filter(f =>
          f.toLowerCase().includes(args.themeName!.toLowerCase())
        );
      }
      
      // Extract theme variables from files
      const themeVariables: any[] = [];
      
      for (const file of themeFiles.slice(0, 10)) {
        try {
          const content = await this.read(file);
          const variables = this.extractThemeVariables(content);
          
          if (variables.length > 0) {
            themeVariables.push({
              file,
              variables,
              count: variables.length
            });
          }
        } catch {
          // Skip files that can't be read
        }
      }
      
      // Collect all unique variable names
      const allVariableNames = new Set<string>();
      themeVariables.forEach(tv => {
        tv.variables.forEach((v: any) => allVariableNames.add(v.name));
      });
      
      return {
        success: true,
        data: {
          themeVariables,
          allVariableNames: Array.from(allVariableNames),
          totalFiles: themeFiles.length,
          totalVariables: allVariableNames.size
        },
        meta: {
          domain: 'theme-variables',
          searchStrategy: 'theme-file-discovery + variable-extraction',
          totalFound: themeFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'theme-variables',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  private extractThemeVariables(content: string): Array<{name: string; value?: string}> {
    const variables: Array<{name: string; value?: string}> = [];
    
    // Pattern 1: const variableName = value
    const constPattern = /const\s+(\w+)\s*=\s*([^;]+);/g;
    let match;
    while ((match = constPattern.exec(content)) !== null) {
      variables.push({
        name: match[1],
        value: match[2].trim()
      });
    }
    
    // Pattern 2: Object properties (themeVariables = { key: value })
    const objPattern = /(\w+)\s*:\s*(['"`][^'"`]+['"`]|[^,}]+)/g;
    while ((match = objPattern.exec(content)) !== null) {
      if (!['export', 'import', 'const', 'let', 'var'].includes(match[1])) {
        variables.push({
          name: match[1],
          value: match[2].trim()
        });
      }
    }
    
    return variables;
  }
}

export async function handleReadThemeVariables(args: any): Promise<CodebaseToolResult> {
  const tool = new ReadThemeVariablesTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

