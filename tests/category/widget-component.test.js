/**
 * Widget Component Tools Tests (5 tools)
 * Tests for widget search, structure reading, catalog listing, and props
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig } from '../utils/test-helpers.js';
import { widgetComponentHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧩 WIDGET COMPONENT TOOLS TESTS (5 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_widget_components
// ============================================================================

await runner.runTest('1.1: search_widget_components - category=basic', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button',
    category: 'basic',
    includeRelated: true,
    maxResults: 10
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  return result.success;
});

await runner.runTest('1.2: search_widget_components - category=data', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'list',
    category: 'data',
    includeRelated: true,
    maxResults: 10
  });
  
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  return result.success;
});

await runner.runTest('1.3: search_widget_components - category=all', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'widget',
    category: 'all',
    includeRelated: false,
    maxResults: 20
  });
  
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  return result.success;
});

await runner.runTest('1.4: search_widget_components - includeRelated=true', async () => {
  const handler = widgetComponentHandlers.get('search_widget_components');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button',
    category: 'all',
    includeRelated: true,
    maxResults: 5
  });
  
  console.log(`  Should include .component.js, .styles.js files`);
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 2: read_widget_structure
// ============================================================================

await runner.runTest('2.1: read_widget_structure - extractProps=true', async () => {
  const searchHandler = widgetComponentHandlers.get('search_widget_by_name');
  const readHandler = widgetComponentHandlers.get('read_widget_structure');
  if (!searchHandler || !readHandler) return false;
  
  // First find button widget
  const searchResult = await searchHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'button',
    includeRelated: false
  });
  
  if (!searchResult.data?.files?.[0]) {
    console.log('  No button widget found');
    return false;
  }
  
  // Then read its structure
  const result = await readHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    filePath: searchResult.data.files[0].path,
    extractProps: true,
    extractEvents: false,
    extractStyles: false
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Props found: ${result.data?.props?.length || 0}`);
  
  return result.success;
});

await runner.runTest('2.2: read_widget_structure - extractEvents=true', async () => {
  const searchHandler = widgetComponentHandlers.get('search_widget_by_name');
  const readHandler = widgetComponentHandlers.get('read_widget_structure');
  if (!searchHandler || !readHandler) return false;
  
  const searchResult = await searchHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'button',
    includeRelated: false
  });
  
  if (!searchResult.data?.files?.[0]) return false;
  
  const result = await readHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    filePath: searchResult.data.files[0].path,
    extractProps: false,
    extractEvents: true,
    extractStyles: false
  });
  
  console.log(`  Events found: ${result.data?.events?.length || 0}`);
  return result.success;
});

await runner.runTest('2.3: read_widget_structure - extractStyles=true', async () => {
  const searchHandler = widgetComponentHandlers.get('search_widget_by_name');
  const readHandler = widgetComponentHandlers.get('read_widget_structure');
  if (!searchHandler || !readHandler) return false;
  
  const searchResult = await searchHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'button',
    includeRelated: false
  });
  
  if (!searchResult.data?.files?.[0]) return false;
  
  const result = await readHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    filePath: searchResult.data.files[0].path,
    extractProps: false,
    extractEvents: false,
    extractStyles: true
  });
  
  console.log(`  Styles extracted: ${result.success ? 'yes' : 'no'}`);
  return result.success;
});

// ============================================================================
// Test 3: search_widget_by_name
// ============================================================================

await runner.runTest('3.1: search_widget_by_name - widgetName=button', async () => {
  const handler = widgetComponentHandlers.get('search_widget_by_name');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'button',
    includeRelated: true
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success && result.data?.files?.length > 0;
});

await runner.runTest('3.2: search_widget_by_name - WmButton prefix', async () => {
  const handler = widgetComponentHandlers.get('search_widget_by_name');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'WmButton',
    includeRelated: true
  });
  
  console.log(`  Should handle Wm prefix`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_widget_by_name - nonexistent widget', async () => {
  const handler = widgetComponentHandlers.get('search_widget_by_name');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'NonExistentWidget',
    includeRelated: false
  });
  
  console.log(`  Should return empty results for nonexistent widget`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success && (result.data?.files?.length === 0 || !result.data?.files);
});

await runner.runTest('3.4: search_widget_by_name - includeRelated=true', async () => {
  const handler = widgetComponentHandlers.get('search_widget_by_name');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'button',
    includeRelated: true
  });
  
  console.log(`  Should include .component.js, .styles.js, .props.ts`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 4: list_all_widgets
// ============================================================================

await runner.runTest('4.1: list_all_widgets - category=all', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'all',
    includeMetadata: false
  });
  
  console.log(`  Widgets found: ${result.data?.widgets?.length || 0}`);
  console.log(`  Should list 50+ widgets`);
  return result.success && result.data?.widgets?.length > 0;
});

await runner.runTest('4.2: list_all_widgets - category=basic', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'basic',
    includeMetadata: false
  });
  
  console.log(`  Basic widgets found: ${result.data?.widgets?.length || 0}`);
  return result.success;
});

await runner.runTest('4.3: list_all_widgets - includeMetadata=true', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'all',
    includeMetadata: true
  });
  
  console.log(`  Should include prop interfaces, line counts`);
  console.log(`  Widgets with metadata: ${result.data?.widgets?.length || 0}`);
  return result.success;
});

await runner.runTest('4.4: list_all_widgets - grouped by category', async () => {
  const handler = widgetComponentHandlers.get('list_all_widgets');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    category: 'all',
    includeMetadata: false
  });
  
  console.log(`  Categories found: ${result.data?.categories?.length || 0}`);
  console.log(`  Grouped by category: ${!!result.data?.byCategory}`);
  return result.success && !!result.data?.byCategory;
});

// ============================================================================
// Test 5: search_widget_props
// ============================================================================

await runner.runTest('5.1: search_widget_props - button props', async () => {
  const handler = widgetComponentHandlers.get('search_widget_props');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button properties',
    widgetName: 'button',
    maxResults: 5
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('5.2: search_widget_props - widgetName filter', async () => {
  const handler = widgetComponentHandlers.get('search_widget_props');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'props',
    widgetName: 'list',
    maxResults: 5
  });
  
  console.log(`  Should filter to list widget only`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('5.3: search_widget_props - TypeScript interfaces', async () => {
  const handler = widgetComponentHandlers.get('search_widget_props');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'interface props',
    maxResults: 10
  });
  
  console.log(`  Should find TypeScript .props.ts files`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

