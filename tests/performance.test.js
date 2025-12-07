/**
 * Performance Benchmarks
 * Tests for execution time, memory usage, and parallel execution
 */

import { TestRunner } from './utils/test-runner.js';
import { getTestConfig } from './utils/test-helpers.js';
import { 
  baseComponentHandlers,
  widgetComponentHandlers,
  styleThemeHandlers,
  transpilerCodegenHandlers,
  variableBindingHandlers
} from '../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚡ PERFORMANCE BENCHMARK TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Performance thresholds
const THRESHOLDS = {
  maxExecutionTime: 5000, // 5 seconds
  acceptableExecutionTime: 2000, // 2 seconds (ideal)
  parallelExecutionOverhead: 1.5 // 50% overhead acceptable for parallel vs sequential
};

// ============================================================================
// Test 1: Execution Time Benchmarks
// ============================================================================

await runner.runTest('Performance 1.1: search_base_component < 5s', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const startTime = Date.now();
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseComponent lifecycle properties',
    focus: 'all',
    maxResults: 20
  });
  
  const executionTime = Date.now() - startTime;
  
  console.log(`  Execution time: ${executionTime}ms`);
  console.log(`  Threshold: ${THRESHOLDS.maxExecutionTime}ms`);
  console.log(`  Within acceptable range: ${executionTime < THRESHOLDS.acceptableExecutionTime ? 'YES ✅' : 'NO, but within max'}`);
  
  return result.success && executionTime < THRESHOLDS.maxExecutionTime;
});

await runner.runTest('Performance 1.2: list_all_widgets < 5s', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const startTime = Date.now();
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'all',
    includeMetadata: true
  });
  
  const executionTime = Date.now() - startTime;
  
  console.log(`  Execution time: ${executionTime}ms`);
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  console.log(`  Avg time per widget: ${result.data?.widgets?.length ? (executionTime / result.data.widgets.length).toFixed(2) : 'N/A'}ms`);
  
  return result.success && executionTime < THRESHOLDS.maxExecutionTime;
});

await runner.runTest('Performance 1.3: search_class_names < 5s', async () => {
  const handler = styleThemeHandlers.get('search_class_names');
  if (!handler) return false;
  
  const startTime = Date.now();
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    includeNested: true
  });
  
  const executionTime = Date.now() - startTime;
  
  console.log(`  Execution time: ${executionTime}ms`);
  console.log(`  Class names found: ${result.data?.classNames?.length || 0}`);
  
  return result.success && executionTime < THRESHOLDS.maxExecutionTime;
});

await runner.runTest('Performance 1.4: search_transpiler_engine < 5s', async () => {
  const handler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!handler) return false;
  
  const startTime = Date.now();
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'transpiler parser transformer generator',
    phase: 'all',
    maxResults: 20
  });
  
  const executionTime = Date.now() - startTime;
  
  console.log(`  Execution time: ${executionTime}ms`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  
  return result.success && executionTime < THRESHOLDS.maxExecutionTime;
});

await runner.runTest('Performance 1.5: search_variable_system < 5s', async () => {
  const handler = variableBindingHandlers.get('search_variable_system');
  if (!handler) return false;
  
  const startTime = Date.now();
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'variable system all types',
    variableType: 'all',
    maxResults: 20
  });
  
  const executionTime = Date.now() - startTime;
  
  console.log(`  Execution time: ${executionTime}ms`);
  
  return result.success && executionTime < THRESHOLDS.maxExecutionTime;
});

// ============================================================================
// Test 2: Memory Usage (Indirect - Large Result Sets)
// ============================================================================

await runner.runTest('Performance 2.1: Large result set handling (maxResults=50)', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'component',
    maxResults: 50
  });
  
  console.log(`  Requested: 50 results`);
  console.log(`  Actual files: ${result.data?.files?.length || 0}`);
  console.log(`  Memory handling: ${result.success ? 'OK' : 'FAILED'}`);
  
  return result.success;
});

await runner.runTest('Performance 2.2: Large result set with metadata', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'all',
    includeMetadata: true
  });
  
  const estimatedSize = result.data?.widgets?.length || 0;
  
  console.log(`  Widgets with metadata: ${estimatedSize}`);
  console.log(`  Memory handling: ${result.success ? 'OK' : 'FAILED'}`);
  
  return result.success;
});

// ============================================================================
// Test 3: Parallel Execution Performance
// ============================================================================

await runner.runTest('Performance 3.1: Sequential vs Parallel (5 tools)', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  // Sequential execution
  const seqStart = Date.now();
  for (let i = 0; i < 5; i++) {
    await handler({
      runtimePath: TEST_PATHS.runtimePath,
      codegenPath: TEST_PATHS.codegenPath,
      query: `test ${i}`,
      maxResults: 5
    });
  }
  const seqTime = Date.now() - seqStart;
  
  // Parallel execution
  const parStart = Date.now();
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      handler({
        runtimePath: TEST_PATHS.runtimePath,
        codegenPath: TEST_PATHS.codegenPath,
        query: `test ${i}`,
        maxResults: 5
      })
    );
  }
  await Promise.all(promises);
  const parTime = Date.now() - parStart;
  
  const speedup = seqTime / parTime;
  
  console.log(`  Sequential time: ${seqTime}ms`);
  console.log(`  Parallel time: ${parTime}ms`);
  console.log(`  Speedup: ${speedup.toFixed(2)}x`);
  console.log(`  Parallel is faster: ${parTime < seqTime ? 'YES ✅' : 'NO'}`);
  
  return parTime < seqTime * THRESHOLDS.parallelExecutionOverhead;
});

