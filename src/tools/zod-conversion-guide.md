# Zod Schema Conversion Guide

This guide documents the conversion patterns from JSON Schema to Zod schema for all MCP tools.

## Basic Type Conversions

### String
```typescript
// JSON Schema
{ type: 'string', description: 'A string value' }

// Zod
z.string().describe('A string value')
```

### Number
```typescript
// JSON Schema
{ type: 'number', description: 'A numeric value' }

// Zod
z.number().describe('A numeric value')
```

### Integer
```typescript
// JSON Schema
{ type: 'integer', description: 'An integer value' }

// Zod
z.number().int().describe('An integer value')
```

### Boolean
```typescript
// JSON Schema
{ type: 'boolean', description: 'A boolean value' }

// Zod
z.boolean().describe('A boolean value')
```

## Complex Type Conversions

### Array of Strings
```typescript
// JSON Schema
{
  type: 'array',
  items: { type: 'string' },
  description: 'Array of strings'
}

// Zod
z.array(z.string()).describe('Array of strings')
```

### Array with Enum Items
```typescript
// JSON Schema
{
  type: 'array',
  items: {
    type: 'string',
    enum: ['methods', 'properties', 'lifecycle']
  }
}

// Zod
z.array(z.enum(['methods', 'properties', 'lifecycle']))
```

### Enum
```typescript
// JSON Schema
{
  type: 'string',
  enum: ['option1', 'option2', 'option3'],
  description: 'Choose an option'
}

// Zod
z.enum(['option1', 'option2', 'option3']).describe('Choose an option')
```

### Object (passthrough)
```typescript
// JSON Schema
{ type: 'object', description: 'An object' }

// Zod
z.object({}).passthrough().describe('An object')
```

## Property Modifiers

### Optional Properties
```typescript
// JSON Schema
{
  type: 'object',
  properties: {
    required: { type: 'string' },
    optional: { type: 'string' }
  },
  required: ['required']
}

// Zod
{
  required: z.string(),
  optional: z.string().optional()
}
```

### Default Values
```typescript
// JSON Schema
{
  type: 'number',
  default: 10,
  description: 'Maximum results'
}

// Zod
z.number().default(10).describe('Maximum results')
```

### Default with Enum
```typescript
// JSON Schema
{
  type: 'string',
  enum: ['all', 'lifecycle', 'properties'],
  default: 'all'
}

// Zod
z.enum(['all', 'lifecycle', 'properties']).default('all')
```

## Complete Example

### Before (JSON Schema)
```typescript
{
  name: 'search_base_component',
  description: 'Searches for BaseComponent implementation',
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
        description: 'Semantic query about BaseComponent'
      },
      focus: {
        type: 'string',
        enum: ['lifecycle', 'properties', 'styling', 'events', 'all'],
        description: 'Focus area within BaseComponent',
        default: 'all'
      },
      includeTests: {
        type: 'boolean',
        description: 'Include test files in results',
        default: false
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
```

### After (Zod)
```typescript
import { z } from 'zod';

{
  name: 'search_base_component',
  description: 'Searches for BaseComponent implementation',
  inputSchema: {
    runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
    codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory'),
    query: z.string().describe('Semantic query about BaseComponent'),
    focus: z.enum(['lifecycle', 'properties', 'styling', 'events', 'all'])
      .default('all')
      .describe('Focus area within BaseComponent'),
    includeTests: z.boolean().default(false).describe('Include test files in results'),
    maxResults: z.number().default(10).describe('Maximum number of files to return')
  },
  outputSchema: z.any()
}
```

## Output Schemas

All tools return dynamic JSON content, so use `z.any()` for output schemas:

```typescript
outputSchema: z.any()
```

## Import Statement

Add this import at the top of every file that uses Zod schemas:

```typescript
import { z } from 'zod';
```

## Common Patterns in Our Tools

### Pattern 1: Base Parameters (runtimePath, codegenPath)
```typescript
runtimePath: z.string().describe('Absolute path to @wavemaker/app-rn-runtime codebase directory'),
codegenPath: z.string().describe('Absolute path to @wavemaker/rn-codegen codebase directory')
```

### Pattern 2: Search with Query
```typescript
query: z.string().describe('Semantic query about...')
```

### Pattern 3: Max Results
```typescript
maxResults: z.number().default(10).describe('Maximum number of files to return')
```

### Pattern 4: Boolean Flags
```typescript
includeTests: z.boolean().default(false).describe('Include test files in results'),
includeRelated: z.boolean().default(true).describe('Include related files')
```

### Pattern 5: Category Enum
```typescript
category: z.enum(['basic', 'container', 'data', 'form', 'input', 'layout', 'advanced', 'all'])
  .default('all')
  .describe('Widget category filter')
```

### Pattern 6: Hook Type Enum
```typescript
hookType: z.enum(['mount', 'unmount', 'update', 'render', 'all'])
  .default('all')
  .describe('Type of lifecycle hook to search for')
```

## Conversion Checklist

For each tool:
- [ ] Add `import { z } from 'zod';` at the top of the file
- [ ] Replace `type: 'object'` with Zod object schema
- [ ] Replace `properties` with Zod fields
- [ ] Convert each property type to Zod equivalent
- [ ] Add `.optional()` to non-required properties
- [ ] Add `.default(value)` where defaults exist
- [ ] Add `.describe(description)` to all fields
- [ ] Remove the `required` array (Zod infers this)
- [ ] Add `outputSchema: z.any()` to the tool definition
- [ ] Test the conversion with `npm run build`

