/**
 * Tool: search_style_definitions
 * Searches for style definition files (.styledef.ts)
 */

import { CodebaseTool } from '../shared/base-tool.js';
import { extractRnStyleSelectors } from '../shared/pattern-matcher.js';
import { rankFilesByRelevance } from '../shared/ranking.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class SearchStyleDefinitionsTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    query: string;
    component?: string;
    extractClassNames?: boolean;
    includeNested?: boolean;
    maxResults?: number;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    const maxResults = args.maxResults || 15;
    
    try {
      // Find all .styledef.ts files
      const styledefFiles = await this.find('*.styledef.ts', this.codegenPath);
      
      // Filter by component if specified
      let relevantFiles = styledefFiles;
      if (args.component) {
        relevantFiles = styledefFiles.filter(f =>
          f.toLowerCase().includes(args.component!.toLowerCase())
        );
      }
      
      // Search for query terms in styledef files
      const keywords = args.query.toLowerCase().split(' ').filter(k => k.length > 2);
      const matchingFiles: Array<{file: string; content: string}> = [];
      
      for (const file of relevantFiles) {
        try {
          const content = await this.read(file);
          const hasMatch = keywords.some(keyword =>
            content.toLowerCase().includes(keyword)
          );
          if (hasMatch) {
            matchingFiles.push({ file, content });
          }
        } catch {
          // Skip files that can't be read
        }
      }
      
      // Rank by relevance
      const ranked = rankFilesByRelevance(
        matchingFiles.map(f => f.file),
        keywords
      );
      
      // Extract class names if requested
      let classNames: any[] = [];
      if (args.extractClassNames !== false) {
        for (const { file, content } of matchingFiles) {
          const extracted = extractRnStyleSelectors(content, args.includeNested ?? true);
          classNames.push(...extracted.map(cn => ({
            ...cn,
            file: file
          })));
        }
      }
      
      // Get file details
      const filesWithDetails = await Promise.all(
        ranked.slice(0, maxResults).map(async (file) => {
          const matchingFile = matchingFiles.find(f => f.file === file.path);
          return {
            path: file.path,
            relevance: file.score,
            preview: await this.getPreview(file.path, 400),
            lineCount: matchingFile ? this.countLines(matchingFile.content) : 0,
            type: this.getFileType(file.path)
          };
        })
      );
      
      return {
        success: true,
        data: {
          files: filesWithDetails,
          classNames,
          query: args.query,
          component: args.component,
          keywords
        },
        meta: {
          domain: 'style-definitions',
          searchStrategy: 'styledef-pattern-match + class-name-extraction',
          totalFound: matchingFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'style-definitions',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleSearchStyleDefinitions(args: any): Promise<CodebaseToolResult> {
  const tool = new SearchStyleDefinitionsTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

