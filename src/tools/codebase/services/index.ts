/**
 * Service & DI Tools Registry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { handleSearchRuntimeServices } from './runtime-services.js';
import { handleSearchDiSystem } from './di-search.js';
import { handleSearchServiceLayer } from './service-layer.js';
import { CodebaseToolResult } from '../types.js';

export const serviceTools: Tool[] = [
  {
    name: 'search_runtime_services',
    description: `Searches for runtime service implementations providing core app functionality.

**WHAT IS IT:**
A runtime service finder that locates implementations of core services providing app-wide functionality. Services include NavigationService (page navigation, routing), ModalService (dialog/modal management), SecurityService (authentication, authorization), NetworkService (connectivity monitoring), DeviceService (device API access), and more. Services are singleton instances accessible throughout the app via dependency injection.

**WHEN TO USE THIS TOOL:**
- When understanding core app services and their APIs
- When learning how navigation works (NavigationService)
- When seeing how modals/dialogs are managed (ModalService)
- When understanding authentication (SecurityService)
- When debugging service-related issues
- When implementing custom services
- When learning service APIs and methods
- When understanding service lifecycle and initialization

**WHY USE THIS TOOL:**
- Services provide essential app-wide functionality
- Understanding services is crucial for app development
- Service APIs are used throughout the app
- NavigationService is fundamental to app flow
- ModalService manages all dialogs and modals
- SecurityService handles authentication/authorization
- Custom services should follow existing patterns
- Service implementation reveals best practices

**KEY CAPABILITIES YOU CAN DISCOVER:**
- NavigationService: goToPage(), goBack(), navigation parameters, route management
- ModalService: showModal(), hideModal(), modal stacking, backdrop handling
- SecurityService: login(), logout(), isAuthenticated(), role checking
- NetworkService: isOnline(), connectivity monitoring, offline handling
- DeviceService: Device API access (camera, geolocation, contacts, etc.)
- Service APIs: Methods, properties, events for each service
- Service Lifecycle: Initialization, singleton management
- Service Integration: How services are used in pages/widgets

Use serviceName parameter to filter to specific service.`,
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
        serviceName: {type: 'string', description: 'Optional: specific service name'},
        maxResults: {type: 'number', default: 10}
      },
      required: ['runtimePath', 'codegenPath', 'query']
    }
  },
  {
    name: 'search_di_system',
    description: `Searches for dependency injection system and injector implementation.

**WHAT IS IT:**
A dependency injection (DI) system finder that locates the injector implementation managing service instances and dependencies. The DI system provides service registration, dependency resolution, singleton management, and injection into components. Services register themselves with the injector, and components request services via injection, enabling loose coupling and testability.

**WHEN TO USE THIS TOOL:**
- When understanding how dependency injection works
- When learning service registration and resolution
- When seeing how services are injected into components
- When debugging DI-related issues
- When implementing custom services with DI
- When understanding singleton management
- When learning DI patterns and best practices
- When troubleshooting service availability issues

**WHY USE THIS TOOL:**
- DI enables loose coupling between components and services
- Understanding DI is essential for service usage
- Service registration patterns must be followed
- Injection mechanism affects component initialization
- Singleton management prevents duplicate instances
- DI patterns guide custom service development
- Debugging DI requires understanding the injector
- Testability depends on proper DI usage

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Injector Implementation: Service registry, dependency resolution
- Service Registration: How services register with injector
- Dependency Resolution: How injector resolves service dependencies
- Injection Mechanism: How services are injected into components
- Singleton Management: Ensuring single service instances
- Service Lifecycle: When services are created and initialized
- DI Patterns: Constructor injection, property injection
- Testing: How DI enables service mocking and testing

Use this tool to understand the dependency injection infrastructure.`,
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
    name: 'search_service_layer',
    description: `Searches for service layer architecture and service registration patterns.

**WHAT IS IT:**
A service layer finder that locates the architecture organizing services and their registration. The service layer defines how services are structured, how they register with the DI system, how they interact with each other, and how they're accessed by the app. It includes service interfaces, base service classes, service initialization order, and service lifecycle management.

**WHEN TO USE THIS TOOL:**
- When understanding overall service architecture
- When learning service organization patterns
- When seeing how services are structured
- When understanding service initialization order
- When learning service interaction patterns
- When implementing custom service layers
- When debugging service architecture issues
- When documenting service organization

**WHY USE THIS TOOL:**
- Service layer provides architectural organization
- Understanding architecture helps navigate services
- Service structure patterns guide development
- Initialization order affects app startup
- Service interactions must be properly managed
- Custom services should follow layer patterns
- Architecture understanding aids debugging
- Layer organization affects maintainability

**KEY CAPABILITIES YOU CAN DISCOVER:**
- Service Architecture: How services are organized and structured
- Service Interfaces: Common interfaces services implement
- Base Service Classes: Abstract base classes for services
- Registration Patterns: How services register themselves
- Initialization Order: Service startup sequence
- Service Interactions: How services communicate
- Lifecycle Management: Service creation, initialization, cleanup
- Layer Organization: Grouping and categorization of services

Use this tool to understand the complete service layer architecture.`,
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

export const serviceHandlers = new Map<string, (args: any) => Promise<CodebaseToolResult>>([
  ['search_runtime_services', handleSearchRuntimeServices],
  ['search_di_system', handleSearchDiSystem],
  ['search_service_layer', handleSearchServiceLayer]
]);