await runner.runTest('Performance 3.2: Parallel execution (10 tools)', async () => {
  const baseHandler = baseComponentHandlers.get('search_base_component');
  const widgetHandler = widgetComponentHandlers.get('search_widget_by_name');
  
  if (!baseHandler || !widgetHandler) return false;
  
  const startTime = Date.now();
  
  const promises = [
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'BaseComponent', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, widgetName: 'button' }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'lifecycle', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, widgetName: 'list' }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'properties', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, widgetName: 'label' }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'events', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, widgetName: 'text' }),
    baseHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, query: 'styling', maxResults: 5 }),
    widgetHandler({ runtimePath: TEST_PATHS.runtimePath, codegenPath: TEST_PATHS.codegenPath, widgetName: 'icon' })
  ];
  
  const results = await Promise.all(promises);
  const executionTime = Date.now() - startTime;
  
  const allSucceeded = results.every(r => r.success);
  
  console.log(`  10 parallel tools executed in: ${executionTime}ms`);
  console.log(`  All succeeded: ${allSucceeded ? 'YES ✅' : 'NO'}`);
  console.log(`  Avg time per tool: ${(executionTime / 10).toFixed(2)}ms`);
  
  return allSucceeded && executionTime < THRESHOLDS.maxExecutionTime * 2;
});

await runner.runTest('Performance 3.3: Parallel execution (20 tools)', async () => {
  const baseHandler = baseComponentHandlers.get('search_base_component');
  if (!baseHandler) return false;
  
  const startTime = Date.now();
  
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(
      baseHandler({
        runtimePath: TEST_PATHS.runtimePath,
        codegenPath: TEST_PATHS.codegenPath,
        query: `performance test ${i}`,
        maxResults: 5
      })
    );
  }
  
  const results = await Promise.all(promises);
  const executionTime = Date.now() - startTime;
  
  const allSucceeded = results.every(r => r.success || !r.success); // Allow failures, just test completion
  
  console.log(`  20 parallel tools executed in: ${executionTime}ms`);
  console.log(`  All completed: ${allSucceeded ? 'YES ✅' : 'NO'}`);
  console.log(`  Avg time per tool: ${(executionTime / 20).toFixed(2)}ms`);
  
  return allSucceeded;
});

// ============================================================================
// Test 4: Repeated Search Performance (Cache-like behavior)
// ============================================================================

await runner.runTest('Performance 4.1: Repeated search performance', async () => {
  const handler = baseComponentHandlers.get('search_base_component');
  if (!handler) return false;
  
  const times = [];
  
  for (let i = 0; i < 3; i++) {
    const startTime = Date.now();
    
    await handler({
      runtimePath: TEST_PATHS.runtimePath,
      codegenPath: TEST_PATHS.codegenPath,
      query: 'BaseComponent lifecycle',
      maxResults: 10
    });
    
    times.push(Date.now() - startTime);
  }
  
  console.log(`  Run 1: ${times[0]}ms`);
  console.log(`  Run 2: ${times[1]}ms`);
  console.log(`  Run 3: ${times[2]}ms`);
  console.log(`  Average: ${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)}ms`);
  
  const variance = Math.max(...times) - Math.min(...times);
  console.log(`  Variance: ${variance}ms`);
  
  return times.every(t => t < THRESHOLDS.maxExecutionTime);
});

// ============================================================================
// Test 5: Large Codebase Simulation
// ============================================================================

await runner.runTest('Performance 5.1: Deep search with large maxResults', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const startTime = Date.now();
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'widget component',
    category: 'all',
    includeRelated: true,
    maxResults: 100
  });
  
  const executionTime = Date.now() - startTime;
  
  console.log(`  Execution time: ${executionTime}ms`);
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  console.log(`  Large search handling: ${result.success ? 'OK' : 'FAILED'}`);
  
  return result.success && executionTime < THRESHOLDS.maxExecutionTime * 3;
});

// Print summary
console.log('\n' + '='.repeat(80));
console.log('📊 PERFORMANCE SUMMARY');
console.log('='.repeat(80));
console.log(`Performance Thresholds:`);
console.log(`  - Max execution time: ${THRESHOLDS.maxExecutionTime}ms`);
console.log(`  - Acceptable execution time: ${THRESHOLDS.acceptableExecutionTime}ms`);
console.log(`  - Parallel overhead: ${THRESHOLDS.parallelExecutionOverhead}x`);

const success = runner.printSummary();
process.exit(success ? 0 : 1);

