/**
 * Base Component Tools Tests (6 tools)
 * Tests for BaseComponent search, lifecycle, properties, events, and hierarchy
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig, assertTrue, assertExists } from '../utils/test-helpers.js';
import { baseComponentHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 BASE COMPONENT TOOLS TESTS (6 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_base_component
// ============================================================================

await runner.runTest('1.1: search_base_component - focus=lifecycle', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseComponent lifecycle methods',
    focus: 'lifecycle',
    maxResults: 5
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  const validation = validateToolResult(result, {
    shouldSucceed: true,
    domain: 'base-component'
  });
  
  return validation.passed && result.data?.files?.length > 0;
});

await runner.runTest('1.2: search_base_component - focus=properties', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'getProperty setProperty',
    focus: 'properties',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success && result.data?.files?.length > 0;
});

await runner.runTest('1.3: search_base_component - focus=events', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'event notification',
    focus: 'events',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.4: search_base_component - empty query', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: '',
    maxResults: 5
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  // Empty query should still succeed and find BaseComponent files
  return result.success;
});

// ============================================================================
// Test 2: read_base_component
// ============================================================================

await runner.runTest('2.1: read_base_component - extract methods', async () => {
  const searchHandler = baseComponentHandlers.get('search_base_component');
  const readHandler = baseComponentHandlers.get('read_base_component');
  if (!searchHandler || !readHandler) return false;
  
  // First search for BaseComponent file
  const searchResult = await searchHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseComponent class',
    maxResults: 1
  });
  
  if (!searchResult.data?.files?.[0]) {
    console.log('  No BaseComponent file found to read');
    return false;
  }
  
  // Then read it
  const result = await readHandler({
    filePath: searchResult.data.files[0].path,
    extract: ['methods'],
    includeComments: false
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Methods extracted: ${result.data?.methods?.length || 0}`);
  
  return result.success;
});

await runner.runTest('2.2: read_base_component - extract properties and lifecycle', async () => {
  const searchHandler = baseComponentHandlers.get('search_base_component');
  const readHandler = baseComponentHandlers.get('read_base_component');
  if (!searchHandler || !readHandler) return false;
  
  const searchResult = await searchHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseComponent',
    maxResults: 1
  });
  
  if (!searchResult.data?.files?.[0]) return false;
  
  const result = await readHandler({
    filePath: searchResult.data.files[0].path,
    extract: ['properties', 'lifecycle'],
    includeComments: true
  });
  
  console.log(`  Properties: ${result.data?.properties?.length || 0}`);
  console.log(`  Lifecycle hooks: ${result.data?.lifecycle?.length || 0}`);
  
  return result.success;
});

await runner.runTest('2.3: read_base_component - invalid file path', async () => {
  const readHandler = baseComponentHandlers.get('read_base_component');
  if (!readHandler) return false;
  
  const result = await readHandler({
    filePath: '/nonexistent/file.ts',
    extract: ['methods']
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Error: ${result.error || 'none'}`);
  
  // Should fail with invalid path
  return !result.success && !!result.error;
});

// ============================================================================
// Test 3: search_lifecycle_hooks
// ============================================================================

await runner.runTest('3.1: search_lifecycle_hooks - hookType=mount', async () => {
  const handler = baseComponentHandlers.get('search_lifecycle_hooks');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'componentDidMount',
    hookType: 'mount',
    maxResults: 10
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.2: search_lifecycle_hooks - hookType=unmount', async () => {
  const handler = baseComponentHandlers.get('search_lifecycle_hooks');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'cleanup unmount',
    hookType: 'unmount',
    maxResults: 10
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_lifecycle_hooks - hookType=all', async () => {
  const handler = baseComponentHandlers.get('search_lifecycle_hooks');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'lifecycle',
    hookType: 'all',
    maxResults: 15
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 4: search_props_provider
// ============================================================================

await runner.runTest('4.1: search_props_provider - getProperty', async () => {
  const handler = baseComponentHandlers.get('search_props_provider');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'getProperty implementation',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.2: search_props_provider - property inheritance', async () => {
  const handler = baseComponentHandlers.get('search_props_provider');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'property inheritance parent',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 5: search_event_notifier
// ============================================================================

await runner.runTest('5.1: search_event_notifier - EventNotifier class', async () => {
  const handler = baseComponentHandlers.get('search_event_notifier');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'EventNotifier',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('5.2: search_event_notifier - invokeEventCallback', async () => {
  const handler = baseComponentHandlers.get('search_event_notifier');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'invokeEventCallback',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 6: analyze_component_hierarchy
// ============================================================================

await runner.runTest('6.1: analyze_component_hierarchy - all components', async () => {
  const handler = baseComponentHandlers.get('analyze_component_hierarchy');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    depth: 2
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Components found: ${result.data?.components?.length || 0}`);
  return result.success;
});

await runner.runTest('6.2: analyze_component_hierarchy - Button component', async () => {
  const handler = baseComponentHandlers.get('analyze_component_hierarchy');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    componentName: 'Button',
    depth: 3
  });
  
  console.log(`  Success: ${result.success}`);
  return result.success;
});

await runner.runTest('6.3: analyze_component_hierarchy - depth=1', async () => {
  const handler = baseComponentHandlers.get('analyze_component_hierarchy');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    depth: 1
  });
  
  console.log(`  Depth limited to 1`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

