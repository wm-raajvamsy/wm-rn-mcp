/**
 * Service & DI Tools Registry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { handleSearchRuntimeServices } from './runtime-services.js';
import { handleSearchDiSystem } from './di-search.js';
import { handleSearchServiceLayer } from './service-layer.js';
import { CodebaseToolResult } from '../types.js';

export const serviceTools: Tool[] = [
  {
    name: 'search_runtime_services',
    description: 'Searches for runtime services (NavigationService, ModalService, SecurityService, etc.) and their implementation.',
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
        serviceName: {type: 'string', description: 'Optional: specific service name'},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_di_system',
    description: 'Searches for dependency injection system and injector implementation.',
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
    name: 'search_service_layer',
    description: 'Searches for service layer architecture and service registration.',
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
  }
];

export const serviceHandlers = new Map<string, (args: any) => Promise<CodebaseToolResult>>([
  ['search_runtime_services', handleSearchRuntimeServices],
  ['search_di_system', handleSearchDiSystem],
  ['search_service_layer', handleSearchServiceLayer]
]);

