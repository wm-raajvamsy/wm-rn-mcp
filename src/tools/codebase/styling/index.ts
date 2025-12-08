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
    description: `Searches for style definition files (.styledef.ts) that define styling capabilities and selector mappings for widgets.

**WHAT IS IT:**
A style definition discovery tool that finds .styledef.ts files in @wavemaker/rn-codegen. These files define the styling blueprint for each widget, including rnStyleSelector patterns for nested element styling, className mappings for theme compilation, state-specific styles (focused, disabled, invalid), and theme variable references. The rnStyleSelector function generates class names like "app-button-icon", "app-list-item-caption" for styling specific widget parts.

**WHEN TO USE THIS TOOL:**
- When you need to style nested elements within a widget (icon inside button, caption in list item)
- When discovering what parts of a widget can be styled
- When understanding the class name generation pattern (rnStyleSelector)
- When finding available style selectors for a specific widget
- When learning how to apply custom styles to widget sub-elements
- When debugging why custom styles aren't applying to nested elements
- When comparing style capabilities across similar widgets
- When implementing custom widgets and need style definition examples

**WHY USE THIS TOOL:**
- Style definitions are the blueprint for widget styling capabilities
- rnStyleSelector patterns reveal what widget parts can be independently styled
- Understanding class name generation is crucial for custom styling
- Nested element styling isn't obvious without seeing style definitions
- State-specific styles (focused, disabled) are defined here
- Theme variable usage shows how widgets integrate with themes
- Style definitions determine what CSS classes are generated during theme compilation
- Knowing available selectors prevents trial-and-error styling

**KEY CAPABILITIES YOU CAN DISCOVER:**
- rnStyleSelector Patterns: rnStyleSelector("button", "icon") → "app-button-icon" class
- Nested Element Selectors: Multi-level paths like rnStyleSelector("list", "item", "caption")
- className Mappings: CSS class names (.app-button, .btn-primary) to RN style paths
- State Styles: focused, disabled, invalid, readonly, active states
- Widget Parts: root, text, icon, label, caption, container, content elements
- Theme Variables: Usage of variables like primaryColor, baseFontSize
- Style Inheritance: How styles cascade from base to specific elements
- Platform-Specific Styles: iOS vs Android style variations
- Variant Styles: Primary, secondary, danger, success button variants

Use component parameter to filter to specific widget (e.g., "button", "list", "card"). Set extractClassNames=true to get all generated class names. Set includeNested=true to include multi-level selectors.`,
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
    description: `Extracts and catalogs all rnStyleSelector-generated class names with structured metadata.

**WHAT IS IT:**
A class name catalog tool that extracts all rnStyleSelector() calls from style definition files and returns structured data showing component name, selector path, generated class name, and nesting level. For example, rnStyleSelector("button", "icon") generates "app-button-icon", while rnStyleSelector("list", "item", "caption") generates "app-list-item-caption". It provides a complete inventory of styleable widget parts.

**WHEN TO USE THIS TOOL:**
- When you need the exact class name to style a specific widget part
- When discovering all styleable elements within a widget
- When understanding the nesting structure of widget styling
- When you know what part you want to style but not the class name
- When comparing styling capabilities across widgets
- When documenting available style hooks for a widget
- When debugging why a custom class isn't applying
- When creating theme overrides for specific widget parts

**WHY USE THIS TOOL:**
- Class names follow a pattern but aren't always obvious (app-button-icon vs button-icon)
- Discovering all styleable parts requires parsing style definitions
- Nesting levels determine class name structure (2-level vs 3-level)
- Some widgets have many styleable parts (20+ for complex widgets like List)
- Knowing exact class names prevents guessing and trial-and-error
- Structured data shows relationships between widget parts
- Helps understand widget styling architecture at a glance
- Essential for creating comprehensive theme customizations

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Generated Class Names: Complete list of all rnStyleSelector-generated classes
- Selector Paths: The arguments passed to rnStyleSelector (e.g., ["button", "icon"])
- Nesting Levels: 2-level (root.text), 3-level (list.item.caption), 4+ level selectors
- Component Mapping: Which class names belong to which widgets
- Widget Parts: root, text, icon, label, caption, container, content, header, footer
- State Variants: focused, disabled, invalid, active, pressed classes
- Hierarchical Structure: Parent-child relationships in styling
- Naming Patterns: Conventions like app-{widget}-{part}-{subpart}

Use component parameter to filter to specific widget. Set includeNested=true (default) to include 3+ level selectors. Returns structured data with component, path, className, and nesting information for each selector.`,
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

