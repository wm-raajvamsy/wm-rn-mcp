/**
 * Fragment & Page Tools Registry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { handleSearchFragmentSystem } from './fragment-search.js';
import { handleSearchPageStructure } from './page-search.js';
import { handleSearchPrefabSystem } from './prefab-search.js';
import { CodebaseToolResult } from '../types.js';

export const fragmentPageTools: Tool[] = [
  {
    name: 'search_fragment_system',
    description: 'Searches for fragment system implementation including pages, partials, and prefabs. Fragments extend BaseFragment and provide lifecycle (onPageReady, onPageLeave), navigation (goToPage), and component hierarchy. Pages are full screens, partials are reusable page sections, prefabs are packaged components with markup/logic/styles. Use this tool to understand fragment architecture, page lifecycle, and how pages/partials/prefabs differ.',
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
    name: 'search_page_structure',
    description: 'Searches for page structure and page lifecycle implementation.',
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
    name: 'search_prefab_system',
    description: 'Searches for prefab system implementation and prefab packaging.',
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

export const fragmentPageHandlers = new Map<string, (args: any) => Promise<CodebaseToolResult>>([
  ['search_fragment_system', handleSearchFragmentSystem],
  ['search_page_structure', handleSearchPageStructure],
  ['search_prefab_system', handleSearchPrefabSystem]
]);

