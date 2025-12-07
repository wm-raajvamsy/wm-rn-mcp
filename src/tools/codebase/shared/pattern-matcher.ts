/**
 * Code pattern matching utilities
 */

/**
 * Extract rnStyleSelector patterns from content
 */
export function extractRnStyleSelectors(
  content: string,
  includeNested: boolean = true
): Array<{
  component: string;
  selector: string;
  className: string;
  type: 'direct' | 'nested';
  nested: boolean;
  nestedSelector?: string;
}> {
  const classNames = [];
  
  // Pattern 1: Direct rnStyleSelector function call
  // rnStyleSelector('button', 'icon')
  const directPattern = /rnStyleSelector\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  
  while ((match = directPattern.exec(content)) !== null) {
    classNames.push({
      component: match[1],
      selector: match[2],
      className: `${match[1]}-${match[2]}`,
      type: 'direct' as const,
      nested: false
    });
  }
  
  // Pattern 2: Nested selectors (if includeNested)
  // rnStyleSelector('button', 'icon', 'left')
  if (includeNested) {
    const nestedPattern = /rnStyleSelector\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
    
    while ((match = nestedPattern.exec(content)) !== null) {
      classNames.push({
        component: match[1],
        selector: match[2],
        nestedSelector: match[3],
        className: `${match[1]}-${match[2]}-${match[3]}`,
        type: 'nested' as const,
        nested: true
      });
    }
  }
  
  // Pattern 3: Object property format
  // rnStyleSelector: 'component.selector' or 'component.selector.nested'
  const objectPattern = /rnStyleSelector\s*:\s*['"]([^'"]+)['"]/g;
  
  while ((match = objectPattern.exec(content)) !== null) {
    const parts = match[1].split('.');
    if (parts.length >= 2) {
      const component = parts[0];
      const selector = parts[1];
      
      if (parts.length === 2) {
        // Direct selector: 'component.selector'
        classNames.push({
          component,
          selector,
          className: `${component}-${selector}`,
          type: 'direct' as const,
          nested: false
        });
      } else if (includeNested && parts.length >= 3) {
        // Nested selector: 'component.selector.nested' or more levels
        const nestedSelector = parts.slice(2).join('.');
        classNames.push({
          component,
          selector,
          nestedSelector,
          className: parts.join('-'),
          type: 'nested' as const,
          nested: true
        });
      }
    }
  }
  
  return classNames;
}

/**
 * Extract widget transformer registrations
 */
export function extractTransformerRegistrations(content: string): Array<{
  widgetName: string;
  transformerClass: string;
  lineNumber?: number;
}> {
  const registrations = [];
  
  // Pattern: registry.register('wm-button', ButtonTransformer)
  const pattern = /registry\.register\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)\s*\)/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    registrations.push({
      widgetName: match[1],
      transformerClass: match[2]
    });
  }
  
  return registrations;
}

/**
 * Extract variable type definitions
 */
export function extractVariableTypes(content: string): Array<{
  typeName: string;
  baseClass?: string;
  category: 'live' | 'service' | 'device' | 'navigation' | 'timer' | 'other';
}> {
  const types = [];
  
  // Pattern: class LiveVariable extends BaseVariable
  const classPattern = /class\s+(\w+Variable)\s+extends\s+(\w+)/g;
  let match;
  
  while ((match = classPattern.exec(content)) !== null) {
    const typeName = match[1];
    const baseClass = match[2];
    
    let category: 'live' | 'service' | 'device' | 'navigation' | 'timer' | 'other' = 'other';
    if (typeName.includes('Live')) category = 'live';
    else if (typeName.includes('Service')) category = 'service';
    else if (typeName.includes('Device')) category = 'device';
    else if (typeName.includes('Navigation')) category = 'navigation';
    else if (typeName.includes('Timer')) category = 'timer';
    
    types.push({
      typeName,
      baseClass,
      category
    });
  }
  
  return types;
}

/**
 * Extract service class definitions
 */
export function extractServiceClasses(content: string): Array<{
  serviceName: string;
  isInjectable: boolean;
  dependencies?: string[];
}> {
  const services = [];
  
  // Pattern: @Injectable() or class ServiceName
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('@Injectable')) {
      // Next line should be the class
      if (i + 1 < lines.length) {
        const classMatch = lines[i + 1].match(/class\s+(\w+Service)/);
        if (classMatch) {
          services.push({
            serviceName: classMatch[1],
            isInjectable: true
          });
        }
      }
    } else {
      const classMatch = line.match(/class\s+(\w+Service)/);
      if (classMatch) {
        services.push({
          serviceName: classMatch[1],
          isInjectable: false
        });
      }
    }
  }
  
  return services;
}

/**
 * Extract template variable references
 */
export function extractTemplateVariables(content: string): string[] {
  const variables = new Set<string>();
  
  // Pattern: {{variableName}}
  const pattern = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const varName = match[1].trim().split('.')[0].split('[')[0];
    variables.add(varName);
  }
  
  return Array.from(variables);
}

