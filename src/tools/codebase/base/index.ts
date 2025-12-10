/**
 * Base Component Tools Registry
 * Exports all base component related tools
 */

import { z } from 'zod';
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
export const baseComponentTools = [
  {
    name: 'search_base_component',
    description: `Searches for BaseComponent implementation and core infrastructure files in @wavemaker/app-rn-runtime.

**WHAT IS IT:**
BaseComponent is the foundational abstract class that ALL WaveMaker React Native widgets extend. It serves as the core infrastructure providing essential features like lifecycle management, property/state handling, event notification, styling, component tree navigation, and rendering logic. Located in src/core/base.component.tsx, it is the backbone of the entire widget system.

**WHEN TO USE THIS TOOL:**
- When you need to understand how widgets are constructed and initialized
- When investigating component lifecycle behavior (mount, update, unmount)
- When working with component properties, state management, or the proxy system
- When debugging parent-child component relationships or component tree navigation
- When understanding how events are handled and propagated (EventNotifier)
- When exploring how styles are merged and applied (theme integration)
- When implementing a new widget and need to understand the base architecture
- When troubleshooting cleanup issues, memory leaks, or lifecycle problems

**WHY USE THIS TOOL:**
- BaseComponent contains critical infrastructure methods that all widgets depend on
- Understanding BaseComponent is essential for widget development and debugging
- It provides the complete API including 50+ methods like updateState(), invokeEventCallback(), renderWidget(), getWidget()
- It manages the component lifecycle ensuring proper initialization and cleanup
- It implements the property system (via PropsProvider) and proxy pattern for clean external APIs
- It handles complex features like fixed positioning, animations, skeleton loading, and RTL support

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Lifecycle Methods: componentDidMount/WillUnmount, init(), destroy(), onPropertyChange()
- State Management: updateState(), refresh(), cleanRefresh(), reset()
- Event Handling: invokeEventCallback(), subscribe(), notify() via EventNotifier
- Property Management: setProp(), getProp(), proxy system for binding
- Rendering: renderWidget() (abstract), renderSkeleton(), render() orchestration
- Styling: getDefaultStyles(), style merging, theme integration
- Component Tree: parent/child relationships, getWidget(), componentNode
- Utility Methods: animate(), getTestProps(), handleLayout(), scrollTo methods
- Cleanup Management: automatic cleanup array, proper memory management

Use focus parameter to narrow search: 'lifecycle' for hooks, 'properties' for prop system, 'styling' for theme/styles, 'events' for EventNotifier, or 'all' for comprehensive search.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Semantic query about BaseComponent (e.g., "lifecycle hooks", "property handling", "state management")'),
      focus: z.enum(['lifecycle', 'properties', 'styling', 'events', 'all']).default('all').describe('Focus area within BaseComponent'),
      includeTests: z.boolean().default(false).describe('Include test files in results'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'read_base_component',
    description: `Reads and parses BaseComponent file structure, extracting implementation details from discovered files.

**WHAT IS IT:**
A file parser tool that extracts structured information from BaseComponent and related infrastructure files. It parses TypeScript/JavaScript code to extract methods, properties, lifecycle hooks, imports, exports, and type definitions with their signatures and JSDoc comments.

**WHEN TO USE THIS TOOL:**
- After using search_base_component to locate relevant files
- When you need detailed method signatures and parameter types
- When investigating how specific BaseComponent methods are implemented
- When understanding property definitions and their types
- When examining lifecycle hook implementations in detail
- When you need to see JSDoc documentation for methods
- When analyzing imports and exports to understand dependencies
- When creating new widgets and need to understand the base class API

**WHY USE THIS TOOL:**
- Provides structured extraction of code elements (not just raw file content)
- Separates methods, properties, lifecycle hooks for focused analysis
- Includes JSDoc comments for understanding method purpose and usage
- Shows method signatures with parameter names and types
- Reveals type definitions and interfaces
- Helps understand the complete BaseComponent API surface
- Faster than reading entire files when you need specific information

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Methods: updateState(), invokeEventCallback(), renderWidget(), refresh(), reset(), animate()
- Properties: proxy, styles, parent, theme, initialized, destroyed, notifier
- Lifecycle Hooks: componentDidMount/WillUnmount, init(), destroy(), onPropertyChange()
- Type Definitions: BaseProps, BaseComponentState, BaseStyles interfaces
- Imports: Dependencies on EventNotifier, PropsProvider, Theme, etc.
- Exports: Public API surface of base classes
- Method Signatures: Parameter types, return types, access modifiers
- JSDoc Comments: Usage examples, parameter descriptions, warnings

Use extract parameter to control what gets parsed: ['methods', 'properties', 'lifecycle', 'imports', 'exports', 'types']. Set includeComments=true for JSDoc documentation.`,
    inputSchema: z.object({
      filePath: z.string().describe('Path to BaseComponent file (from search_base_component result)'),
      extract: z.array(z.enum(['methods', 'properties', 'lifecycle', 'imports', 'exports', 'types'])).default(['methods', 'properties', 'lifecycle']).describe('What to extract from file'),
      includeComments: z.boolean().default(true).describe('Include JSDoc comments in extraction')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_lifecycle_hooks',
    description: `Searches for lifecycle hook patterns and implementations across the WaveMaker component system.

**WHAT IS IT:**
A specialized search tool that finds lifecycle method implementations throughout the codebase, including both React lifecycle methods (componentDidMount, componentWillUnmount, componentDidUpdate, shouldComponentUpdate) and WaveMaker custom lifecycle hooks (init, destroy, onPropertyChange). It identifies patterns, best practices, and sequences used for component initialization, updates, and cleanup.

**WHEN TO USE THIS TOOL:**
- When understanding how components initialize themselves (mount phase)
- When debugging cleanup issues or memory leaks (unmount phase)
- When investigating how components respond to updates (update phase)
- When learning proper initialization patterns for new widget development
- When tracking down where subscriptions, timers, or resources are created/cleaned
- When understanding the cleanup array pattern and how it prevents memory leaks
- When examining how widgets respond to property changes
- When optimizing component rendering via shouldComponentUpdate

**WHY USE THIS TOOL:**
- Lifecycle hooks are critical for proper component behavior and resource management
- Incorrect lifecycle implementation leads to memory leaks and bugs
- Finding real-world examples helps understand proper patterns
- Different widgets have different lifecycle needs (data widgets vs UI widgets)
- The cleanup array pattern is essential but not obvious from documentation
- Understanding init() vs componentDidMount() timing is crucial
- Shows how onPropertyChange() integrates with property updates
- Reveals optimization patterns in shouldComponentUpdate implementations

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Mount Hooks: componentDidMount(), init(), subscription setup, timer initialization
- Unmount Hooks: componentWillUnmount(), destroy(), cleanup array execution, unsubscribe patterns
- Update Hooks: componentDidUpdate(), onPropertyChange(), prop change reactions
- Render Hooks: render(), renderWidget(), showView(), conditional rendering
- Optimization: shouldComponentUpdate() implementations, render prevention patterns
- Cleanup Patterns: this.cleanup.push() usage, automatic cleanup on unmount
- Timing Issues: Race conditions, async operations in lifecycle methods
- Resource Management: Timer cleanup, subscription cleanup, listener removal
- Initialization Sequence: Constructor → render → componentDidMount → init

Use hookType parameter to filter: 'mount' for initialization, 'unmount' for cleanup, 'update' for change detection, 'render' for rendering, or 'all' for comprehensive search.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about lifecycle hooks (e.g., "mount hooks", "cleanup", "update lifecycle")'),
      hookType: z.enum(['mount', 'unmount', 'update', 'render', 'all']).default('all').describe('Type of lifecycle hook to search for'),
      maxResults: z.number().default(15).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_props_provider',
    description: `Searches for PropsProvider implementation and the three-tier property resolution system in WaveMaker runtime.

**WHAT IS IT:**
A specialized search tool that finds the PropsProvider class and property management system. PropsProvider implements a JavaScript Proxy-based property system with three-tier resolution (Override Values → Props → Default Values), providing getProperty/setProperty methods, change detection via isDirty flag, and automatic change callbacks. It's the foundation for how all widget properties work.

**WHEN TO USE THIS TOOL:**
- When understanding how widget properties are resolved and accessed
- When debugging property value issues ("why is this prop not updating?")
- When learning the three-tier property precedence system
- When implementing new widgets that need custom property handling
- When understanding the proxy pattern used for property access
- When investigating change detection and shouldComponentUpdate behavior
- When tracking property inheritance through parent-child relationships
- When debugging runtime property overrides (component.props.value = newValue)

**WHY USE THIS TOOL:**
- PropsProvider is the core of the property system used by ALL widgets
- Understanding three-tier resolution prevents "my property isn't working" bugs
- The proxy pattern enables transparent property access (component.props.caption)
- Change detection via isDirty is crucial for render optimization
- Runtime overrides are stored separately from default/markup props
- Property inheritance isn't obvious without understanding the system
- The onChange callback pattern drives onPropertyChange lifecycle hook
- Proper property management prevents unnecessary re-renders

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Three-Tier Resolution: Override values (highest) → Props (medium) → Default values (lowest)
- Proxy Implementation: Getter/setter traps for transparent property access
- Change Detection: isDirty flag, check() method, shouldComponentUpdate integration
- Methods: getProperty(), setProperty(), setPropDefault(), overrideProp()
- Runtime Overrides: How component.props.value = X works differently than markup props
- onChange Callback: Triggers onPropertyChange() in BaseComponent
- Property Defaults: How defaultProps are merged and applied
- Inheritance: How parent properties flow to children
- Performance: Proxy overhead vs direct access, caching strategies

Use this tool to understand the complete property lifecycle from markup → rendering → runtime changes → re-renders.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about PropsProvider (e.g., "property management", "getProperty", "property inheritance")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'search_event_notifier',
    description: `Searches for EventNotifier class and the hierarchical pub/sub event system implementation in WaveMaker runtime.

**WHAT IS IT:**
A specialized search tool that finds the EventNotifier class and event system architecture. EventNotifier provides a hierarchical pub/sub pattern where each component has its own notifier instance organized in a tree structure (EventNotifier.ROOT → App → Page → Widgets). It supports bidirectional event propagation (parent-to-children and child-to-parent), multiple listeners per event, and automatic cleanup integration with component lifecycle.

**WHEN TO USE THIS TOOL:**
- When understanding how widgets communicate without tight coupling
- When debugging event handling issues (events not firing or firing unexpectedly)
- When learning how to create custom events in widgets
- When investigating event propagation patterns (upward vs downward)
- When understanding how system events work (theme changes, viewport changes, scroll events)
- When debugging subscription memory leaks
- When implementing parent-child communication in custom widgets
- When understanding how invokeEventCallback() works for widget event props

**WHY USE THIS TOOL:**
- EventNotifier is used by EVERY component for event handling
- Understanding hierarchical structure prevents event routing confusion
- Bidirectional propagation enables both bubbling and broadcasting patterns
- The subscribe() return value (unsubscribe function) is critical for cleanup
- System events (viewport, network, theme) use the same EventNotifier infrastructure
- Event propagation can be stopped by returning false from listeners
- Modal system, scroll tracking, and navigation all rely on EventNotifier
- Proper subscription cleanup prevents memory leaks in long-running apps

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Hierarchical Structure: EventNotifier.ROOT → parent-child tree relationships
- Core Methods: subscribe(event, handler), notify(event, args, emitToParent), destroy()
- Bidirectional Propagation: Downward (parent→children) and upward (child→parent via emitToParent=true)
- Propagation Control: Return false from listener to stop propagation
- Multiple Listeners: Multiple components can subscribe to same event
- System Events: ViewPort (size/orientation changes), Network (connection status), Theme updates
- BaseComponent Integration: this.subscribe(), this.notify(), this.invokeEventCallback()
- Cleanup Patterns: parentListenerDestroyers array, automatic cleanup on unmount
- Event Throttling: High-frequency events (scroll) use throttling (100ms) for performance

Use this tool to understand the complete event flow: component.notify() → listener execution → propagation → cleanup.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      query: z.string().describe('Query about event system (e.g., "event notification", "event listeners", "event callbacks")'),
      maxResults: z.number().default(10).describe('Maximum number of files to return')
    }),
    outputSchema: z.any()
  },
  {
    name: 'analyze_component_hierarchy',
    description: `Analyzes component inheritance hierarchy and parent-child relationships in the WaveMaker component system.

**WHAT IS IT:**
A hierarchical analyzer tool that maps the component inheritance tree, showing which widgets extend BaseComponent, what intermediate base classes exist (like BaseInput, BaseDataWidget), and how components relate to each other. It traces inheritance chains, discovers dependencies through imports and extensions, and visualizes the component architecture from BaseComponent down to specific widgets.

**WHEN TO USE THIS TOOL:**
- When understanding the overall widget architecture and organization
- When learning which widgets extend BaseComponent vs specialized base classes
- When investigating inheritance chains (e.g., WmText → BaseInput → BaseComponent)
- When planning new widgets and deciding what to extend
- When debugging inheritance-related issues (missing methods, incorrect behavior)
- When discovering intermediate base classes and their purpose
- When understanding widget categorization and relationships
- When analyzing component dependencies and coupling

**WHY USE THIS TOOL:**
- BaseComponent is extended by 50+ widgets, hierarchy shows organization
- Intermediate base classes (BaseInput, BaseDataWidget) provide shared functionality
- Understanding inheritance helps identify where methods/properties come from
- Hierarchy reveals widget families (all input widgets extend BaseInput)
- Dependency analysis shows which widgets depend on which base classes
- Helps choose correct base class when creating new widgets
- Shows patterns in how different widget categories are structured
- Reveals architectural decisions in the widget system design

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Inheritance Chains: Widget → Intermediate Base → BaseComponent
- Extension Mapping: Which widgets extend which base classes
- Depth Analysis: How many levels deep the inheritance goes (with depth parameter)
- Component Families: Input widgets, data widgets, container widgets grouped by base class
- Import Dependencies: Which base classes and utilities are imported by widgets
- Intermediate Base Classes: BaseInput, BaseDataWidget, BaseFragment, etc.
- Widget Organization: How widgets are categorized and structured
- Architectural Patterns: Common patterns in widget implementation
- Method Origin: Where specific methods are defined in the hierarchy (Base vs Widget)

Use componentName parameter to filter to a specific widget or base class. Use depth parameter (default: 3) to control how deep the hierarchy analysis goes. This tool helps visualize the entire widget architecture at a glance.`,
    inputSchema: z.object({
      runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
      codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
      componentName: z.string().optional().describe('Optional: filter hierarchy to specific component name'),
      depth: z.number().default(3).describe('Maximum depth of hierarchy to analyze')
    }),
    outputSchema: z.any()
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

