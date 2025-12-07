/**
 * Fragment & Page Tools Tests (3 tools)
 * Tests for fragment system, page structure, and prefabs
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig } from '../utils/test-helpers.js';
import { fragmentPageHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📄 FRAGMENT & PAGE TOOLS TESTS (3 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_fragment_system
// ============================================================================

await runner.runTest('1.1: search_fragment_system - BaseFragment class', async () => {
  const handler = fragmentPageHandlers.get('search_fragment_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseFragment',
    maxResults: 10
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  return result.success;
});

await runner.runTest('1.2: search_fragment_system - page lifecycle', async () => {
  const handler = fragmentPageHandlers.get('search_fragment_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'onPageReady onPageLeave',
    maxResults: 10
  });
  
  console.log(`  Should find onPageReady, onPageLeave`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.3: search_fragment_system - fragment navigation', async () => {
  const handler = fragmentPageHandlers.get('search_fragment_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'fragment navigation',
    maxResults: 10
  });
  
  console.log(`  Should find fragment navigation code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.4: search_fragment_system - pages vs partials', async () => {
  const handler = fragmentPageHandlers.get('search_fragment_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'pages partials',
    maxResults: 10
  });
  
  console.log(`  Should distinguish between pages and partials`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 2: search_page_structure
// ============================================================================

await runner.runTest('2.1: search_page_structure - page lifecycle', async () => {
  const handler = fragmentPageHandlers.get('search_page_structure');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'page lifecycle initialization',
    maxResults: 10
  });
  
  console.log(`  Should find page initialization`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.2: search_page_structure - page component structure', async () => {
  const handler = fragmentPageHandlers.get('search_page_structure');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'page component structure',
    maxResults: 10
  });
  
  console.log(`  Should find page component structure`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.3: search_page_structure - navigation integration', async () => {
  const handler = fragmentPageHandlers.get('search_page_structure');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'navigation integration',
    maxResults: 10
  });
  
  console.log(`  Should find navigation integration`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 3: search_prefab_system
// ============================================================================

await runner.runTest('3.1: search_prefab_system - prefab packaging', async () => {
  const handler = fragmentPageHandlers.get('search_prefab_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'prefab packaging',
    maxResults: 10
  });
  
  console.log(`  Should find prefab bundler`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.2: search_prefab_system - prefab isolation', async () => {
  const handler = fragmentPageHandlers.get('search_prefab_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'prefab isolation',
    maxResults: 10
  });
  
  console.log(`  Should find prefab isolation code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_prefab_system - prefab registration', async () => {
  const handler = fragmentPageHandlers.get('search_prefab_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'prefab registration',
    maxResults: 10
  });
  
  console.log(`  Should find prefab registration`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

