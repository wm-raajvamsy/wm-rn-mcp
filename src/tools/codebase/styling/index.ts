/**
 * Style & Theme Tools Registry
 * Exports all styling and theme related tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  SearchStyleDefinitionsTool,
  handleSearchStyleDefinitions
} from './styledef-search.js';
import {
  SearchClassNamesTool,
  handleSearchClassNames
} from './classname-search.js';
import {
  SearchThemeCompilationTool,
  handleSearchThemeCompilation
} from './theme-search.js';
import {
  SearchCssToRnTool,
  handleSearchCssToRn
} from './css-transform.js';
import {
  ReadThemeVariablesTool,
  handleReadThemeVariables
} from './theme-vars.js';
import {
  SearchNestedStylesTool,
  handleSearchNestedStyles
} from './nested-styles.js';
import {
  AnalyzeStylePrecedenceTool,
  handleAnalyzeStylePrecedence
} from './style-precedence.js';

/**
 * Tool definitions for styling and theme domain
 */
export const styleThemeTools: Tool[] = [
  {
    name: 'search_style_definitions',
    description: 'Searches for style definition files (.styledef.ts) in @wavemaker/rn-codegen that contain rnStyleSelector patterns for nested styling. Style definitions map CSS-like selectors to React Native style class names, enabling nested element styling (e.g., icon inside button, caption inside list item). The rnStyleSelector function generates class names like "button-icon", "list-caption" for specific widget parts. Use this tool to find how to style nested elements within widgets, discover available style selectors, and understand the class name generation pattern.',
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
          description: 'Style definition query (e.g., "button icon", "nested classes", "list item styles")'
        },
        component: {
          type: 'string',
          description: 'Specific component name (e.g., "button", "list", "card")'
        },
        extractClassNames: {
          type: 'boolean',
          description: 'Extract all rnStyleSelector class names from found files',
          default: true
        },
        includeNested: {
          type: 'boolean',
          description: 'Include nested style selectors',
          default: true
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
    name: 'search_class_names',
    description: 'Extracts and catalogs all rnStyleSelector-generated class names from style definition files. Returns structured data with component name, selector path, generated class name, and nesting information. For example, rnStyleSelector("button", "icon") generates "button-icon", while rnStyleSelector("list", "item", "caption") generates "list-item-caption". Use this tool when you need specific class names for styling widget parts, want to discover all available style hooks for a component, or need to understand the nesting structure.',
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
        component: {
          type: 'string',
          description: 'Optional: filter to specific component'
        },
        includeNested: {
          type: 'boolean',
          description: 'Include nested selectors (3+ levels)',
          default: true
        }
      },
      required: ['runtimePath', 'codegenPath']
    }
  },
  {
    name: 'search_theme_compilation',
    description: 'Searches for theme compilation and processing logic in WaveMaker codegen. Theme compilation includes ThemeService, theme file processing, LESS/CSS compilation to React Native StyleSheet, theme variable substitution, and platform-specific style generation. Use this tool to understand how themes are compiled from source files, how theme variables are processed, and how the theme system generates runtime-ready stylesheets.',
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
          description: 'Query about theme compilation (e.g., "theme processing", "LESS compilation", "style generation")'
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
    name: 'search_css_to_rn',
    description: 'Searches for CSS to React Native style transformation logic. This includes CSS parsing, property name conversion (e.g., background-color to backgroundColor), value transformation (e.g., px to dp), unit handling, and React Native StyleSheet generation. Use this tool to understand how CSS properties are converted to React Native equivalents, how units are transformed, and how the CSS-to-RN conversion pipeline works.',
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
          description: 'Query about CSS transformation (e.g., "CSS parsing", "property conversion", "unit transformation")'
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
    name: 'read_theme_variables',
    description: 'Reads theme variable definitions and values from theme configuration files. Theme variables include colors, fonts, spacing, sizes, and other design tokens used throughout the application. Variables can be defined at theme level and overridden per component. Use this tool to discover available theme variables, see default values, and understand how theme variables are defined and organized.',
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
        themeName: {
          type: 'string',
          description: 'Optional: specific theme name to read variables from'
        }
      },
      required: ['runtimePath', 'codegenPath']
    }
  },
  {
    name: 'search_nested_styles',
    description: 'Searches for nested style patterns and multi-level selectors in style definitions. Nested styles allow styling child elements within widgets using rnStyleSelector with 3+ parameters. For example, styling an icon within a button\'s left section: rnStyleSelector("button", "icon", "left"). Use this tool to discover complex nested styling patterns, understand multi-level style hierarchies, and find examples of nested selector usage.',
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
        component: {
          type: 'string',
          description: 'Optional: filter to specific component'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 15
        }
      },
      required: ['runtimePath', 'codegenPath']
    }
  },
  {
    name: 'analyze_style_precedence',
    description: 'Analyzes style application order and precedence rules in WaveMaker components. Style precedence determines which styles override others when multiple style sources are applied. The order is typically: 1) Default styles, 2) Theme styles, 3) User/Custom styles, 4) Component prop styles, 5) Inline styles (highest precedence). Use this tool to understand how styles are merged, which styles take priority, and how to properly override default styling.',
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
        component: {
          type: 'string',
          description: 'Optional: analyze precedence for specific component'
        }
      },
      required: ['runtimePath', 'codegenPath']
    }
  }
];

/**
 * Handler registry for style and theme tools
 */
export const styleThemeHandlers = new Map([
  ['search_style_definitions', handleSearchStyleDefinitions],
  ['search_class_names', handleSearchClassNames],
  ['search_theme_compilation', handleSearchThemeCompilation],
  ['search_css_to_rn', handleSearchCssToRn],
  ['read_theme_variables', handleReadThemeVariables],
  ['search_nested_styles', handleSearchNestedStyles],
  ['analyze_style_precedence', handleAnalyzeStylePrecedence]
]);

