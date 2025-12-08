/**
 * Variable & Binding Tools Registry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { handleSearchVariableSystem } from './variable-search.js';
import { handleSearchBindingMechanism } from './binding-search.js';
import { handleSearchWatcherSystem } from './watcher-search.js';
import { handleSearchVariableTypes } from './variable-types.js';
import { handleAnalyzeBindingFlow } from './binding-flow.js';
import { CodebaseToolResult } from '../types.js';

export const variableBindingTools: Tool[] = [
  {
    name: 'search_variable_system',
    description: `Searches for variable system implementation providing reactive state management across the application.

**WHAT IS IT:**
A variable system finder that locates the implementation of WaveMaker's reactive state management through Variable classes. The system includes base Variable class and specialized types: LiveVariable (CRUD operations on entities), ServiceVariable (backend API calls), DeviceVariable (device API access), NavigationVariable (navigation state), and TimerVariable (scheduled execution). Variables have lifecycle (init, invoke, success, error, onBeforeUpdate), data binding (dataSet for collections, dataValue for single values), and trigger automatic UI updates when data changes.

**WHEN TO USE THIS TOOL:**
- When understanding how reactive state management works
- When learning different variable types and their use cases
- When investigating variable lifecycle and event hooks
- When debugging data binding issues
- When seeing how variables trigger UI updates
- When implementing custom variable types
- When understanding CRUD operations (LiveVariable)
- When learning backend service integration (ServiceVariable)

**WHY USE THIS TOOL:**
- Variables are the primary state management mechanism
- Different variable types serve different purposes
- Understanding lifecycle prevents timing issues
- Data binding connects variables to UI automatically
- Variable events enable reactive programming patterns
- LiveVariable simplifies CRUD without manual API calls
- ServiceVariable handles backend integration
- Proper variable usage is essential for data-driven apps

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Variable Types: Variable (base), LiveVariable (CRUD), ServiceVariable (API), DeviceVariable (device), NavigationVariable (nav), TimerVariable (scheduled)
- Lifecycle Events: init, invoke, onBeforeUpdate, onSuccess, onError, onResult
- Data Properties: dataSet (array/collection), dataValue (single value), isList
- CRUD Operations: LiveVariable methods (create, read, update, delete, list)
- Service Integration: ServiceVariable API call configuration
- Data Binding: How variables connect to widget props
- Automatic Updates: How UI re-renders when variable data changes
- Error Handling: onError callbacks, error state management
- Loading States: inProgress flag, loading indicators

Use variableType parameter to filter: 'live', 'service', 'device', 'navigation', 'timer', or 'all'.`,
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
        query: {type: 'string', description: 'Query about variable system'},
        variableType: {type: 'string', enum: ['live', 'service', 'device', 'navigation', 'timer', 'all'], default: 'all'},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_binding_mechanism',
    description: `Searches for data binding implementation connecting variables to UI components.

**WHAT IS IT:**
A binding mechanism finder that locates the implementation of data binding expressions (bind:property syntax), two-way binding (widget ↔ variable synchronization), and property binding (variable.dataValue → widget.prop). Binding expressions in markup (bind:caption="variable.dataValue") are transpiled to runtime bindings that automatically update widgets when variable data changes and optionally update variables when widget values change (two-way binding for inputs).

**WHEN TO USE THIS TOOL:**
- When understanding how bind expressions work
- When debugging binding issues ("why isn't my widget updating?")
- When learning two-way binding for input widgets
- When seeing how binding expressions are transpiled
- When understanding binding syntax and patterns
- When implementing custom binding logic
- When optimizing binding performance
- When troubleshooting binding direction (one-way vs two-way)

**WHY USE THIS TOOL:**
- Data binding is fundamental to reactive UIs
- Bind expressions connect variables to widgets declaratively
- Two-way binding synchronizes input widgets with variables
- Understanding binding prevents common bugs
- Binding transpilation affects runtime behavior
- Performance depends on binding efficiency
- Binding direction matters for data flow
- Custom widgets need proper binding support

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Bind Expression Syntax: bind:property="expression" in markup
- One-Way Binding: Variable → Widget (display data)
- Two-Way Binding: Variable ↔ Widget (input synchronization)
- Binding Transpilation: How bind expressions become runtime code
- Change Detection: How binding detects variable changes
- Update Mechanism: How widgets re-render on data changes
- Binding Context: Accessing parent/page variables
- Expression Evaluation: How bind expressions are evaluated
- Performance: Binding optimization strategies

Use this tool to understand the complete data binding flow from markup to runtime.`,
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
    name: 'search_watcher_system',
    description: `Searches for watch system implementation providing change detection and digest cycle.

**WHAT IS IT:**
A watcher system finder that locates the implementation of WaveMaker's change detection mechanism. The watcher system monitors variable changes, widget property changes, and expression values, triggering updates when changes are detected. It includes a digest cycle (similar to Angular) that runs watchers, detects changes, and schedules UI updates. Watchers can be optimized to reduce unnecessary checks.

**WHEN TO USE THIS TOOL:**
- When understanding how change detection works
- When debugging performance issues with many watchers
- When learning the digest cycle and update timing
- When seeing how watchers are registered and executed
- When optimizing watcher performance
- When understanding when UI updates occur
- When implementing custom change detection
- When troubleshooting update timing issues

**WHY USE THIS TOOL:**
- Watchers are the mechanism behind reactive updates
- Understanding digest cycle prevents timing bugs
- Too many watchers cause performance issues
- Watcher optimization is crucial for large apps
- Digest cycle timing affects when updates appear
- Custom logic may need watcher integration
- Debugging "why isn't this updating?" requires watcher knowledge
- Performance profiling needs watcher understanding

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Watcher Registration: How watchers are created and registered
- Digest Cycle: When and how watchers are executed
- Change Detection: How changes are detected (dirty checking)
- Update Scheduling: How UI updates are queued and executed
- Watcher Optimization: Strategies to reduce watcher overhead
- Watch Expressions: What can be watched (variables, properties, expressions)
- Performance Impact: Cost of watchers, optimization techniques
- Debouncing: How rapid changes are handled
- Memory Management: Watcher cleanup and lifecycle

Use this tool to understand the change detection engine powering reactive updates.`,
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
    name: 'search_variable_types',
    description: `Searches for specific variable type implementations and their unique characteristics.

**WHAT IS IT:**
A variable type finder that locates implementations of specific variable types (LiveVariable, ServiceVariable, DeviceVariable, NavigationVariable, TimerVariable) and their unique features. Each type extends base Variable class with specialized functionality: LiveVariable adds CRUD operations, ServiceVariable adds API configuration, DeviceVariable adds device API access, NavigationVariable adds navigation methods, TimerVariable adds scheduling.

**WHEN TO USE THIS TOOL:**
- When understanding a specific variable type in depth
- When learning unique features of LiveVariable, ServiceVariable, etc.
- When comparing variable types to choose the right one
- When implementing custom variable types
- When debugging type-specific issues
- When seeing how CRUD operations work (LiveVariable)
- When understanding API configuration (ServiceVariable)
- When learning device integration (DeviceVariable)

**WHY USE THIS TOOL:**
- Each variable type has unique capabilities
- LiveVariable simplifies CRUD without manual code
- ServiceVariable handles complex API scenarios
- DeviceVariable provides device API access
- Understanding type differences helps choose correctly
- Type-specific methods aren't in base Variable
- Custom types should follow existing patterns
- Type implementation reveals best practices

**KEY CAPABILITIES YOU CAN DISCOVER:**
- LiveVariable: CRUD methods (create, read, update, delete, list), entity binding, filter/sort/pagination
- ServiceVariable: API configuration, request/response handling, parameter binding
- DeviceVariable: Device API access (camera, geolocation, contacts, etc.)
- NavigationVariable: Navigation methods, route management, navigation state
- TimerVariable: Scheduling, intervals, delays, execution timing
- Type-Specific Properties: Unique properties per type
- Type-Specific Events: Unique lifecycle events per type
- Use Cases: When to use each variable type

Use variableType parameter to specify: 'live', 'service', 'device', 'navigation', or 'timer'.`,
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
        variableType: {type: 'string', enum: ['live', 'service', 'device', 'navigation', 'timer']},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'variableType']
    }
  },
  {
    name: 'analyze_binding_flow',
    description: `Analyzes complete data binding flow from source to target with change propagation.

**WHAT IS IT:**
A binding flow analyzer that traces the complete path of data from variable changes through binding expressions to widget updates. It shows: 1) Variable data change, 2) Watcher detection, 3) Digest cycle execution, 4) Binding expression evaluation, 5) Widget property update, 6) Widget re-render. For two-way bindings, it also shows the reverse flow: Widget change → Variable update.

**WHEN TO USE THIS TOOL:**
- When understanding complete binding lifecycle
- When debugging complex binding scenarios
- When tracing data flow through the system
- When understanding change propagation timing
- When optimizing binding performance
- When documenting binding architecture
- When troubleshooting binding direction issues
- When learning binding implementation patterns

**WHY USE THIS TOOL:**
- Binding flow involves multiple systems (variables, watchers, widgets)
- Understanding complete flow prevents timing bugs
- Change propagation has specific order and timing
- Two-way binding has bidirectional flow
- Performance issues often relate to binding flow
- Debugging requires understanding the complete path
- Flow analysis reveals optimization opportunities
- Implementation patterns guide custom binding logic

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Flow Stages: Variable change → Detection → Evaluation → Update → Render
- Change Propagation: How changes flow through the system
- Timing: When each stage executes
- Two-Way Flow: Widget change → Variable update flow
- Update Batching: How multiple changes are batched
- Performance: Bottlenecks in the binding flow
- Error Handling: How binding errors are handled
- Optimization: Strategies to improve binding performance

Use componentName parameter to analyze binding flow for a specific component.`,
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
        componentName: {type: 'string', description: 'Optional: specific component to analyze'}
      },
      required: ['runtimePath', 'codegenPath']
    }
  }
];

export const variableBindingHandlers = new Map<string, (args: any) => Promise<CodebaseToolResult>>([
  ['search_variable_system', handleSearchVariableSystem],
  ['search_binding_mechanism', handleSearchBindingMechanism],
  ['search_watcher_system', handleSearchWatcherSystem],
  ['search_variable_types', handleSearchVariableTypes],
  ['analyze_binding_flow', handleAnalyzeBindingFlow]
]);
