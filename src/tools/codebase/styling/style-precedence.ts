/**
 * Tool: analyze_style_precedence
 * Analyzes style application order and precedence rules
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class AnalyzeStylePrecedenceTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    component?: string;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      // Search for style precedence logic
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('applyStyles|mergeStyles', this.runtimePath),
        () => this.grep('style.*precedence|style.*order', this.runtimePath),
        () => this.grep('getDefaultStyles|getUserStyles', this.runtimePath),
        () => this.grep('StyleSheet.*compose|StyleSheet.*flatten', this.runtimePath)
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      let styleFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Filter by component if specified
      if (args.component) {
        styleFiles = styleFiles.filter(f =>
          f.toLowerCase().includes(args.component!.toLowerCase())
        );
      }
      
      // Analyze each file for precedence patterns
      const precedencePatterns: any[] = [];
      
      for (const file of styleFiles.slice(0, 10)) {
        try {
          const content = await this.read(file);
          const patterns = this.extractPrecedencePatterns(content);
          
          if (patterns.length > 0) {
            precedencePatterns.push({
              file,
              patterns,
              preview: await this.getPreview(file, 300)
            });
          }
        } catch {
          // Skip files that can't be read
        }
      }
      
      // Extract general precedence rules
      const precedenceRules = this.inferPrecedenceRules(precedencePatterns);
      
      return {
        success: true,
        data: {
          precedencePatterns,
          precedenceRules,
          styleFiles: styleFiles.slice(0, 15),
          totalFiles: styleFiles.length
        },
        meta: {
          domain: 'style-precedence',
          searchStrategy: 'precedence-pattern-analysis',
          totalFound: styleFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'style-precedence',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  private extractPrecedencePatterns(content: string): Array<{type: string; description: string}> {
    const patterns: Array<{type: string; description: string}> = [];
    
    // Pattern 1: Style merging
    if (content.includes('mergeStyles') || content.includes('Object.assign')) {
      patterns.push({
        type: 'merge',
        description: 'Merges multiple style objects with later styles overriding earlier ones'
      });
    }
    
    // Pattern 2: Default styles
    if (content.includes('getDefaultStyles')) {
      patterns.push({
        type: 'default',
        description: 'Default styles applied first as base layer'
      });
    }
    
    // Pattern 3: User styles
    if (content.includes('getUserStyles') || content.includes('this.styles')) {
      patterns.push({
        type: 'user',
        description: 'User/custom styles applied on top of defaults'
      });
    }
    
    // Pattern 4: Theme styles
    if (content.includes('themeStyles') || content.includes('theme.')) {
      patterns.push({
        type: 'theme',
        description: 'Theme-specific styles applied based on active theme'
      });
    }
    
    // Pattern 5: Inline styles
    if (content.includes('inlineStyles') || content.includes('style={')) {
      patterns.push({
        type: 'inline',
        description: 'Inline styles have highest precedence'
      });
    }
    
    return patterns;
  }
  
  private inferPrecedenceRules(patterns: any[]): string[] {
    const rules = [
      '1. Default styles (getDefaultStyles) - Applied first as base layer',
      '2. Theme styles - Override defaults with theme-specific values',
      '3. User/Custom styles (this.styles) - Override theme styles',
      '4. Component prop styles - Styles passed via props',
      '5. Inline styles - Highest precedence, override all other styles'
    ];
    
    return rules;
  }
}

export async function handleAnalyzeStylePrecedence(args: any): Promise<CodebaseToolResult> {
  const tool = new AnalyzeStylePrecedenceTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

