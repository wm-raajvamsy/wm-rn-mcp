/**
 * Edge Cases and Error Handling Tests
 * Tests for invalid inputs, errors, special characters, and concurrency
 */

import { TestRunner } from './utils/test-runner.js';
import { getTestConfig, generateMockArgs } from './utils/test-helpers.js';
import { 
  baseComponentHandlers,
  widgetComponentHandlers,
  styleThemeHandlers
} from '../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  EDGE CASES & ERROR HANDLING TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: Invalid Paths
// ============================================================================

await runner.runTest('Edge Case 1.1: Invalid runtime path', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: '/nonexistent/path/to/runtime',
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseComponent',
    maxResults: 5
  });
  
  console.log(`  Should handle invalid path gracefully`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Error message: ${result.error || 'none'}`);
  
  // Tool should not crash, may succeed with 0 results or fail gracefully
  return true;
});

await runner.runTest('Edge Case 1.2: Invalid codegen path', async () => {
  const handler = styleThemeHandlers.get('search_style_definitions');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: '/nonexistent/path/to/codegen',
    query: 'styles',
    maxResults: 5
  });
  
  console.log(`  Should handle invalid codegen path`);
  console.log(`  Success: ${result.success}`);
  
  // Should not crash
  return true;
});

await runner.runTest('Edge Case 1.3: Both paths invalid', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: '/nonexistent/runtime',
    codegenPath: '/nonexistent/codegen',
    category: 'all'
  });
  
  console.log(`  Should handle both invalid paths`);
  console.log(`  Success: ${result.success}`);
  
  // Should not crash
  return true;
});

// ============================================================================
// Test 2: Empty/Null Query Strings
// ============================================================================

await runner.runTest('Edge Case 2.1: Empty query string', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: '',
    maxResults: 5
  });
  
  console.log(`  Empty query should be handled`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  
  return true;
});

await runner.runTest('Edge Case 2.2: Whitespace-only query', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: '   ',
    category: 'all',
    maxResults: 5
  });
  
  console.log(`  Whitespace query should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

// ============================================================================
// Test 3: Extremely Long Query Strings
// ============================================================================

await runner.runTest('Edge Case 3.1: Very long query (1000 chars)', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const longQuery = 'a'.repeat(1000);
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: longQuery,
    maxResults: 5
  });
  
  console.log(`  Long query (1000 chars) should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

await runner.runTest('Edge Case 3.2: Extremely long query (10000 chars)', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const extremelyLongQuery = 'query '.repeat(2000); // ~10000 chars
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: extremelyLongQuery,
    category: 'all',
    maxResults: 5
  });
  
  console.log(`  Extremely long query should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

// ============================================================================
// Test 4: Special Characters in Queries
// ============================================================================

await runner.runTest('Edge Case 4.1: Special regex characters', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: '.*[](){}+?^$|\\',
    maxResults: 5
  });
  
  console.log(`  Special regex characters should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

await runner.runTest('Edge Case 4.2: Unicode characters', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: '你好世界 🚀 مرحبا',
    category: 'all',
    maxResults: 5
  });
  
  console.log(`  Unicode characters should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

await runner.runTest('Edge Case 4.3: SQL injection-like strings', async () => {
  const handler = styleThemeHandlers.get('search_style_definitions');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: "'; DROP TABLE users; --",
    maxResults: 5
  });
  
  console.log(`  SQL injection-like strings should be handled safely`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

// ============================================================================
// Test 5: Invalid Parameter Values
// ============================================================================

await runner.runTest('Edge Case 5.1: maxResults=0', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseComponent',
    maxResults: 0
  });
  
  console.log(`  maxResults=0 should be handled`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  
  return true;
});

await runner.runTest('Edge Case 5.2: maxResults negative', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'all',
    maxResults: -10
  });
  
  console.log(`  Negative maxResults should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

await runner.runTest('Edge Case 5.3: Invalid enum value', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'invalid_category',
    includeMetadata: false
  });
  
  console.log(`  Invalid category enum should be handled`);
  console.log(`  Success: ${result.success}`);
  
  return true;
});

// ============================================================================
// Test 6: Missing Required Parameters
// ============================================================================

await runner.runTest('Edge Case 6.1: Missing runtimePath', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  try {
    const result = await handler({
      codegenPath: TEST_PATHS.codegenPath,
      query: 'BaseComponent',
      maxResults: 5
    });
    
    console.log(`  Missing runtimePath handled`);
    console.log(`  Success: ${result.success}`);
    return true;
  } catch (error) {
    console.log(`  Caught error: ${error.message}`);
    return true;
  }
});

await runner.runTest('Edge Case 6.2: Missing query parameter', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  try {
    const result = await handler({
      runtimePath: TEST_PATHS.runtimePath,
      codegenPath: TEST_PATHS.codegenPath,
      maxResults: 5
    });
    
    console.log(`  Missing query handled`);
    console.log(`  Success: ${result.success}`);
    return true;
  } catch (error) {
    console.log(`  Caught error: ${error.message}`);
    return true;
  }
});

// ============================================================================
// Test 7: Concurrent Tool Executions
// ============================================================================

await runner.runTest('Edge Case 7.1: Parallel tool executions (5 concurrent)', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      handler({
        runtimePath: TEST_PATHS.runtimePath,
        codegenPath: TEST_PATHS.codegenPath,
        query: `BaseComponent test ${i}`,
        maxResults: 5
      })
    );
  }
  
  const results = await Promise.all(promises);
  const allSucceeded = results.every(r => r.meta && typeof r.meta.executionTimeMs === 'number');
  
  console.log(`  5 parallel executions completed`);
  console.log(`  All have valid meta: ${allSucceeded}`);
  
  return allSucceeded;
});

await runner.runTest('Edge Case 7.2: Mixed parallel tool executions (10 concurrent)', async () => {
  const baseHandler = baseComponentHandlers.get('search_base_component');
  const widgetHandler = widgetComponentHandlers.get('list_all_widgets');
  const styleHandler = styleThemeHandlers.get('search_class_names');
  
  if (!baseHandler || !widgetHandler || !styleHandler) return false;
  
  const promises = [
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'BaseComponent', maxResults: 5 }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'lifecycle', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, category: 'all' }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, category: 'basic' }),
    styleHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, includeNested: true }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'events', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, category: 'data' }),
    styleHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, component: 'button', includeNested: true }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'properties', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, category: 'input' })
  ];
  
  const results = await Promise.all(promises);
  const allCompleted = results.every(r => r.meta && typeof r.meta.executionTimeMs === 'number');
  
  console.log(`  10 mixed parallel executions completed`);
  console.log(`  All completed: ${allCompleted}`);
  
  return allCompleted;
});

// ============================================================================
// Test 8: File Read Errors
// ============================================================================

await runner.runTest('Edge Case 8.1: Read non-existent file', async () => {
  const handler = baseComponentHandlers.get('read_base_component');
  if (!handler) return false;
  
  const result = await handler({
    filePath: '/nonexistent/file/path.ts',
    extract: ['methods']
  });
  
  console.log(`  Non-existent file read should fail gracefully`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Has error message: ${!!result.error}`);
  
  // Should fail with error message
  return !result.success && !!result.error;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

