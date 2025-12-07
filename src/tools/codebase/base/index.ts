/**
 * Base Component Tools Registry
 * Exports all base component related tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  SearchBaseComponentTool,
  handleSearchBaseComponent
} from './component-search.js';
import {
  ReadBaseComponentTool,
  handleReadBaseComponent
} from './component-read.js';
import {
  SearchLifecycleHooksTool,
  handleSearchLifecycleHooks
} from './lifecycle-search.js';
import {
  SearchPropsProviderTool,
  handleSearchPropsProvider
} from './props-provider.js';
import {
  SearchEventNotifierTool,
  handleSearchEventNotifier
} from './event-notifier.js';
import {
  AnalyzeComponentHierarchyTool,
  handleAnalyzeComponentHierarchy
} from './hierarchy-analyzer.js';

/**
 * Tool definitions for base component domain
 */
export const baseComponentTools: Tool[] = [
  {
    name: 'search_base_component',
    description: 'Searches for BaseComponent implementation and core infrastructure files in @wavemaker/app-rn-runtime. BaseComponent is the foundational abstract class that all WaveMaker widgets extend. It provides lifecycle management (componentDidMount, componentWillUnmount), property handling (styles, proxy, parent), event notification, state management, and context management. Use this tool to find files related to BaseComponent architecture, lifecycle hooks, property systems, styling mechanisms, and core component patterns.',
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
        query: {
          type: 'string',
          description: 'Semantic query about BaseComponent (e.g., "lifecycle hooks", "property handling", "state management")'
        },
        focus: {
          type: 'string',
          enum: ['lifecycle', 'properties', 'styling', 'events', 'all'],
          description: 'Focus area within BaseComponent',
          default: 'all'
        },
        includeTests: {
          type: 'boolean',
          description: 'Include test files in results',
          default: false
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return',
          default: 10
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'read_base_component',
    description: 'Reads and parses BaseComponent file structure, extracting methods, properties, lifecycle hooks, imports, and type definitions. BaseComponent contains critical methods like componentDidMount/WillUnmount (lifecycle), renderWidget (rendering), invokeEventCallback (events), updateState (state management), and applyStyles (styling). Use this tool after search_base_component to get detailed implementation structure including method signatures, property definitions, and code organization.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to BaseComponent file (from search_base_component result)'
        },
        extract: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['methods', 'properties', 'lifecycle', 'imports', 'exports', 'types']
          },
          description: 'What to extract from file',
          default: ['methods', 'properties', 'lifecycle']
        },
        includeComments: {
          type: 'boolean',
          description: 'Include JSDoc comments in extraction',
          default: true
        }
      },
      required: ['filePath']
    }
  },
  {
    name: 'search_lifecycle_hooks',
    description: 'Searches for lifecycle hook patterns and implementations in the WaveMaker component system. Lifecycle hooks include componentDidMount (initialization), componentWillUnmount (cleanup), componentDidUpdate (update detection), shouldComponentUpdate (optimization), and render/renderWidget (rendering). Use this tool to find how lifecycle methods are implemented, discover lifecycle patterns, and understand component initialization and cleanup sequences.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query about lifecycle hooks (e.g., "mount hooks", "cleanup", "update lifecycle")'
        },
        hookType: {
          type: 'string',
          enum: ['mount', 'unmount', 'update', 'render', 'all'],
          description: 'Type of lifecycle hook to search for',
          default: 'all'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return',
          default: 15
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_props_provider',
    description: 'Searches for PropsProvider implementation and property system in WaveMaker runtime. PropsProvider manages component properties, providing getProperty/setProperty methods for accessing widget props, handling property defaults, and managing property inheritance through the component tree. Use this tool to understand how properties are managed, how property values are resolved, and how the property system integrates with BaseComponent.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query about PropsProvider (e.g., "property management", "getProperty", "property inheritance")'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return',
          default: 10
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_event_notifier',
    description: 'Searches for event notifier and event system implementation in WaveMaker runtime. The event system includes EventNotifier class, event subscription/notification mechanisms, invokeEventCallback for widget events, and event propagation through the component tree. Use this tool to find how events are triggered, how components subscribe to events, and how event callbacks are managed.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query about event system (e.g., "event notification", "event listeners", "event callbacks")'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return',
          default: 10
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'analyze_component_hierarchy',
    description: 'Analyzes component hierarchy and inheritance relationships in the WaveMaker component system. Maps which components extend BaseComponent, discovers component inheritance chains, and identifies component relationships through imports and extensions. Use this tool to understand the component architecture, see which widgets extend BaseComponent, and discover component dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Optional: filter hierarchy to specific component name'
        },
        depth: {
          type: 'number',
          description: 'Maximum depth of hierarchy to analyze',
          default: 3
        }
      },
      required: ['runtimePath', 'codegenPath']
    }
  }
];

/**
 * Handler registry for base component tools
 */
export const baseComponentHandlers = new Map([
  ['search_base_component', handleSearchBaseComponent],
  ['read_base_component', handleReadBaseComponent],
  ['search_lifecycle_hooks', handleSearchLifecycleHooks],
  ['search_props_provider', handleSearchPropsProvider],
  ['search_event_notifier', handleSearchEventNotifier],
  ['analyze_component_hierarchy', handleAnalyzeComponentHierarchy]
]);

