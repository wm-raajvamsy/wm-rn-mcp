/**
 * Variable & Binding Tools Tests (5 tools)
 * Tests for variable system, bindings, watchers, and variable types
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig } from '../utils/test-helpers.js';
import { variableBindingHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 VARIABLE & BINDING TOOLS TESTS (5 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_variable_system
// ============================================================================

await runner.runTest('1.1: search_variable_system - variableType=live', async () => {
  const handler = variableBindingHandlers.get('search_variable_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'LiveVariable implementation',
    variableType: 'live',
    maxResults: 10
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  return result.success;
});

await runner.runTest('1.2: search_variable_system - variableType=service', async () => {
  const handler = variableBindingHandlers.get('search_variable_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'ServiceVariable',
    variableType: 'service',
    maxResults: 10
  });
  
  console.log(`  Should find ServiceVariable`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.3: search_variable_system - variable lifecycle', async () => {
  const handler = variableBindingHandlers.get('search_variable_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'variable lifecycle init invoke success',
    variableType: 'all',
    maxResults: 10
  });
  
  console.log(`  Should find init, invoke, success hooks`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.4: search_variable_system - dataSet property', async () => {
  const handler = variableBindingHandlers.get('search_variable_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'dataSet property usage',
    variableType: 'all',
    maxResults: 10
  });
  
  console.log(`  Should find dataSet property usage`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 2: search_binding_mechanism
// ============================================================================

await runner.runTest('2.1: search_binding_mechanism - two-way binding', async () => {
  const handler = variableBindingHandlers.get('search_binding_mechanism');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'two-way binding',
    maxResults: 10
  });
  
  console.log(`  Should find binding implementation`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.2: search_binding_mechanism - bind expressions', async () => {
  const handler = variableBindingHandlers.get('search_binding_mechanism');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'bind: syntax handling',
    maxResults: 10
  });
  
  console.log(`  Should find bind: syntax handling`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.3: search_binding_mechanism - property binding', async () => {
  const handler = variableBindingHandlers.get('search_binding_mechanism');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'property binding code',
    maxResults: 10
  });
  
  console.log(`  Should find property binding code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 3: search_watcher_system
// ============================================================================

await runner.runTest('3.1: search_watcher_system - watch system', async () => {
  const handler = variableBindingHandlers.get('search_watcher_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'watch system implementation',
    maxResults: 10
  });
  
  console.log(`  Should find watcher implementation`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.2: search_watcher_system - digest cycle', async () => {
  const handler = variableBindingHandlers.get('search_watcher_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'digest cycle change detection',
    maxResults: 10
  });
  
  console.log(`  Should find change detection`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_watcher_system - watch optimization', async () => {
  const handler = variableBindingHandlers.get('search_watcher_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'watch optimization',
    maxResults: 10
  });
  
  console.log(`  Should find watch optimization code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 4: search_variable_types
// ============================================================================

await runner.runTest('4.1: search_variable_types - device variable', async () => {
  const handler = variableBindingHandlers.get('search_variable_types');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    variableType: 'device',
    maxResults: 10
  });
  
  console.log(`  Should find DeviceVariable`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.2: search_variable_types - navigation variable', async () => {
  const handler = variableBindingHandlers.get('search_variable_types');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    variableType: 'navigation',
    maxResults: 10
  });
  
  console.log(`  Should find NavigationVariable`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.3: search_variable_types - timer variable', async () => {
  const handler = variableBindingHandlers.get('search_variable_types');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    variableType: 'timer',
    maxResults: 10
  });
  
  console.log(`  Should find TimerVariable`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 5: analyze_binding_flow
// ============================================================================

await runner.runTest('5.1: analyze_binding_flow - button component', async () => {
  const handler = variableBindingHandlers.get('analyze_binding_flow');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    componentName: 'button'
  });
  
  console.log(`  Should trace button bindings`);
  console.log(`  Bindings found: ${result.data?.bindings?.length || 0}`);
  return result.success;
});

await runner.runTest('5.2: analyze_binding_flow - general binding flow', async () => {
  const handler = variableBindingHandlers.get('analyze_binding_flow');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath
  });
  
  console.log(`  Should show general binding flow`);
  console.log(`  Success: ${result.success}`);
  return result.success;
});

await runner.runTest('5.3: analyze_binding_flow - source-to-target connections', async () => {
  const handler = variableBindingHandlers.get('analyze_binding_flow');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    componentName: 'list'
  });
  
  console.log(`  Should show source-to-target connections`);
  console.log(`  Success: ${result.success}`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

