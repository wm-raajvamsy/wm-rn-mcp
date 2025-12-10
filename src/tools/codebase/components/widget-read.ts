/**
 * Tool: read_widget_structure
 * Reads and parses widget component file structure with inheritance resolution
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
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load widget catalog
const WIDGET_CATALOG = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'widget-catalog.json'), 'utf-8')
).widgets;

interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
  source?: string;  // Which file this prop came from
}

interface EventDefinition {
  name: string;
  signature: string;
  description: string;
  source?: string;
}

interface StyleDefinition {
  defaultClass: string;
  parts: string[];
  classes: string[];
  classToPartMapping: Record<string, string>;  // Maps className to style part (e.g., "app-button-text" → "text")
}

export class ReadWidgetStructureTool extends CodebaseTool {
  private visitedFiles = new Set<string>();
  private visitedStyleFiles = new Set<string>();
  private readonly GENERIC_BASE_CLASSES = ['BaseProps', 'StyleProps', 'BaseComponent'];
  private readonly MAX_INHERITANCE_DEPTH = 5;
  
  /**
   * Get widget info from catalog
   */
  private getWidgetInfo(widgetName: string): { category: string; widget: string } | null {
    const normalizedName = widgetName.replace('Wm', '').toLowerCase();
    return WIDGET_CATALOG[normalizedName] || null;
  }

  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    filePath: string;
    extractProps?: boolean;
    extractEvents?: boolean;
    extractStyles?: boolean;
    resolveInheritance?: boolean;  // NEW: Auto-resolve parent classes
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    this.visitedFiles.clear();
    
    try {
      // Determine if this is a props file or component file
      const isPropsFile = args.filePath.includes('.props.js') || args.filePath.includes('.props.ts');
      
      if (isPropsFile && args.resolveInheritance !== false) {
        // Enhanced mode: resolve inheritance and return complete widget data
        return await this.executeEnhanced(args);
      } else {
        // Legacy mode: basic structure extraction
        return await this.executeLegacy(args);
      }
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

  /**
   * Enhanced mode: Resolve inheritance and return complete widget data
   */
  private async executeEnhanced(args: {
    runtimePath: string;
    codegenPath: string;
    filePath: string;
    extractProps?: boolean;
    extractEvents?: boolean;
    extractStyles?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    // Extract widget name from file path
    const widgetName = this.extractWidgetNameFromPath(args.filePath);
    
    // Resolve all props (including inherited)
    const allProps = await this.resolveInheritedProps(args.filePath, 0);
    
    // Separate events from props
    const events: EventDefinition[] = [];
    const props: PropDefinition[] = [];
    
    for (const prop of allProps) {
      if (this.isEvent(prop)) {
        events.push({
          name: prop.name,
          signature: prop.type,
          description: `Triggered when ${prop.name.replace('on', '').toLowerCase()} occurs`,
          source: prop.source
        });
      }
      props.push(prop);  // Keep in props too (events are props in React)
    }
    
    // Get inheritance chain
    const content = await this.read(args.filePath);
    const inheritanceChain = await this.getInheritanceChain(args.filePath);
    
    // Extract styles if requested (including parent styles)
    let styles: StyleDefinition | null = null;
    if (args.extractStyles !== false) {
      this.visitedStyleFiles.clear();
      styles = await this.extractStylesWithInheritance(args.filePath, widgetName, 0);
    }
    
    return {
      success: true,
      data: {
        widgetName,
        filePath: args.filePath,
        content,
        props,
        events,
        styles,
        inheritance: {
          immediate: inheritanceChain[0] || null,
          chain: inheritanceChain,
          totalProps: props.length,
          propsFromParents: props.filter(p => p.source !== args.filePath).length
        },
        stats: {
          totalProps: props.length,
          ownProps: props.filter(p => p.source === args.filePath).length,
          inheritedProps: props.filter(p => p.source !== args.filePath).length,
          events: events.length,
          inheritanceLevels: inheritanceChain.length,
          styleParts: styles?.parts.length || 0,
          styleClasses: styles?.classes.length || 0
        }
      },
      meta: {
        domain: 'widget-structure',
        executionTimeMs: Date.now() - startTime
      }
    };
  }

  /**
   * Legacy mode: Basic structure extraction (backward compatible)
   */
  private async executeLegacy(args: {
    runtimePath: string;
    codegenPath: string;
    filePath: string;
    extractProps?: boolean;
    extractEvents?: boolean;
    extractStyles?: boolean;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
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
  }

  /**
   * Recursively resolve all props from the class and its parents
   */
  private async resolveInheritedProps(
    filePath: string,
    depth: number
  ): Promise<PropDefinition[]> {
    // Prevent infinite recursion and circular dependencies
    if (depth >= this.MAX_INHERITANCE_DEPTH || this.visitedFiles.has(filePath)) {
      return [];
    }
    this.visitedFiles.add(filePath);

    try {
      const content = await this.read(filePath);
      
      // Extract props from this file
      const ownProps = this.extractPropsFromContent(content, filePath);
      
      // Check if this class extends another
      const parentClass = this.extractParentClass(content);
      
      // Stop if this is a generic base class
      if (!parentClass || this.GENERIC_BASE_CLASSES.includes(parentClass)) {
        return ownProps;
      }
      
      // Find parent file path
      const parentFilePath = await this.findParentFilePath(content, parentClass, filePath);
      
      if (!parentFilePath) {
        return ownProps;
      }
      
      // Recursively get parent props
      const parentProps = await this.resolveInheritedProps(parentFilePath, depth + 1);
      
      // Combine: child props override parent props (for defaults)
      return [...ownProps, ...parentProps];
      
    } catch (error) {
      console.error(`Error resolving props from ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Extract props from file content using _defineProperty pattern
   */
  private extractPropsFromContent(content: string, filePath: string): PropDefinition[] {
    const props: PropDefinition[] = [];
    
    // Pattern: _defineProperty(this, "propName", defaultValue);
    const propPattern = /_defineProperty\(this,\s*["'](\w+)["'],\s*(.+?)\);/g;
    
    let match;
    while ((match = propPattern.exec(content)) !== null) {
      const propName = match[1];
      const defaultValue = match[2].trim();
      
      props.push({
        name: propName,
        type: this.inferType(defaultValue),
        required: false,
        default: defaultValue,
        description: '',
        source: filePath
      });
    }
    
    return props;
  }

  /**
   * Extract parent class name from "extends ParentClass"
   */
  private extractParentClass(content: string): string | null {
    const match = content.match(/class\s+\w+\s+extends\s+(\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Find the file path for the parent class by looking at imports
   */
  private async findParentFilePath(
    content: string,
    parentClassName: string,
    currentFilePath: string
  ): Promise<string | null> {
    // Look for import statement
    const importPattern = new RegExp(
      `import\\s+(?:{[^}]*\\b${parentClassName}\\b[^}]*}|\\b${parentClassName}\\b)\\s+from\\s+["']([^"']+)["']`,
      'g'
    );
    
    const match = importPattern.exec(content);
    if (!match) {
      return null;
    }
    
    const importPath = match[1];
    
    // Resolve relative path
    const currentDir = path.dirname(currentFilePath);
    let resolvedPath: string;
    
    if (importPath.startsWith('.')) {
      // Relative import
      resolvedPath = path.resolve(currentDir, importPath);
    } else if (importPath.startsWith('@wavemaker/')) {
      // Package import - resolve to runtime path
      const relativePath = importPath.replace('@wavemaker/app-rn-runtime/', '');
      resolvedPath = path.join(this.runtimePath, relativePath);
    } else {
      return null;
    }
    
    // Add .js extension if not present
    if (!resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.ts')) {
      resolvedPath += '.js';
    }
    
    return resolvedPath;
  }

  /**
   * Get the full inheritance chain (including generic base classes for visibility)
   */
  private async getInheritanceChain(filePath: string, chain: string[] = []): Promise<string[]> {
    if (chain.length >= this.MAX_INHERITANCE_DEPTH) {
      return chain;
    }

    try {
      const content = await this.read(filePath);
      const parentClass = this.extractParentClass(content);
      
      if (!parentClass) {
        return chain;
      }
      
      chain.push(parentClass);
      
      // Stop recursion at generic base classes, but include them in chain for visibility
      if (this.GENERIC_BASE_CLASSES.includes(parentClass)) {
        return chain;
      }
      
      const parentFilePath = await this.findParentFilePath(content, parentClass, filePath);
      if (parentFilePath) {
        return await this.getInheritanceChain(parentFilePath, chain);
      }
      
      return chain;
    } catch {
      return chain;
    }
  }

  /**
   * Check if a prop is an event (starts with 'on' or known event names)
   */
  private isEvent(prop: PropDefinition): boolean {
    // Event props start with 'on' OR are known event callback names
    const knownEvents = ['triggerValidation'];  // checkFormField is a method ref, not an event
    return prop.name.startsWith('on') || knownEvents.includes(prop.name);
  }

  /**
   * Infer type from default value
   */
  private inferType(defaultValue: string): string {
    if (defaultValue === 'null' || defaultValue === 'void 0' || defaultValue === 'undefined') {
      return 'any';
    }
    if (defaultValue === 'true' || defaultValue === 'false') {
      return 'boolean';
    }
    if (defaultValue.match(/^['"].*['"]$/)) {
      return 'string';
    }
    if (defaultValue.match(/^\d+$/)) {
      return 'number';
    }
    if (defaultValue.includes('=>') || defaultValue.includes('function')) {
      return 'function';
    }
    if (defaultValue.startsWith('[')) {
      return 'array';
    }
    if (defaultValue.startsWith('{')) {
      return 'object';
    }
    return 'any';
  }

  /**
   * Extract widget name from file path
   */
  private extractWidgetNameFromPath(filePath: string): string {
    const match = filePath.match(/\/([^/]+)\.props\.js$/);
    if (match) {
      return 'Wm' + match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    return 'Unknown';
  }

  /**
   * Extract styles with inheritance (recursively get parent styles)
   */
  private async extractStylesWithInheritance(
    propsFilePath: string,
    widgetName: string,
    depth: number
  ): Promise<StyleDefinition | null> {
    if (depth >= this.MAX_INHERITANCE_DEPTH) {
      return null;
    }

    // Get styles from current widget
    const currentStyles = await this.extractStyles(propsFilePath, widgetName);
    
    if (!currentStyles) {
      return null;
    }

    // Check if widget has a parent
    try {
      const propsContent = await this.read(propsFilePath);
      const parentClass = this.extractParentClass(propsContent);
      
      // If no parent or generic base class, return current styles
      if (!parentClass || this.GENERIC_BASE_CLASSES.includes(parentClass)) {
        return currentStyles;
      }

      // Find parent props file
      const parentFilePath = await this.findParentFilePath(propsContent, parentClass, propsFilePath);
      
      if (!parentFilePath || this.visitedStyleFiles.has(parentFilePath)) {
        return currentStyles;
      }

      this.visitedStyleFiles.add(parentFilePath);

      // Get parent styles recursively
      const parentWidgetName = this.extractWidgetNameFromPath(parentFilePath);
      const parentStyles = await this.extractStylesWithInheritance(parentFilePath, parentWidgetName, depth + 1);

      if (!parentStyles) {
        return currentStyles;
      }

      // Merge parent and current styles (current takes precedence)
      return {
        defaultClass: currentStyles.defaultClass || parentStyles.defaultClass,
        parts: [...new Set([...currentStyles.parts, ...parentStyles.parts])],
        classes: [...new Set([...currentStyles.classes, ...parentStyles.classes])],
        classToPartMapping: {
          ...parentStyles.classToPartMapping,
          ...currentStyles.classToPartMapping // Current overrides parent
        }
      };

    } catch (error) {
      console.error(`Error extracting parent styles for ${widgetName}:`, error);
      return currentStyles;
    }
  }

  /**
   * Extract style information from .styles.js and styledef
   */
  private async extractStyles(propsFilePath: string, widgetName: string): Promise<StyleDefinition | null> {
    try {
      // Find .styles.js file (sibling to .props.js)
      const stylesFilePath = propsFilePath.replace('.props.js', '.styles.js');
      
      let defaultClass = '';
      let parts: string[] = [];
      let classes: string[] = [];
      const classToPartMapping: Record<string, string> = {};
      
      // Read styles file from runtime
      try {
        const stylesContent = await this.read(stylesFilePath);
        
        // Extract DEFAULT_CLASS
        const defaultClassMatch = stylesContent.match(/export\s+const\s+DEFAULT_CLASS\s*=\s*['"]([^'"]+)['"]/);
        if (defaultClassMatch) {
          defaultClass = defaultClassMatch[1];
          classes.push(defaultClass);
        }
        
        // Extract style parts from defineStyles call
        // Find the defineStyles block and extract keys
        const defineStylesMatch = stylesContent.match(/defineStyles\s*\(\s*\{([\s\S]*?)\}\s*\)/);
        if (defineStylesMatch) {
          const styleBlock = defineStylesMatch[1];
          // Extract top-level keys (style parts)
          const partPattern = /^\s*(\w+)\s*:\s*\{/gm;
          let partMatch;
          while ((partMatch = partPattern.exec(styleBlock)) !== null) {
            const partName = partMatch[1];
            parts.push(partName);
          }
        }
        
        // Extract all addStyle calls to get style classes
        // Pattern: addStyle('class-name', ...
        const addStylePattern = /addStyle\s*\(\s*['"]([^'"]+)['"]/g;
        let styleMatch;
        while ((styleMatch = addStylePattern.exec(stylesContent)) !== null) {
          const className = styleMatch[1];
          if (!classes.includes(className)) {
            classes.push(className);
          }
        }
        
        // Also extract classes from DEFAULT_CLASS concatenations
        // Pattern: DEFAULT_CLASS + '-disabled'
        const classConcatPattern = /DEFAULT_CLASS\s*\+\s*['"]([^'"]+)['"]/g;
        let concatMatch;
        while ((concatMatch = classConcatPattern.exec(stylesContent)) !== null) {
          const suffix = concatMatch[1];
          const fullClassName = defaultClass + suffix;
          if (!classes.includes(fullClassName)) {
            classes.push(fullClassName);
          }
        }
        
      } catch (error) {
        console.error(`Could not read styles file: ${stylesFilePath}`, error);
      }
      
      // Find styledef in codegen to get className → part mapping using catalog
      try {
        const widgetNameLower = widgetName.replace('Wm', '').toLowerCase();
        const widgetInfo = this.getWidgetInfo(widgetName);
        
        if (!widgetInfo) {
          console.error(`Widget ${widgetName} not found in catalog`);
          return {
            defaultClass,
            parts: [...new Set(parts)],
            classes: [...new Set(classes)],
            classToPartMapping
          };
        }
        
        // Construct the correct styledef path using catalog info
        // codegenPath is typically .../wavemaker-rn-codegen/build
        // styledef files are in .../wavemaker-rn-codegen/src/theme/components/
        const styledefPath = path.join(
          this.codegenPath,
          '../src/theme/components',
          widgetInfo.category,
          `${widgetInfo.widget}.styledef.ts`
        );
        
        let styledefContent: string;
        try {
          styledefContent = await this.read(styledefPath);
        } catch (error) {
          // Not an error - some widgets may not have styledef
          return {
            defaultClass,
            parts: [...new Set(parts)],
            classes: [...new Set(classes)],
            classToPartMapping
          };
        }
        
        // Extract className to rnStyleSelector mapping
        // Pattern: { className: '.app-button', rnStyleSelector: 'app-button.root', ... }
        const mappingPattern = /\{\s*className:\s*['"]\.?([a-z0-9-]+)['"]\s*,\s*rnStyleSelector:\s*['"]([^'"]+)['"]/g;
        let mappingMatch;
        while ((mappingMatch = mappingPattern.exec(styledefContent)) !== null) {
          const className = mappingMatch[1];
          const rnStyleSelector = mappingMatch[2];
          
          // Extract the part name from rnStyleSelector (e.g., 'app-button.root' → 'root')
          const partName = rnStyleSelector.split('.').pop();
          if (partName) {
            classToPartMapping[className] = partName;
          }
          
          // Also add className to classes list if not already there
          if (!classes.includes(className)) {
            classes.push(className);
          }
        }
        
        // Also extract className values from styledef for completeness
        const classNamePattern = /className:\s*['"]\.?([a-z0-9-]+)['"]/g;
        let classMatch;
        while ((classMatch = classNamePattern.exec(styledefContent)) !== null) {
          const className = classMatch[1];
          if (!classes.includes(className)) {
            classes.push(className);
          }
        }
      } catch (error) {
        // Styledef might not exist, that's okay
        console.error(`Could not read styledef for ${widgetName}`);
      }
      
      return {
        defaultClass,
        parts: [...new Set(parts)],  // Deduplicate
        classes: [...new Set(classes)],  // Deduplicate
        classToPartMapping
      };
      
    } catch (error) {
      console.error(`Error extracting styles:`, error);
      return null;
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

