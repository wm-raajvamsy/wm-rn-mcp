/**
 * Transpiler & Codegen Tools Registry
 * Exports all transpiler and code generation related tools
 */

import { z } from 'zod';
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
export const transpilerCodegenTools = [
  {
    name: 'search_transpiler_engine',
    description: `Searches for transpiler engine implementation that converts WaveMaker HTML markup to React Native JSX.

**WHAT IS IT:**
A transpiler engine finder that locates the core transpilation system converting WaveMaker HTML/XML markup into React Native JSX code. The pipeline has three phases: 1) Parse (HTML/XML → AST via MarkupParser), 2) Transform (AST → modified AST via widget-specific transformers), 3) Generate (AST → JSX via CodeGenerator + Handlebars templates). Key components include TranspilerService (orchestrator), TransformerRegistry (widget transformer mapping), MarkupParser (HTML parser), and CodeGenerator (JSX output).

**WHEN TO USE THIS TOOL:**
- When understanding the complete HTML to JSX conversion pipeline
- When debugging transpilation errors or unexpected output
- When learning how WaveMaker markup becomes React Native code
- When investigating specific transpilation phases (parse, transform, generate)
- When understanding how bind expressions are processed
- When seeing how widget transformers are applied
- When optimizing transpilation performance
- When implementing custom widget transformers

**WHY USE THIS TOOL:**
- Transpilation is the core of code generation, understanding it is essential
- Three-phase pipeline (parse → transform → generate) has distinct responsibilities
- Each widget type has a specific transformer with custom logic
- Bind expressions require special parsing and transformation
- AST manipulation is complex, seeing the implementation helps
- Generated JSX must match runtime component expectations
- Debugging transpilation requires understanding the pipeline
- Custom widgets need transformers following the same patterns

**KEY CAPABILITIES YOU CAN DISCOVER:**
- TranspilerService: Main orchestrator coordinating parse → transform → generate
- Parse Phase: HTML/XML parsing, AST generation, wm- tag handling, attribute parsing
- Transform Phase: Widget transformer application, bind expression processing, property mapping
- Generate Phase: JSX generation, Handlebars template usage, import statement generation
- TransformerRegistry: Maps widget types (wm-button, wm-list) to transformer classes
- MarkupParser: Parses HTML/XML into traversable AST
- CodeGenerator: Generates JSX from transformed AST
- Context Management: Passing data through pipeline phases
- Error Handling: How transpilation errors are caught and reported

Use phase parameter to focus: 'parse' for HTML parsing, 'transform' for AST transformation, 'generate' for JSX generation, or 'all' for complete pipeline.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about transpiler (e.g., "transpilation pipeline", "markup conversion", "JSX generation")'),
      phase: z.enum(['parse', 'transform', 'generate', 'all']).default('all').describe('Transpilation phase to focus on'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_transformer_registry',
    description: `Searches for transformer registry and widget-specific transformer implementations.

**WHAT IS IT:**
A transformer registry finder that locates the mapping system connecting widget types (wm-button, wm-list, wm-form) to their transformer classes. Each transformer implements widget-specific conversion rules: property mapping (markup attributes → component props), child element handling, bind expression processing, event handler generation, and JSX structure creation. The registry enables extensible transpilation where new widgets can add transformers.

**WHEN TO USE THIS TOOL:**
- When understanding how specific widgets are transformed
- When implementing transformers for custom widgets
- When debugging widget-specific transpilation issues
- When learning transformer registration mechanism
- When seeing how different widget types handle transformation
- When understanding property mapping patterns
- When discovering how bind expressions are processed per widget
- When comparing transformers across similar widgets

**WHY USE THIS TOOL:**
- Each widget type needs custom transformation logic
- Registry pattern enables modular, extensible transpilation
- Transformers handle widget-specific complexities (List pagination, Form validation)
- Property mapping varies by widget (caption vs label vs text)
- Some widgets have complex child element handling
- Bind expressions are processed differently per widget
- Understanding transformers is essential for custom widget development
- Transformer patterns reveal best practices

**KEY CAPABILITIES YOU CAN DISCOVER:**
- TransformerRegistry: Maps widget types to transformer classes
- Widget Transformers: ButtonTransformer, ListTransformer, FormTransformer, etc. (50+ transformers)
- Property Mapping: How markup attributes map to component props
- Child Handling: How nested elements are processed
- Bind Expression Processing: Widget-specific bind logic
- Event Handler Generation: onTap, onChange, onSelect transformation
- JSX Structure: How each widget generates its JSX output
- Registration Mechanism: How transformers register themselves
- Inheritance: Base transformers vs widget-specific transformers

Use widgetName parameter to find transformer for specific widget (e.g., "button", "list", "form").`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about transformers (e.g., "button transformer", "widget transformation", "transformer registry")'),
      widgetName: z.string().optional().describe('Optional: specific widget name to find transformer for'),
      maxResults: z.number().default(15).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_html_parser',
    description: `Searches for HTML/markup parsing logic that converts WaveMaker markup to AST.

**WHAT IS IT:**
An HTML parser finder that locates the parsing system converting WaveMaker HTML/XML markup into an Abstract Syntax Tree (AST). The parser handles custom wm- tags (wm-button, wm-list), standard HTML attributes, data binding expressions (bind:caption, bind:dataset), event handlers (on-tap, on-change), and nested element structures. It produces a traversable AST for the transformation phase.

**WHEN TO USE THIS TOOL:**
- When understanding how markup is parsed into AST
- When debugging parsing errors or malformed markup
- When learning how wm- tags are recognized
- When seeing how attributes are extracted
- When understanding bind expression parsing
- When investigating nested element handling
- When implementing custom markup extensions
- When optimizing parsing performance

**WHY USE THIS TOOL:**
- Parsing is the first phase of transpilation, errors here affect everything
- WaveMaker uses custom wm- tags not in standard HTML
- Bind expressions have special syntax requiring custom parsing
- AST structure determines what transformers can do
- Understanding parsing helps debug markup issues
- Custom tags need parser support
- Parser handles both HTML and XML syntax
- AST format is crucial for transformer development

**KEY CAPABILITIES YOU CAN DISCOVER:**
- HTML/XML Parser: Core parsing engine (likely htmlparser2 or similar)
- Custom Tag Handling: Recognition of wm- prefixed tags
- Attribute Parsing: Extraction of properties, bindings, events
- Bind Expression Parsing: bind:property syntax processing
- Event Handler Parsing: on-event attribute handling
- Nested Element Processing: Parent-child relationship establishment
- AST Structure: Node types, properties, traversal methods
- Error Handling: How parsing errors are detected and reported
- Whitespace Handling: Text node processing, whitespace normalization

Use this tool to understand the first critical phase of markup to code conversion.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about HTML parsing (e.g., "markup parsing", "AST generation", "XML processing")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_css_parser',
    description: `Searches for CSS/LESS parsing logic that processes theme stylesheets.

**WHAT IS IT:**
A CSS/LESS parser finder that locates the stylesheet parsing system processing theme files (CSS/LESS) for React Native transformation. The parser handles LESS variables (@primaryColor), mixins (@include), nested rules (.button { .icon {} }), and standard CSS. It uses a LESS compiler followed by CSS parsing (css-tree) to extract style rules, which are then transformed to React Native StyleSheet format.

**WHEN TO USE THIS TOOL:**
- When understanding how theme stylesheets are parsed
- When debugging CSS/LESS parsing errors
- When learning how LESS features are processed
- When seeing how style rules are extracted
- When understanding variable substitution timing
- When investigating mixin expansion
- When implementing custom CSS features
- When optimizing stylesheet parsing

**WHY USE THIS TOOL:**
- CSS/LESS parsing is separate from HTML parsing
- LESS features (variables, mixins, nesting) require preprocessing
- Parsed CSS must be transformed to React Native format
- Understanding parsing helps debug theme compilation issues
- Variable substitution happens during parsing
- Nested rules need flattening for RN
- Parser output feeds into CSS-to-RN transformation
- Custom LESS features need parser support

**KEY CAPABILITIES YOU CAN DISCOVER:**
- LESS Compiler: Preprocessing LESS to CSS (variables, mixins, nesting)
- CSS Parser: Parsing CSS into AST (likely css-tree)
- Variable Handling: @variable substitution and resolution
- Mixin Expansion: @include processing and code insertion
- Nested Rule Flattening: Converting nested selectors to flat selectors
- Rule Extraction: Pulling out style rules for transformation
- Selector Parsing: Understanding .class, #id, element selectors
- Media Query Handling: @media rule processing
- AST Structure: CSS AST format and traversal

Use this tool to understand how theme stylesheets are parsed before React Native transformation.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about CSS parsing (e.g., "LESS parsing", "style extraction", "CSS processing")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_template_system',
    description: `Searches for Handlebars template system and code generation templates.

**WHAT IS IT:**
A template system finder that locates Handlebars templates defining code generation patterns. Templates use Handlebars syntax ({{variable}}, {{#if}}, {{#each}}) with custom helpers and partials to generate component files, page files, app configuration, navigation setup, and other code artifacts. Templates receive data from transformers and produce formatted JavaScript/TypeScript code.

**WHEN TO USE THIS TOOL:**
- When understanding how code is generated from templates
- When seeing what code artifacts are generated
- When learning template structure and syntax
- When discovering available template variables
- When finding custom Handlebars helpers
- When understanding partial template reuse
- When implementing custom code generation
- When debugging generated code format

**WHY USE THIS TOOL:**
- Templates define the structure of generated code
- Handlebars provides powerful templating with helpers and partials
- Understanding templates helps customize code generation
- Template variables come from transformer output
- Custom helpers enable complex generation logic
- Partials promote template reuse and consistency
- Generated code format is determined by templates
- Template changes affect all generated files

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Template Files: Component templates, page templates, app templates, config templates
- Handlebars Syntax: {{variable}}, {{#if}}, {{#each}}, {{#with}} usage
- Template Variables: Data passed from transformers (props, children, bindings, events)
- Custom Helpers: Handlebars helpers for formatting, logic, utilities
- Partials: Reusable template fragments ({{> partial}})
- Code Generation Patterns: How JSX, imports, exports are generated
- Template Organization: Directory structure, naming conventions
- Output Format: JavaScript/TypeScript code structure

Use this tool to understand the final phase of code generation where templates produce actual code files.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about templates (e.g., "component template", "page generation", "Handlebars helpers")'),
      maxResults: z.number().default(15).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_build_flow',
    description: `Searches for build flow orchestration and complete code generation pipeline.

**WHAT IS IT:**
A build flow finder that locates the orchestration system coordinating the complete code generation process. The build pipeline executes multiple stages in sequence: 1) Project analysis (reading markup, metadata, variables), 2) Markup transpilation (HTML → JSX), 3) Style compilation (LESS/CSS → RN StyleSheet), 4) Asset processing (images, fonts, resources), 5) Code generation (components, pages, app), 6) Output bundling (creating final app structure). It supports different build profiles (development, production, preview) with varying optimizations.

**WHEN TO USE THIS TOOL:**
- When understanding the complete end-to-end build process
- When debugging build failures or issues
- When learning build stage dependencies and order
- When seeing how different build profiles work
- When understanding what gets generated during build
- When optimizing build performance
- When implementing custom build stages
- When troubleshooting output structure

**WHY USE THIS TOOL:**
- Build orchestration coordinates multiple complex stages
- Stage order matters (parse before transform, compile before bundle)
- Different profiles have different optimizations and outputs
- Understanding build flow helps debug generation issues
- Build process determines final app structure
- Performance optimization requires understanding bottlenecks
- Custom build stages need proper integration
- Build errors can occur in any stage

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Build Orchestration: Main build service coordinating all stages
- Stage Sequence: Project analysis → Transpilation → Compilation → Generation → Bundling
- Build Profiles: Development (fast, unoptimized), Production (slow, optimized), Preview (web preview)
- Project Analysis: Reading markup files, metadata, variables, services
- Transpilation Stage: Converting all markup to JSX
- Compilation Stage: Compiling themes to StyleSheet
- Asset Processing: Copying and optimizing images, fonts, resources
- Code Generation: Creating component files, page files, app files
- Output Structure: Final generated app directory structure
- Error Handling: How build errors are caught and reported
- Performance: Build time optimization strategies

Use this tool to understand how all code generation pieces come together in the complete build pipeline.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about build flow (e.g., "build pipeline", "app generation", "build profiles")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
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
