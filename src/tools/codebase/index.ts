/**
 * Main Codebase Tools Registry
 * Exports all 35 codebase tools for MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodebaseToolResult } from './types.js';

// Import all tool groups
import { baseComponentTools, baseComponentHandlers } from './base/index.js';
import { widgetComponentTools, widgetComponentHandlers } from './components/index.js';
import { styleThemeTools, styleThemeHandlers } from './styling/index.js';
import { transpilerCodegenTools, transpilerCodegenHandlers } from './codegen/index.js';
import { variableBindingTools, variableBindingHandlers } from './variables/index.js';
import { fragmentPageTools, fragmentPageHandlers } from './fragments/index.js';
import { serviceTools, serviceHandlers } from './services/index.js';

/**
 * All 35 codebase tools
 */
export const codebaseTools: Tool[] = [
  ...baseComponentTools,        // 6 tools
  ...widgetComponentTools,       // 5 tools
  ...styleThemeTools,            // 7 tools
  ...transpilerCodegenTools,     // 6 tools
  ...variableBindingTools,       // 5 tools
  ...fragmentPageTools,          // 3 tools
  ...serviceTools                // 3 tools
];

/**
 * Combined handler registry
 */
export const codebaseToolHandlers = new Map([
  ...baseComponentHandlers,
  ...widgetComponentHandlers,
  ...styleThemeHandlers,
  ...transpilerCodegenHandlers,
  ...variableBindingHandlers,
  ...fragmentPageHandlers,
  ...serviceHandlers
]);

/**
 * Execute a codebase tool
 */
export async function executeCodebaseTool(
  toolName: string,
  args: any
): Promise<CodebaseToolResult> {
  const handler = codebaseToolHandlers.get(toolName);
  
  if (!handler) {
    return {
      success: false,
      error: `Unknown codebase tool: ${toolName}`,
      meta: {
        domain: 'unknown',
        executionTimeMs: 0
      }
    };
  }
  
  try {
    return await handler(args);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        domain: 'unknown',
        executionTimeMs: 0
      }
    };
  }
}

/**
 * Get tool by name
 */
export function getCodebaseTool(toolName: string): Tool | undefined {
  return codebaseTools.find(t => t.name === toolName);
}

/**
 * Get all tool names
 */
export function getCodebaseToolNames(): string[] {
  return codebaseTools.map(t => t.name);
}

/**
 * Re-export individual handler groups for testing
 */
export {
  baseComponentHandlers,
  widgetComponentHandlers,
  styleThemeHandlers,
  transpilerCodegenHandlers,
  variableBindingHandlers,
  fragmentPageHandlers,
  serviceHandlers
};

