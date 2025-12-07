/**
 * TypeScript/JSX AST parsing utilities
 */

import * as ts from 'typescript';
import {
  MethodSignature,
  PropertyDefinition,
  ImportInfo,
  ExportInfo,
  TypeDefinition,
  LifecycleHook
} from '../types.js';

/**
 * Parse TypeScript file and return AST
 */
export function parseTypeScriptFile(content: string): ts.SourceFile {
  return ts.createSourceFile(
    'temp.ts',
    content,
    ts.ScriptTarget.Latest,
    true
  );
}

/**
 * Extract method signatures from AST
 */
export function extractMethodSignatures(
  sourceFile: ts.SourceFile,
  includeComments: boolean = true
): MethodSignature[] {
  const methods: MethodSignature[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const name = node.name?.getText(sourceFile) || 'anonymous';
      const params = node.parameters.map(param => ({
        name: param.name.getText(sourceFile),
        type: param.type?.getText(sourceFile)
      }));
      
      const returnType = node.type?.getText(sourceFile);
      const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;
      const isStatic = node.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
      
      let comment: string | undefined;
      if (includeComments) {
        const commentRanges = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
        if (commentRanges && commentRanges.length > 0) {
          comment = sourceFile.text.substring(commentRanges[0].pos, commentRanges[0].end);
        }
      }
      
      methods.push({
        name,
        params,
        returnType,
        isAsync,
        isStatic,
        comment,
        lineNumber: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return methods;
}

/**
 * Extract property definitions from AST
 */
export function extractPropertyDefinitions(
  sourceFile: ts.SourceFile,
  includeComments: boolean = true
): PropertyDefinition[] {
  const properties: PropertyDefinition[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isPropertyDeclaration(node)) {
      const name = node.name.getText(sourceFile);
      const type = node.type?.getText(sourceFile);
      const defaultValue = node.initializer?.getText(sourceFile);
      const isReadonly = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || false;
      const isStatic = node.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
      
      let comment: string | undefined;
      if (includeComments) {
        const commentRanges = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
        if (commentRanges && commentRanges.length > 0) {
          comment = sourceFile.text.substring(commentRanges[0].pos, commentRanges[0].end);
        }
      }
      
      properties.push({
        name,
        type,
        defaultValue,
        isReadonly,
        isStatic,
        comment,
        lineNumber: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return properties;
}

/**
 * Extract lifecycle hooks from AST
 */
export function extractLifecycleHooks(sourceFile: ts.SourceFile): LifecycleHook[] {
  const hooks: LifecycleHook[] = [];
  const lifecycleMethodNames = [
    'componentDidMount',
    'componentWillUnmount',
    'componentDidUpdate',
    'componentWillMount',
    'shouldComponentUpdate',
    'render'
  ];
  
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node)) {
      const name = node.name?.getText(sourceFile);
      if (name && lifecycleMethodNames.includes(name)) {
        let type: LifecycleHook['type'] = 'other';
        if (name.includes('Mount')) type = 'mount';
        if (name.includes('Unmount')) type = 'unmount';
        if (name.includes('Update')) type = 'update';
        if (name === 'render') type = 'render';
        
        hooks.push({
          name,
          type,
          lineNumber: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return hooks;
}

/**
 * Extract import statements from AST
 */
export function extractImports(sourceFile: ts.SourceFile): ImportInfo[] {
  const imports: ImportInfo[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const source = (node.moduleSpecifier as ts.StringLiteral).text;
      const importClause = node.importClause;
      
      if (!importClause) return;
      
      const isDefault = !!importClause.name;
      const isNamespace = !!importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings);
      
      const importNames: Array<{ name: string; alias?: string }> = [];
      
      if (importClause.name) {
        importNames.push({ name: importClause.name.text });
      }
      
      if (importClause.namedBindings) {
        if (ts.isNamedImports(importClause.namedBindings)) {
          for (const element of importClause.namedBindings.elements) {
            importNames.push({
              name: element.name.text,
              alias: element.propertyName?.text
            });
          }
        } else if (ts.isNamespaceImport(importClause.namedBindings)) {
          importNames.push({ name: importClause.namedBindings.name.text });
        }
      }
      
      imports.push({
        source,
        imports: importNames,
        isDefault,
        isNamespace
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return imports;
}

/**
 * Extract export statements from AST
 */
export function extractExports(sourceFile: ts.SourceFile): ExportInfo[] {
  const exports: ExportInfo[] = [];
  
  function visit(node: ts.Node) {
    const modifiers = (node as any).modifiers;
    const isExported = modifiers?.some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword);
    const isDefault = modifiers?.some((m: any) => m.kind === ts.SyntaxKind.DefaultKeyword);
    
    if (isExported) {
      if (ts.isClassDeclaration(node) && node.name) {
        exports.push({
          name: node.name.text,
          isDefault: isDefault || false,
          type: 'class'
        });
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        exports.push({
          name: node.name.text,
          isDefault: isDefault || false,
          type: 'function'
        });
      } else if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            exports.push({
              name: declaration.name.text,
              isDefault: isDefault || false,
              type: 'variable'
            });
          }
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return exports;
}

/**
 * Extract type definitions from AST
 */
export function extractTypeDefinitions(sourceFile: ts.SourceFile): TypeDefinition[] {
  const types: TypeDefinition[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const members = node.members.map(member => ({
        name: member.name?.getText(sourceFile) || '',
        type: 'type' in member ? (member as any).type?.getText(sourceFile) : undefined
      }));
      
      types.push({
        name: node.name.text,
        kind: 'interface',
        members
      });
    } else if (ts.isTypeAliasDeclaration(node)) {
      types.push({
        name: node.name.text,
        kind: 'type'
      });
    } else if (ts.isEnumDeclaration(node)) {
      const members = node.members.map(member => ({
        name: member.name.getText(sourceFile),
        type: member.initializer?.getText(sourceFile)
      }));
      
      types.push({
        name: node.name.text,
        kind: 'enum',
        members
      });
    } else if (ts.isClassDeclaration(node) && node.name) {
      types.push({
        name: node.name.text,
        kind: 'class'
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return types;
}

