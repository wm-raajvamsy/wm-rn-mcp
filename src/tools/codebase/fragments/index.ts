/**
 * Fragment & Page Tools Registry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { handleSearchFragmentSystem } from './fragment-search.js';
import { handleSearchPageStructure } from './page-search.js';
import { handleSearchPrefabSystem } from './prefab-search.js';
import { CodebaseToolResult } from '../types.js';

export const fragmentPageTools: Tool[] = [
  {
    name: 'search_fragment_system',
    description: `Searches for fragment system implementation including pages, partials, and prefabs.

**WHAT IS IT:**
A fragment system finder that locates the implementation of WaveMaker's fragment architecture. Fragments are reusable UI containers that extend BaseFragment: Pages (full screens with navigation), Partials (reusable page sections), and Prefabs (packaged components with markup/logic/styles). Fragments provide lifecycle (onPageReady, onPageLeave, onPageAttach, onPageDetach), navigation (goToPage, goBack), component hierarchy, and variable management.

**WHEN TO USE THIS TOOL:**
- When understanding page/partial/prefab architecture
- When learning fragment lifecycle and navigation
- When debugging page transition issues
- When seeing how pages manage variables and widgets
- When understanding partial reusability
- When learning prefab packaging and integration
- When implementing custom fragments
- When troubleshooting fragment lifecycle timing

**WHY USE THIS TOOL:**
- Fragments are the container architecture for UI
- Pages, partials, and prefabs serve different purposes
- Fragment lifecycle is crucial for proper initialization/cleanup
- Navigation between pages uses fragment system
- Understanding fragments helps organize app structure
- Partials enable UI reusability across pages
- Prefabs package reusable components with logic
- Fragment patterns guide app architecture

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Fragment Types: Page (full screen), Partial (reusable section), Prefab (packaged component)
- BaseFragment: Base class with lifecycle, navigation, hierarchy
- Lifecycle Methods: onPageReady, onPageLeave, onPageAttach, onPageDetach
- Navigation: goToPage(), goBack(), navigation parameters
- Variable Management: Page-level variables, variable scope
- Widget Management: Page.Widgets registry, widget access
- Component Hierarchy: Parent-child relationships in fragments
- Partial Integration: How partials are embedded in pages
- Prefab System: Packaging, distribution, integration of prefabs

Use this tool to understand the complete fragment architecture organizing app UI.`,
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
    name: 'search_page_structure',
    description: `Searches for page structure and page lifecycle implementation.

**WHAT IS IT:**
A page structure finder that locates page implementation patterns and lifecycle management. Pages are full-screen fragments with structure (header, content, footer, left panel), lifecycle (onPageReady, onPageLeave), navigation integration, variable management, and widget registry. Each page is a class extending BasePage with generated code for widgets, variables, and actions.

**WHEN TO USE THIS TOOL:**
- When understanding page structure and organization
- When learning page lifecycle events and timing
- When seeing how pages are generated from markup
- When debugging page initialization issues
- When understanding page navigation flow
- When learning how widgets are registered in pages
- When seeing how page variables are managed
- When implementing custom page logic

**WHY USE THIS TOOL:**
- Pages are the primary UI containers in apps
- Page structure (header/content/footer) is standardized
- Lifecycle events control page behavior
- Generated page code follows specific patterns
- Understanding pages helps organize app logic
- Page navigation is fundamental to app flow
- Widget registry provides page-level widget access
- Variable scope is page-based

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Page Structure: Header, PageContent, Footer, LeftPanel components
- Page Lifecycle: onPageReady (init), onPageLeave (cleanup), onPageAttach/Detach
- Page Generation: How markup generates page class code
- Widget Registry: Page.Widgets object for widget access
- Variable Management: Page-level variables, initialization
- Navigation Integration: How pages integrate with navigation
- Action Methods: Generated methods for page actions
- Event Handlers: Page-level event handling

Use this tool to understand how pages are structured, generated, and managed.`,
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
    name: 'search_prefab_system',
    description: `Searches for prefab system implementation and prefab packaging.

**WHAT IS IT:**
A prefab system finder that locates the implementation of packaged, reusable components (prefabs). Prefabs bundle markup, logic (TypeScript), styles, and configuration into distributable packages. They extend BaseFragment and can be embedded in pages/partials like widgets. Prefabs have their own lifecycle, variables, and widgets, providing encapsulated functionality.

**WHEN TO USE THIS TOOL:**
- When understanding prefab architecture and packaging
- When learning how to create distributable components
- When seeing how prefabs are integrated into apps
- When debugging prefab lifecycle or initialization
- When understanding prefab isolation and encapsulation
- When learning prefab configuration and properties
- When implementing custom prefabs
- When troubleshooting prefab integration issues

**WHY USE THIS TOOL:**
- Prefabs enable component reusability across projects
- Prefab packaging bundles markup, logic, and styles
- Understanding prefabs helps create reusable components
- Prefab lifecycle differs from regular widgets
- Prefab integration requires specific patterns
- Encapsulation prevents conflicts with host app
- Configuration enables prefab customization
- Prefab patterns guide reusable component design

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Prefab Structure: Markup, logic, styles, configuration bundled together
- Prefab Packaging: How prefabs are packaged for distribution
- Prefab Integration: How prefabs are embedded in pages/partials
- Prefab Lifecycle: Initialization, lifecycle events, cleanup
- Prefab Isolation: Variable/widget scope, style encapsulation
- Prefab Configuration: Properties, events, customization
- Prefab Distribution: Publishing, versioning, dependencies
- Prefab Patterns: Best practices for reusable components

Use this tool to understand how to create and use packaged, reusable components.`,
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
  }
];

export const fragmentPageHandlers = new Map<string, (args: any) => Promise<CodebaseToolResult>>([
  ['search_fragment_system', handleSearchFragmentSystem],
  ['search_page_structure', handleSearchPageStructure],
  ['search_prefab_system', handleSearchPrefabSystem]
]);
