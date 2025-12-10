/**
 * Style & Theme Tools Registry
 * Exports all styling and theme related tools
 */

import { z } from 'zod';
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
export const styleThemeTools = [
  {
    name: 'search_theme_compilation',
    description: `Searches for theme compilation pipeline and processing logic in WaveMaker codegen.

**WHAT IS IT:**
A theme compilation system finder that locates ThemeService and the complete theme processing pipeline. The compilation process transforms LESS/CSS source files into React Native StyleSheet objects through multiple stages: LESS compilation, CSS parsing (css-tree), property transformation (background-color → backgroundColor), value conversion (px → dp), theme variable substitution (@primaryColor → #007bff), and platform-specific style generation (iOS vs Android). The output is runtime-ready JavaScript theme files.

**WHEN TO USE THIS TOOL:**
- When understanding how themes are built from source to runtime
- When debugging theme compilation issues or errors
- When learning the LESS to React Native StyleSheet pipeline
- When investigating how theme variables are processed and substituted
- When understanding platform-specific style generation
- When creating custom theme compilation workflows
- When troubleshooting why styles aren't appearing in the app
- When optimizing theme compilation performance

**WHY USE THIS TOOL:**
- Theme compilation is a complex multi-stage pipeline
- Understanding the pipeline helps debug styling issues at the source
- LESS/CSS to React Native conversion has many transformation rules
- Theme variables are processed during compilation, not runtime
- Platform-specific styles require conditional compilation logic
- Generated theme files are optimized JavaScript, not readable CSS
- Compilation errors can be cryptic without understanding the pipeline
- Custom themes require understanding the compilation process

**KEY CAPABILITIES YOU CAN DISCOVER:**
- ThemeService: Main orchestrator of theme compilation process
- LESS Compilation: How LESS variables, mixins, and nesting are processed
- CSS Parsing: css-tree usage for parsing CSS into AST
- Property Transformation: CSS property name to RN property name mapping (200+ mappings)
- Value Conversion: Unit transformation (px, em, rem → dp), color formats (hex, rgb, rgba)
- Variable Substitution: How @variables are replaced with actual values
- Platform-Specific Generation: iOS vs Android style differences
- StyleSheet Generation: How React Native StyleSheet.create() is generated
- Output Format: Structure of generated theme.js files

Use this tool to trace the complete journey from LESS/CSS source files to runtime StyleSheet objects.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about theme compilation (e.g., "theme processing", "LESS compilation", "style generation")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_css_to_rn',
    description: `Searches for CSS to React Native style transformation and conversion logic.

**WHAT IS IT:**
A CSS transformation system finder that locates the conversion logic transforming CSS properties and values into React Native StyleSheet equivalents. This includes CSS parsing (css-tree), property name conversion (background-color → backgroundColor, font-size → fontSize), value transformation (16px → 16, 1em → 16), unit handling (px, em, rem, %, vh, vw), color format conversion (hex, rgb, rgba, hsl), and React Native StyleSheet generation. It's the core of making CSS work in React Native.

**WHEN TO USE THIS TOOL:**
- When understanding how CSS properties map to React Native
- When debugging why a CSS property isn't working in RN
- When learning which CSS properties are supported
- When investigating unit conversion logic (px to dp)
- When understanding color format transformations
- When seeing how unsupported CSS properties are handled
- When optimizing CSS to RN conversion performance
- When implementing custom CSS property support

**WHY USE THIS TOOL:**
- CSS and React Native have different property names and value formats
- Not all CSS properties are supported in React Native
- Unit conversion is complex (px, em, rem, %, viewport units)
- Color formats need conversion (CSS supports more than RN)
- Understanding mappings prevents "why doesn't this CSS work?" issues
- Some CSS properties require special handling (flexbox, positioning)
- Transformation logic has 200+ property mappings
- Knowing limitations helps write RN-compatible CSS

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Property Name Mapping: 200+ CSS properties to RN equivalents (background-color → backgroundColor)
- Value Transformation: Unit conversion (px → number, em → calculated dp)
- Unit Handling: px, em, rem, %, vh, vw, vmin, vmax conversion logic
- Color Conversion: hex, rgb, rgba, hsl, hsla, named colors to RN format
- Unsupported Properties: How unsupported CSS is handled (ignored, warned, approximated)
- Special Cases: Flexbox, positioning, transforms, animations
- Vendor Prefixes: -webkit-, -moz-, -ms- handling
- Shorthand Expansion: margin, padding, border shorthand to longhand
- StyleSheet Generation: How final RN StyleSheet objects are created

Use this tool to understand the complete CSS to React Native transformation pipeline and discover which CSS features are supported.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about CSS transformation (e.g., "CSS parsing", "property conversion", "unit transformation")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'read_theme_variables',
    description: `Reads theme variable definitions, values, and organization from theme configuration files.

**WHAT IS IT:**
A theme variable reader that extracts variable definitions from theme configuration files. Theme variables are design tokens (colors, fonts, spacing, sizes, borders, shadows) used consistently throughout the application. Variables can be defined at theme level (global) and overridden per component (local). They use LESS/CSS variable syntax (@primaryColor, @baseFontSize) and are substituted during theme compilation.

**WHEN TO USE THIS TOOL:**
- When discovering what theme variables are available
- When seeing default values for colors, fonts, spacing, etc.
- When understanding how to customize theme appearance
- When learning variable naming conventions
- When finding which variables a specific widget uses
- When planning theme customization or branding
- When debugging variable substitution issues
- When documenting theme customization options

**WHY USE THIS TOOL:**
- Theme variables are the primary way to customize app appearance
- Knowing available variables prevents reinventing existing tokens
- Default values show the baseline theme configuration
- Variable organization reveals design system structure
- Component-level overrides show widget-specific customizations
- Understanding variables helps maintain consistent styling
- Variable names follow conventions but aren't always obvious
- Discovering variables is faster than reading LESS files manually

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Color Variables: @primaryColor, @successColor, @dangerColor, @warningColor, @infoColor, @textColor, @backgroundColor
- Typography Variables: @baseFont, @baseFontSize, @headingFont, @lineHeight, @fontWeight
- Spacing Variables: @baseMargin, @basePadding, @gridGutter, @componentSpacing
- Size Variables: @inputHeight, @buttonHeight, @iconSize, @borderRadius
- Border Variables: @baseBorderWidth, @baseBorderColor, @baseBorderRadius
- Shadow Variables: @boxShadow, @elevation, @shadowColor, @shadowOpacity
- Component Variables: Widget-specific variables (e.g., @buttonPrimaryBg, @listItemPadding)
- Variable Organization: Global vs component-level, naming patterns
- Default Values: Baseline theme configuration

Use themeName parameter to read variables from a specific theme. Returns structured data with variable names, values, and categories.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      themeName: z.string().optional().describe('Optional: specific theme name to read variables from')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_nested_styles',
    description: `Searches for complex nested style patterns and multi-level selector hierarchies in style definitions.

**WHAT IS IT:**
A nested style pattern finder that locates rnStyleSelector calls with 3+ parameters, indicating multi-level nested styling. These patterns enable styling deeply nested elements like an icon within a button's left section: rnStyleSelector("button", "icon", "left") → "app-button-icon-left". It reveals complex widget styling architectures where elements have sub-elements that can be independently styled.

**WHEN TO USE THIS TOOL:**
- When discovering complex nested styling capabilities
- When understanding multi-level style hierarchies (3+ levels deep)
- When learning how to style deeply nested widget parts
- When finding examples of advanced nested selector usage
- When comparing nested styling patterns across widgets
- When implementing custom widgets with complex nested structures
- When debugging deeply nested style application
- When documenting advanced styling capabilities

**WHY USE THIS TOOL:**
- Nested styles beyond 2 levels are less common and harder to discover
- Multi-level nesting reveals sophisticated widget architectures
- Understanding nesting depth helps plan custom styling
- Some widgets have 4-5 level nesting for fine-grained control
- Nested patterns show best practices for complex widget styling
- Finding examples is faster than trial-and-error
- Nesting structure affects class name generation
- Reveals which widgets have the most styling flexibility

**KEY CAPABILITIES YOU CAN DISCOVER:**
- 3-Level Selectors: rnStyleSelector("list", "item", "caption") → "app-list-item-caption"
- 4-Level Selectors: rnStyleSelector("form", "field", "label", "required") → "app-form-field-label-required"
- 5+ Level Selectors: Extremely nested styling for complex widgets
- Nesting Patterns: Common patterns like container → item → content → text
- Widget Complexity: Which widgets have the most nested styling (List, Form, Card)
- Hierarchical Structure: Parent-child-grandchild styling relationships
- Styling Granularity: How fine-grained styling control can get
- Best Practices: How WaveMaker widgets implement nested styling

Use component parameter to filter to specific widget. Returns nested selectors with their paths, generated class names, and nesting depth.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      component: z.string().optional().describe('Optional: filter to specific component'),
      maxResults: z.number().default(15).describe('Maximum number of results to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'analyze_style_precedence',
    description: `Analyzes style application order, merge logic, and precedence rules in WaveMaker components.

**WHAT IS IT:**
A style precedence analyzer that examines how styles from multiple sources are merged and which styles take priority when conflicts occur. The precedence order is: 1) Default styles (lowest), 2) Theme styles, 3) User/Custom styles, 4) Component prop styles, 5) Inline styles (highest). It reveals the merge algorithm, how conflicts are resolved, and how to properly override styles at each level.

**WHEN TO USE THIS TOOL:**
- When understanding why your custom styles aren't applying
- When learning the correct way to override default styles
- When debugging style conflicts between sources
- When planning where to apply custom styles (theme vs props vs inline)
- When understanding how theme styles override defaults
- When learning the style merge algorithm
- When optimizing style application for performance
- When documenting style customization best practices

**WHY USE THIS TOOL:**
- Style precedence is crucial for successful customization
- Multiple style sources can conflict, precedence resolves conflicts
- Understanding precedence prevents "why isn't my style working?" issues
- Different precedence levels have different use cases
- Inline styles override everything but have performance implications
- Theme styles are global, prop styles are per-instance
- Merge algorithm is more complex than simple override
- Knowing precedence helps choose the right customization approach

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Precedence Order: Default → Theme → User → Props → Inline (lowest to highest)
- Merge Algorithm: How styles from different sources are combined
- Conflict Resolution: Which style wins when multiple sources set same property
- Default Styles: getDefaultStyles() in BaseComponent, widget-specific defaults
- Theme Styles: Styles from compiled theme files, global customization
- User/Custom Styles: Custom classes, style definitions
- Prop Styles: styles prop on widget instances, per-instance customization
- Inline Styles: Direct style objects, highest precedence
- Performance Impact: Precedence level affects re-render behavior

Use component parameter to analyze precedence for a specific widget. Returns precedence order, merge logic, and examples of overriding at each level.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      component: z.string().optional().describe('Optional: analyze precedence for specific component')
    }),
    outputSchema: z.any()
  }
];

/**
 * Handler registry for style and theme tools
 */
export const styleThemeHandlers = new Map([
  ['search_theme_compilation', handleSearchThemeCompilation],
  ['search_css_to_rn', handleSearchCssToRn],
  ['read_theme_variables', handleReadThemeVariables],
  ['search_nested_styles', handleSearchNestedStyles],
  ['analyze_style_precedence', handleAnalyzeStylePrecedence]
]);

