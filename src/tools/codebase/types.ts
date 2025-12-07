/**
 * Shared types and interfaces for codebase tools
 */

/**
 * Required paths for codebase tools
 */
export interface CodebasePaths {
  runtimePath: string;  // Path to @wavemaker/app-rn-runtime
  codegenPath: string;  // Path to @wavemaker/rn-codegen
}

/**
 * Standard result format for all codebase tools
 */
export interface CodebaseToolResult {
  success: boolean;
  data?: {
    files?: FileInfo[];
    structure?: any;
    classNames?: ClassNameInfo[];
    [key: string]: any;
  };
  error?: string;
  meta: {
    domain: string;
    executionTimeMs: number;
    searchStrategy?: string;
    totalFound?: number;
  };
}

/**
 * File information with metadata
 */
export interface FileInfo {
  path: string;
  preview: string;
  relevance: number;
  lineCount: number;
  type?: 'tsx' | 'ts' | 'js' | 'template' | 'other';
}

/**
 * Class name information from style definitions
 */
export interface ClassNameInfo {
  component: string;
  selector: string;
  className: string;
  file: string;
  nested: boolean;
  nestedSelector?: string;
}

/**
 * Tool input schema definition
 */
export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, any>;
  required: string[];
}

/**
 * Method signature extracted from AST
 */
export interface MethodSignature {
  name: string;
  params: Array<{ name: string; type?: string }>;
  returnType?: string;
  isAsync: boolean;
  isStatic: boolean;
  comment?: string;
  lineNumber?: number;
}

/**
 * Property definition extracted from AST
 */
export interface PropertyDefinition {
  name: string;
  type?: string;
  defaultValue?: string;
  isReadonly: boolean;
  isStatic: boolean;
  comment?: string;
  lineNumber?: number;
}

/**
 * Import statement information
 */
export interface ImportInfo {
  source: string;
  imports: Array<{ name: string; alias?: string }>;
  isDefault: boolean;
  isNamespace: boolean;
}

/**
 * Export statement information
 */
export interface ExportInfo {
  name: string;
  isDefault: boolean;
  type: 'class' | 'function' | 'variable' | 'type' | 'interface';
}

/**
 * Type definition information
 */
export interface TypeDefinition {
  name: string;
  kind: 'interface' | 'type' | 'enum' | 'class';
  members?: Array<{ name: string; type?: string }>;
  comment?: string;
}

/**
 * Lifecycle hook information
 */
export interface LifecycleHook {
  name: string;
  type: 'mount' | 'unmount' | 'update' | 'render' | 'other';
  lineNumber?: number;
}

/**
 * Widget category types
 */
export type WidgetCategory = 'basic' | 'container' | 'data' | 'form' | 'input' | 'layout' | 'advanced' | 'all';

/**
 * Focus area types for searches
 */
export type FocusArea = 'lifecycle' | 'properties' | 'styling' | 'events' | 'all';

/**
 * Transpilation phase types
 */
export type TranspilationPhase = 'parse' | 'transform' | 'generate' | 'all';

