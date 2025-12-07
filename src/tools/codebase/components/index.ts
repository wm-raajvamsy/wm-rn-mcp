/**
 * Widget Component Tools Registry
 * Exports all widget component related tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  SearchWidgetComponentsTool,
  handleSearchWidgetComponents
} from './widget-search.js';
import {
  ReadWidgetStructureTool,
  handleReadWidgetStructure
} from './widget-read.js';
import {
  SearchWidgetByNameTool,
  handleSearchWidgetByName
} from './widget-by-name.js';
import {
  ListAllWidgetsTool,
  handleListAllWidgets
} from './widget-catalog.js';
import {
  SearchWidgetPropsTool,
  handleSearchWidgetProps
} from './widget-props.js';

/**
 * Tool definitions for widget component domain
 */
export const widgetComponentTools: Tool[] = [
  {
    name: 'search_widget_components',
    description: 'Searches for widget component implementations across 50+ pre-built React Native components in @wavemaker/app-rn-runtime. Widgets are organized by category: Basic (WmButton, WmLabel, WmText, WmIcon), Container (WmPanel, WmContainer, WmCard), Data (WmList, WmDataTable), Form (WmForm, WmText as input), Input (WmCheckbox, WmRadioset, WmSelect), Layout (WmGridLayout, WmLinearLayout), and Advanced (WmCalendar, WmChart). Each widget extends BaseComponent and includes .tsx (component), .component.js (generated), .styles.js (theme), and .props.ts (prop types) files. Use this tool to discover widget implementations by name, category, or functionality.',
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
          description: 'Widget name or category (e.g., "WmButton", "button", "list widgets", "form components")'
        },
        category: {
          type: 'string',
          enum: ['basic', 'container', 'data', 'form', 'input', 'layout', 'advanced', 'all'],
          description: 'Widget category filter',
          default: 'all'
        },
        includeRelated: {
          type: 'boolean',
          description: 'Include related files (.component.js, .styles.js, .props.ts)',
          default: true
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of widgets to return',
          default: 15
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'read_widget_structure',
    description: 'Reads and parses widget component file structure, extracting component class definition, prop interfaces, event handlers, render method, style applications, and widget-specific logic. Widgets implement getDefaultStyles() for default styling, renderWidget() for UI rendering, and specific handlers like onTap/onChange. Use this tool to understand how a specific widget is implemented, what props it accepts, how it handles events, and how it applies styles.',
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
        filePath: {
          type: 'string',
          description: 'Path to widget file (from search_widget_components result)'
        },
        extractProps: {
          type: 'boolean',
          description: 'Extract prop interface definition',
          default: true
        },
        extractEvents: {
          type: 'boolean',
          description: 'Extract event handler methods',
          default: true
        },
        extractStyles: {
          type: 'boolean',
          description: 'Extract style-related methods',
          default: true
        }
      },
      required: ['runtimePath', 'codegenPath', 'filePath']
    }
  },
  {
    name: 'search_widget_by_name',
    description: 'Searches for a specific widget by exact name (e.g., WmButton, Button). Performs precise name matching and optionally includes all related files (.tsx, .component.js, .styles.js, .props.ts). Use this tool when you know the exact widget name and want to find all its implementation files quickly.',
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
        widgetName: {
          type: 'string',
          description: 'Exact widget name (e.g., "WmButton", "Button", "List")'
        },
        includeRelated: {
          type: 'boolean',
          description: 'Include all related files (component.js, styles.js, props.ts)',
          default: true
        }
      },
      required: ['runtimePath', 'codegenPath', 'widgetName']
    }
  },
  {
    name: 'list_all_widgets',
    description: 'Lists all available widgets in the WaveMaker component library, organized by category. Returns a comprehensive catalog of all 50+ widgets with metadata including category, file count, and optional detailed information (prop interfaces, line counts, base class). Use this tool to discover all available widgets, see the complete widget library, or get an overview of widget distribution across categories.',
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
        category: {
          type: 'string',
          enum: ['basic', 'container', 'data', 'form', 'input', 'layout', 'advanced', 'all'],
          description: 'Filter by widget category',
          default: 'all'
        },
        includeMetadata: {
          type: 'boolean',
          description: 'Include detailed metadata (prop interfaces, line counts, etc.)',
          default: false
        }
      },
      required: ['runtimePath', 'codegenPath']
    }
  },
  {
    name: 'search_widget_props',
    description: 'Searches for widget property definitions and prop interfaces (.props.ts files). Finds TypeScript interfaces that define widget properties, including prop names, types, defaults, and descriptions. Use this tool to discover what props a widget accepts, understand prop types and constraints, or find prop interface definitions for widget customization.',
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
          description: 'Query about widget props (e.g., "button props", "list properties", "input validation")'
        },
        widgetName: {
          type: 'string',
          description: 'Optional: filter to specific widget name'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return',
          default: 15
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  }
];

/**
 * Handler registry for widget component tools
 */
export const widgetComponentHandlers = new Map([
  ['search_widget_components', handleSearchWidgetComponents],
  ['read_widget_structure', handleReadWidgetStructure],
  ['search_widget_by_name', handleSearchWidgetByName],
  ['list_all_widgets', handleListAllWidgets],
  ['search_widget_props', handleSearchWidgetProps]
]);

