/**
 * Tool: search_template_system
 * Searches for template system and Handlebars templates
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { extractTemplateVariables } from '../shared/pattern-matcher.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchTemplateSystemTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 15;
    
    try {
      const searches: Array<() => Promise<string[]>> = [
        () => this.find('*.template', this.codegenPath),
        () => this.find('*.hbs', this.codegenPath),
        () => this.grep('Handlebars|handlebars', this.codegenPath),
        () => this.grep('template.*compile|compile.*template', this.codegenPath),
        () => this.find('*template*', this.codegenPath)
      ];
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.filterTestFiles(this.deduplicate(results.flat()));
      
      // Extract template variables from template files
      const templatesWithVariables: any[] = [];
      for (const file of allFiles.slice(0, 20)) {
        if (file.endsWith('.template') || file.endsWith('.hbs')) {
          try {
            const content = await this.read(file);
            const variables = extractTemplateVariables(content);
            if (variables.length > 0) {
              templatesWithVariables.push({
                file,
                variables,
                variableCount: variables.length
              });
            }
          } catch {
            // Skip files that can't be read
          }
        }
      }
      
      const keywords = ['template', 'handlebars', 'hbs', 'compile'];
      const ranked = rankFilesByRelevance(allFiles, keywords);
      
      const filesWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => ({
          path: file.path,
          relevance: file.score,
          preview: await this.getPreview(file.path, 400),
          lineCount: this.countLines(await this.read(file.path)),
          type: this.getFileType(file.path)
        }))
      );
      
      return {
        success: true,
        data: {
          files: filesWithDetails,
          templatesWithVariables,
          keywords
        },
        meta: {
          domain: 'template-system',
          searchStrategy: 'template-discovery + variable-extraction',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'template-system',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchTemplateSystem(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchTemplateSystemTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

