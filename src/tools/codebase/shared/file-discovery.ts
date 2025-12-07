/**
 * Common file discovery utilities
 */

import * as path from 'path';
import { readFile } from '../../filesystem.js';

/**
 * Multi-strategy file discovery
 */
export class FileDiscovery {
  /**
   * Search using multiple strategies and aggregate results
   */
  static async multiSearch(
    strategies: Array<() => Promise<string[]>>
  ): Promise<string[]> {
    const results: string[][] = await Promise.all(strategies.map(fn => fn()));
    return [...new Set(results.flat())];
  }
  
  /**
   * Find related files (e.g., .component.js, .styles.js for a widget)
   */
  static async findRelatedFiles(basePath: string): Promise<string[]> {
    const dir = path.dirname(basePath);
    const name = path.basename(basePath, path.extname(basePath));
    
    const patterns = [
      `${name}.component.js`,
      `${name}.styles.js`,
      `${name}.props.ts`,
      `${name}.tsx`,
      `${name}.ts`
    ];
    
    const files: string[] = [];
    for (const pattern of patterns) {
      const fullPath = path.join(dir, pattern);
      if (await this.fileExists(fullPath)) {
        files.push(fullPath);
      }
    }
    return files;
  }
  
  /**
   * Check if file exists
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await readFile({ filePath });
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Group files by widget name
   */
  static groupFilesByWidget(files: string[]): Array<{
    name: string;
    files: string[];
    mainFile: string;
    category?: string;
  }> {
    const groups = new Map<string, string[]>();
    
    for (const file of files) {
      const basename = path.basename(file);
      const widgetName = this.extractWidgetName(basename);
      
      if (widgetName) {
        if (!groups.has(widgetName)) {
          groups.set(widgetName, []);
        }
        groups.get(widgetName)!.push(file);
      }
    }
    
    return Array.from(groups.entries()).map(([name, files]) => ({
      name,
      files,
      mainFile: files.find(f => f.endsWith('.tsx')) || files[0],
      category: this.inferCategory(name)
    }));
  }
  
  /**
   * Extract widget name from filename
   */
  private static extractWidgetName(filename: string): string | null {
    // Match patterns like: button.tsx, WmButton.tsx, button.component.js
    const match = filename.match(/^(Wm)?([A-Za-z]+)(\.|\.component|\.styles|\.props)?/);
    return match ? match[2] : null;
  }
  
  /**
   * Infer widget category from name
   */
  private static inferCategory(widgetName: string): string {
    const name = widgetName.toLowerCase();
    
    if (['button', 'label', 'text', 'icon'].includes(name)) return 'basic';
    if (['panel', 'container', 'card'].includes(name)) return 'container';
    if (['list', 'grid', 'table'].includes(name)) return 'data';
    if (['form', 'field'].includes(name)) return 'form';
    if (['checkbox', 'radioset', 'select', 'input'].includes(name)) return 'input';
    if (['gridlayout', 'linearlayout'].includes(name)) return 'layout';
    
    return 'advanced';
  }
}

