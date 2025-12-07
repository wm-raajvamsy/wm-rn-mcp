/**
 * Abstract base class for all codebase tools
 * Provides common utilities for file operations
 */

import { readFile, grepFiles, findFiles, listDirectory } from '../../filesystem.js';
import { CodebaseToolResult } from '../types.js';

export abstract class CodebaseTool {
  protected runtimePath: string;
  protected codegenPath: string;
  
  constructor(runtimePath: string, codegenPath: string) {
    this.runtimePath = runtimePath;
    this.codegenPath = codegenPath;
  }
  
  /**
   * Grep files using existing filesystem tools
   */
  protected async grep(
    pattern: string,
    directory: string,
    options?: { filePattern?: string; caseSensitive?: boolean }
  ): Promise<string[]> {
    try {
      const result = await grepFiles({
        pattern,
        paths: [directory],
        recursive: true,
        ignoreCase: !(options?.caseSensitive ?? false),
        includeLineNumbers: false,
        filePattern: options?.filePattern
      });
      
      if (result.matches) {
        return this.extractFilePathsFromGrepResults(result.matches);
      }
      return [];
    } catch (error) {
      // Silently handle errors and return empty array
      return [];
    }
  }
  
  /**
   * Find files by pattern
   */
  protected async find(
    pattern: string,
    directory: string,
    options?: { type?: 'file' | 'directory'; maxDepth?: number }
  ): Promise<string[]> {
    try {
      // Add **/ prefix for recursive search if not already present
      const globPattern = pattern.startsWith('**/') ? pattern : `**/${pattern}`;
      
      const result = await findFiles({
        searchPath: directory,
        pattern: globPattern,
        type: options?.type || 'file',
        maxDepth: options?.maxDepth
      });
      
      if (result.files) {
        return result.files.map(f => f.path);
      }
      return [];
    } catch (error) {
      // Silently handle errors and return empty array
      return [];
    }
  }
  
  /**
   * Read file content
   */
  protected async read(filePath: string): Promise<string> {
    const result = await readFile({ filePath });
    return result.content;
  }
  
  /**
   * List directory contents
   */
  protected async list(directory: string): Promise<string[]> {
    try {
      const result = await listDirectory({
        directoryPath: directory,
        includeHidden: false
      });
      
      if (result.entries) {
        return result.entries.map(e => e.path);
      }
      return [];
    } catch {
      return [];
    }
  }
  
  /**
   * Deduplicate file paths
   */
  protected deduplicate(files: string[]): string[] {
    return [...new Set(files)];
  }
  
  /**
   * Filter out test files by checking filename only (not full path)
   * This prevents filtering files when the project directory contains 'test' in its path
   */
  protected filterTestFiles(files: string[]): string[] {
    return files.filter(f => {
      const filename = f.split('/').pop() || '';
      return !filename.toLowerCase().includes('test') && !filename.toLowerCase().includes('spec');
    });
  }
  
  /**
   * Get file preview (first N characters)
   */
  protected async getPreview(filePath: string, length: number = 500): Promise<string> {
    try {
      const content = await this.read(filePath);
      return content.substring(0, length);
    } catch {
      return '';
    }
  }
  
  /**
   * Count lines in file
   */
  protected countLines(content: string): number {
    return content.split('\n').length;
  }
  
  /**
   * Determine file type from extension
   */
  protected getFileType(filePath: string): 'tsx' | 'ts' | 'js' | 'template' | 'other' {
    if (filePath.endsWith('.tsx')) return 'tsx';
    if (filePath.endsWith('.ts')) return 'ts';
    if (filePath.endsWith('.js')) return 'js';
    if (filePath.endsWith('.template')) return 'template';
    return 'other';
  }
  
  /**
   * Extract file paths from grep results
   */
  private extractFilePathsFromGrepResults(matches: Array<{file: string; line: string; lineNumber: number}>): string[] {
    const paths = new Set<string>();
    for (const match of matches) {
      paths.add(match.file);
    }
    return Array.from(paths);
  }
  
  /**
   * Abstract method: execute tool logic
   */
  abstract execute(args: any): Promise<CodebaseToolResult>;
}

