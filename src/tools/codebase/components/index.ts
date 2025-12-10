/**
 * Widget Component Tools Registry
 * Exports all widget component related tools
 */

import { z } from 'zod';
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
export const widgetComponentTools = [
  {
    name: 'search_widget_components',
    description: `Searches for widget component implementations across 50+ pre-built React Native widgets in @wavemaker/app-rn-runtime.

**WHAT IS IT:**
A comprehensive widget discovery tool that searches through the complete WaveMaker widget library organized into 10 categories: Basic (WmButton, WmLabel, WmIcon, WmPicture), Container (WmPanel, WmContainer, WmTabs, WmAccordion), Input (WmText, WmCheckbox, WmSelect, WmDate), Data (WmList, WmLivelist, WmForm, WmCard), Chart (WmChart, WmBarchart, WmPiechart), Navigation (WmNav, WmNavbar, WmMenu), Device (WmCamera, WmBarcodescanner), Dialogs (WmModal, WmAlertdialog, WmConfirmdialog), Page (WmPage, WmHeader, WmFooter), and Advanced (WmCarousel, WmMedia, WmQrcode). Each widget consists of multiple files: .tsx (component implementation), .component.js (generated code), .styles.js (theme definitions), and .props.ts (TypeScript prop interfaces).

**WHEN TO USE THIS TOOL:**
- When exploring available widgets by category or functionality
- When searching for a widget by name or partial name (e.g., "button", "list")
- When discovering widgets with specific features (e.g., "data binding", "validation")
- When learning what widgets are available in a category
- When finding related files for a widget (.tsx, .styles.js, .props.ts)
- When comparing similar widgets (WmList vs WmLivelist, WmForm vs WmLiveform)
- When planning which widget to use for a specific UI requirement
- When understanding the complete widget library structure

**WHY USE THIS TOOL:**
- 50+ widgets are organized across 10 categories, discovery tool helps navigate
- Widget names aren't always obvious (WmLivelist vs WmList functionality differs)
- Each widget has 3-4 related files, tool finds them all together
- Category filtering narrows search to relevant widgets
- Understanding widget organization helps choose the right widget
- Related files reveal complete widget implementation (markup, styles, props, generated code)
- Semantic search finds widgets by functionality, not just name
- Discovering similar widgets helps make informed choices

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Widget Categories: Basic (10), Container (12), Input (20), Data (6), Chart (5), Navigation (5), Device (2), Dialogs (4), Page (5), Advanced (3)
- Widget Files: Component (.tsx), Generated code (.component.js), Styles (.styles.js), Props (.props.ts)
- Widget Families: Live widgets (WmLivelist, WmLiveform) with CRUD operations, Input widgets extending BaseInput
- Naming Patterns: Wm prefix, category-based organization, feature-based naming
- File Locations: components/category/widget-name/ directory structure
- Related Widgets: Discover widgets in same category or with similar functionality
- Implementation Patterns: How different widget types are structured
- Widget Metadata: Category, file count, base class, prop interface

Use category parameter to filter: 'basic', 'container', 'input', 'data', 'chart', 'navigation', 'device', 'dialogs', 'page', 'advanced', or 'all'. Set includeRelated=true to get all related files (.component.js, .styles.js, .props.ts) along with the main .tsx file.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Widget name or category (e.g., "WmButton", "button", "list widgets", "form components")'),
      category: z.enum(['basic', 'container', 'data', 'form', 'input', 'layout', 'advanced', 'all']).default('all').describe('Widget category filter'),
      includeRelated: z.boolean().default(true).describe('Include related files (.component.js, .styles.js, .props.ts)'),
      maxResults: z.number().default(15).describe('Maximum number of widgets to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'read_widget_structure',
    description: `Reads and parses widget component file structure, extracting detailed implementation information.

**WHAT IS IT:**
A widget structure parser that extracts and organizes key implementation details from widget files. It parses the component class definition, prop interfaces (TypeScript types), event handlers (onTap, onChange, onFocus, etc.), render method (renderWidget), style application methods (getDefaultStyles, applyStyles), and widget-specific logic. Returns structured data showing how the widget is built, not just raw code.

**WHEN TO USE THIS TOOL:**
- After finding a widget with search_widget_components, need implementation details
- When understanding how a specific widget works internally
- When learning what props a widget accepts and their types
- When discovering what events a widget fires (onTap, onChange, onSelect, etc.)
- When seeing how a widget applies styles and theme
- When examining widget-specific methods and logic
- When creating a similar custom widget and need a reference implementation
- When debugging widget behavior and need to see the source

**WHY USE THIS TOOL:**
- Structured extraction is faster than reading entire files
- Separates concerns: props, events, styles, rendering logic
- Shows prop interfaces with types, defaults, and descriptions
- Reveals event handler signatures and what data they pass
- Displays how getDefaultStyles() defines widget appearance
- Extracts renderWidget() to see UI structure
- Identifies widget-specific methods beyond BaseComponent API
- Helps understand widget complexity and implementation patterns

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Component Class: Widget name, extends clause, generic types
- Prop Interface: All accepted props with types, required vs optional, defaults
- Event Handlers: onTap(), onChange(), onSelect(), onFocus(), onBlur(), custom events
- Render Method: renderWidget() implementation, JSX structure, conditional rendering
- Style Methods: getDefaultStyles(), style class names, theme integration
- Widget-Specific Logic: Validation, data transformation, state management
- Lifecycle Overrides: Custom componentDidMount, componentDidUpdate implementations
- Helper Methods: Private methods for calculations, formatting, data processing
- State Interface: Widget state properties and their types

Use extractProps=true to get prop interface, extractEvents=true for event handlers, extractStyles=true for style methods. All default to true for comprehensive extraction.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      filePath: z.string().describe('Path to widget file (from search_widget_components result)'),
      extractProps: z.boolean().default(true).describe('Extract prop interface definition'),
      extractEvents: z.boolean().default(true).describe('Extract event handler methods'),
      extractStyles: z.boolean().default(true).describe('Extract style-related methods')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_widget_by_name',
    description: `Searches for a specific widget by exact name with precise matching and complete file discovery.

**WHAT IS IT:**
A fast, precise widget lookup tool that finds a widget by its exact name (e.g., "WmButton", "Button", "List") and returns all related implementation files. Unlike semantic search, this performs exact name matching (case-insensitive) and optionally includes all associated files: .tsx (component), .component.js (generated code), .styles.js (theme), and .props.ts (prop types). It's the fastest way to locate a widget when you know its name.

**WHEN TO USE THIS TOOL:**
- When you know the exact widget name and need quick lookup
- When you need all files for a widget (component + styles + props + generated)
- When working with a specific widget mentioned in documentation or code
- When you want faster results than semantic search
- When you need to verify a widget exists in the codebase
- When collecting all files needed to understand a widget completely
- When you have a widget name from markup (e.g., <WmButton>) and need the implementation
- When comparing multiple widgets and need their complete file sets

**WHY USE THIS TOOL:**
- Exact name matching is faster than semantic search
- Returns complete file set in one query (no need for multiple searches)
- Works with partial names ("Button" finds "WmButton")
- Case-insensitive matching handles naming variations
- includeRelated=true gets all 4 file types at once
- Useful when you know what you're looking for
- Eliminates ambiguity of semantic search results
- Perfect for direct widget investigation workflows

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Exact Match: Finds widget by precise name (WmButton, Button, button all work)
- Complete File Set: .tsx, .component.js, .styles.js, .props.ts all returned
- Fast Lookup: No semantic analysis, direct file system search
- Name Variations: Handles with/without "Wm" prefix
- File Paths: Returns absolute paths to all widget files
- Verification: Confirms widget exists and where it's located
- Related Files: Optional inclusion of generated code and style definitions
- Category Detection: Shows which category the widget belongs to

Use widgetName parameter with exact name (e.g., "WmButton", "Button", "List"). Set includeRelated=true (default) to get all associated files, or false to get only the main .tsx component file. This is the go-to tool when you have a widget name and need its files immediately.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      widgetName: z.string().describe('Exact widget name (e.g., "WmButton", "Button", "List")'),
      includeRelated: z.boolean().default(true).describe('Include all related files (component.js, styles.js, props.ts)')
    }),
    outputSchema: z.any()
  },
  {
    name: 'list_all_widgets',
    description: `Lists all available widgets in the WaveMaker component library with comprehensive catalog and metadata.

**WHAT IS IT:**
A complete widget catalog tool that returns an organized inventory of all 50+ widgets in the WaveMaker library. Widgets are grouped by category (Basic, Container, Input, Data, Chart, Navigation, Device, Dialogs, Page, Advanced) with metadata including widget name, file count, category, and optional detailed information like prop interfaces, line counts, base class, and file paths. It's the definitive reference for the entire widget library.

**WHEN TO USE THIS TOOL:**
- When you need an overview of all available widgets
- When exploring what widgets exist in a specific category
- When comparing widget distribution across categories
- When planning which widgets to use in an application
- When learning the complete widget library structure
- When you need a quick reference of all widget names
- When understanding the scope and organization of the widget system
- When generating documentation or widget inventories

**WHY USE THIS TOOL:**
- Provides complete widget inventory in one query
- Shows category-based organization (10 categories, 50+ widgets)
- Reveals widget distribution (Input has 20 widgets, Device has 2)
- Optional metadata shows complexity (line counts) and architecture (base classes)
- Helps discover widgets you didn't know existed
- Shows naming patterns and conventions across categories
- Useful for understanding the breadth of the widget library
- Category filtering focuses on relevant widget subsets

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Complete Catalog: All 50+ widgets listed with names and categories
- Category Organization: Basic (10), Container (12), Input (20), Data (6), Chart (5), Navigation (5), Device (2), Dialogs (4), Page (5), Advanced (3)
- Widget Metadata: Name, category, file count (typically 4 files per widget)
- Optional Details: Prop interfaces, line counts, base class (BaseComponent, BaseInput, etc.)
- File Paths: Locations of all widget implementation files
- Widget Families: Live widgets, Input widgets, Data widgets grouped together
- Naming Conventions: Wm prefix, category-based organization
- Library Statistics: Total widget count, category distribution, file counts

Use category parameter to filter: 'basic', 'container', 'input', 'data', 'chart', 'navigation', 'device', 'dialogs', 'page', 'advanced', or 'all' (default). Set includeMetadata=true to get detailed information including prop interfaces, line counts, and base classes. This tool is perfect for getting a bird's-eye view of the entire widget ecosystem.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      category: z.enum(['basic', 'container', 'data', 'form', 'input', 'layout', 'advanced', 'all']).default('all').describe('Filter by widget category'),
      includeMetadata: z.boolean().default(false).describe('Include detailed metadata (prop interfaces, line counts, etc.)')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_widget_props',
    description: `Searches for widget property definitions and TypeScript prop interfaces across the widget library.

**WHAT IS IT:**
A prop interface discovery tool that searches .props.ts files to find TypeScript interfaces defining widget properties. Each widget has a prop interface (e.g., WmButtonProps, WmListProps) that specifies accepted properties with their types, whether they're required or optional, default values, and JSDoc descriptions. This tool helps understand what props a widget accepts and their constraints.

**WHEN TO USE THIS TOOL:**
- When you need to know what props a widget accepts
- When understanding prop types and constraints (string, number, boolean, etc.)
- When checking if a prop is required or optional
- When discovering default values for props
- When seeing JSDoc descriptions explaining prop purpose
- When comparing props across similar widgets
- When planning widget usage and need to know available options
- When debugging prop-related issues ("why isn't this prop working?")

**WHY USE THIS TOOL:**
- Prop interfaces are the contract for widget usage
- TypeScript types reveal exact prop requirements and constraints
- JSDoc comments explain prop purpose and usage
- Required vs optional distinction prevents runtime errors
- Default values show fallback behavior
- Prop names aren't always obvious (datavalue vs value vs data)
- Understanding props is essential for correct widget usage
- Comparing props helps choose between similar widgets

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Prop Names: All properties accepted by a widget
- Prop Types: string, number, boolean, object, array, union types, custom types
- Required vs Optional: Which props must be provided vs have defaults
- Default Values: Fallback values when props aren't provided
- JSDoc Descriptions: Explanations of what each prop does
- Prop Constraints: Enums (e.g., type: 'button' | 'submit'), min/max values
- Event Props: onTap, onChange, onSelect with their callback signatures
- Style Props: classname, styles for custom styling
- Data Props: dataset, datavalue, datasource for data binding

Use query parameter to search semantically (e.g., "button props", "list properties", "input validation"). Use widgetName parameter to filter to a specific widget. Returns prop interface files with extracted property definitions, types, and documentation.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about widget props (e.g., "button props", "list properties", "input validation")'),
      widgetName: z.string().optional().describe('Optional: filter to specific widget name'),
      maxResults: z.number().default(15).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
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

