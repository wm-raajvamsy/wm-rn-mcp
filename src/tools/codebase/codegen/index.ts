/**
 * Transpiler & Codegen Tools Registry
 * Exports all transpiler and code generation related tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  SearchTranspilerEngineTool,
  handleSearchTranspilerEngine
} from './transpiler-search.js';
import {
  SearchTransformerRegistryTool,
  handleSearchTransformerRegistry
} from './transformer-search.js';
import {
  SearchHtmlParserTool,
  handleSearchHtmlParser
} from './html-parser.js';
import {
  SearchCssParserTool,
  handleSearchCssParser
} from './css-parser.js';
import {
  SearchTemplateSystemTool,
  handleSearchTemplateSystem
} from './template-search.js';
import {
  SearchBuildFlowTool,
  handleSearchBuildFlow
} from './build-flow.js';

/**
 * Tool definitions for transpiler and codegen domain
 */
export const transpilerCodegenTools: Tool[] = [
  {
    name: 'search_transpiler_engine',
    description: 'Searches for transpiler engine implementation in @wavemaker/rn-codegen that converts WaveMaker HTML markup to React Native JSX. The transpiler pipeline includes: markup parsing (HTML/XML), AST transformation (applying widget transformers), code generation (JSX output), and template processing (Handlebars). Key components include TranspilerService, TransformerRegistry, MarkupParser, and CodeGenerator. Use this tool to understand how WaveMaker markup is converted to React Native code, find transpilation logic, and discover the transformation pipeline.',
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
          description: 'Query about transpiler (e.g., "transpilation pipeline", "markup conversion", "JSX generation")'
        },
        phase: {
          type: 'string',
          enum: ['parse', 'transform', 'generate', 'all'],
          description: 'Transpilation phase to focus on',
          default: 'all'
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
    name: 'search_transformer_registry',
    description: 'Searches for transformer registry and widget-specific transformers in the codegen system. The transformer registry maps widget types (wm-button, wm-list) to transformer classes that handle widget-specific conversion logic. Each transformer implements transformation rules for converting WaveMaker markup to React Native components. Use this tool to find transformer implementations, understand how specific widgets are transformed, and discover the transformer registration mechanism.',
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
          description: 'Query about transformers (e.g., "button transformer", "widget transformation", "transformer registry")'
        },
        widgetName: {
          type: 'string',
          description: 'Optional: specific widget name to find transformer for'
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
    name: 'search_html_parser',
    description: 'Searches for HTML/markup parsing logic in the codegen system. The HTML parser converts WaveMaker markup (XML/HTML) into an Abstract Syntax Tree (AST) for transformation. It handles custom wm- tags, attributes, data binding expressions, and markup structure. Use this tool to understand how markup is parsed, how the AST is built, and how parsing handles WaveMaker-specific markup extensions.',
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
          description: 'Query about HTML parsing (e.g., "markup parsing", "AST generation", "XML processing")'
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
    name: 'search_css_parser',
    description: 'Searches for CSS/LESS parsing logic in the codegen system. The CSS parser processes theme stylesheets (CSS/LESS), extracts style rules, and prepares them for React Native transformation. It handles LESS variables, mixins, nested rules, and converts them to React Native-compatible formats. Use this tool to understand how CSS/LESS is parsed, how style rules are extracted, and how the parser prepares styles for transformation.',
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
          description: 'Query about CSS parsing (e.g., "LESS parsing", "style extraction", "CSS processing")'
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
    name: 'search_template_system',
    description: 'Searches for template system and Handlebars template files in the codegen system. Templates define code generation patterns using Handlebars syntax with variables, helpers, and partials. Templates generate component files, page files, app configuration, and other code artifacts. Use this tool to find template files, understand template structure, discover template variables and helpers, and see how templates generate code.',
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
          description: 'Query about templates (e.g., "component template", "page generation", "Handlebars helpers")'
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
    name: 'search_build_flow',
    description: 'Searches for build flow and build pipeline implementation in the codegen system. The build pipeline orchestrates the complete code generation process: project analysis, markup transpilation, style compilation, asset processing, code generation, and output bundling. It supports different build profiles (development, production, preview) with varying configurations. Use this tool to understand the complete build process, find build orchestration logic, and discover how different build stages are coordinated.',
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
          description: 'Query about build flow (e.g., "build pipeline", "app generation", "build profiles")'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return',
          default: 10
        }
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  }
];

/**
 * Handler registry for transpiler and codegen tools
 */
export const transpilerCodegenHandlers = new Map([
  ['search_transpiler_engine', handleSearchTranspilerEngine],
  ['search_transformer_registry', handleSearchTransformerRegistry],
  ['search_html_parser', handleSearchHtmlParser],
  ['search_css_parser', handleSearchCssParser],
  ['search_template_system', handleSearchTemplateSystem],
  ['search_build_flow', handleSearchBuildFlow]
]);

