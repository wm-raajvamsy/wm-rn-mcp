/**
 * Variable & Binding Tools Registry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { handleSearchVariableSystem } from './variable-search.js';
import { handleSearchBindingMechanism } from './binding-search.js';
import { handleSearchWatcherSystem } from './watcher-search.js';
import { handleSearchVariableTypes } from './variable-types.js';
import { handleAnalyzeBindingFlow } from './binding-flow.js';
import { CodebaseToolResult } from '../types.js';

export const variableBindingTools: Tool[] = [
  {
    name: 'search_variable_system',
    description: 'Searches for variable system implementation including Variable, LiveVariable, ServiceVariable, DeviceVariable, NavigationVariable, and TimerVariable classes. Variables provide reactive state management with lifecycle (init, invoke, success, error), data binding (dataSet property, dataValue for single values), and automatic UI updates. LiveVariable handles CRUD operations, ServiceVariable calls backend services, DeviceVariable accesses device APIs. Use this tool to find variable type implementations, understand variable lifecycle, and discover data binding mechanisms.',
    inputSchema: {
      type: 'object',
      properties: {
        runtimePath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/app-rn-runtime codebase directory'
        },
        codegenPath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/rn-codegen codebase directory'
        },
        query: {type: 'string', description: 'Query about variable system'},
        variableType: {type: 'string', enum: ['live', 'service', 'device', 'navigation', 'timer', 'all'], default: 'all'},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_binding_mechanism',
    description: 'Searches for data binding implementation including bind expressions, two-way binding, and property binding.',
    inputSchema: {
      type: 'object',
      properties: {
        runtimePath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/app-rn-runtime codebase directory'
        },
        codegenPath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/rn-codegen codebase directory'
        },
        query: {type: 'string'},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_watcher_system',
    description: 'Searches for watch system implementation including change detection, digest cycle, and watch optimization.',
    inputSchema: {
      type: 'object',
      properties: {
        runtimePath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/app-rn-runtime codebase directory'
        },
        codegenPath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/rn-codegen codebase directory'
        },
        query: {type: 'string'},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_variable_types',
    description: 'Searches for specific variable type implementations and their unique characteristics.',
    inputSchema: {
      type: 'object',
      properties: {
        runtimePath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/app-rn-runtime codebase directory'
        },
        codegenPath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/rn-codegen codebase directory'
        },
        variableType: {type: 'string', enum: ['live', 'service', 'device', 'navigation', 'timer']},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'variableType']
    }
  },
  {
    name: 'analyze_binding_flow',
    description: 'Analyzes data binding flow from source to target, including change propagation and update mechanisms.',
    inputSchema: {
      type: 'object',
      properties: {
        runtimePath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/app-rn-runtime codebase directory'
        },
        codegenPath: {
          type: 'string',
          description: 'Absolute path to @wavemaker/rn-codegen codebase directory'
        },
        componentName: {type: 'string', description: 'Optional: specific component to analyze'}
      },
      required: ['runtimePath', 'codegenPath']
    }
  }
];

export const variableBindingHandlers = new Map<string, (args: any) => Promise<CodebaseToolResult>>([
  ['search_variable_system', handleSearchVariableSystem],
  ['search_binding_mechanism', handleSearchBindingMechanism],
  ['search_watcher_system', handleSearchWatcherSystem],
  ['search_variable_types', handleSearchVariableTypes],
  ['analyze_binding_flow', handleAnalyzeBindingFlow]
]);

