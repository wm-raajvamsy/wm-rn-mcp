/**
 * Transpiler & Codegen Tools Tests (6 tools)
 * Tests for transpiler engine, transformers, parsers, templates, and build flow
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig } from '../utils/test-helpers.js';
import { transpilerCodegenHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚙️  TRANSPILER & CODEGEN TOOLS TESTS (6 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_transpiler_engine
// ============================================================================

await runner.runTest('1.1: search_transpiler_engine - phase=parse', async () => {
  const handler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'MarkupParser',
    phase: 'parse',
    maxResults: 10
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  return result.success;
});

await runner.runTest('1.2: search_transpiler_engine - phase=transform', async () => {
  const handler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'TransformerRegistry',
    phase: 'transform',
    maxResults: 10
  });
  
  console.log(`  Should find TransformerRegistry`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.3: search_transpiler_engine - phase=generate', async () => {
  const handler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'CodeGenerator',
    phase: 'generate',
    maxResults: 10
  });
  
  console.log(`  Should find CodeGenerator`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.4: search_transpiler_engine - phase=all', async () => {
  const handler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'transpilation pipeline',
    phase: 'all',
    maxResults: 15
  });
  
  console.log(`  Should find complete pipeline`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 2: search_transformer_registry
// ============================================================================

await runner.runTest('2.1: search_transformer_registry - widgetName=button', async () => {
  const handler = transpilerCodegenHandlers.get('search_transformer_registry');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button transformer',
    widgetName: 'button',
    maxResults: 10
  });
  
  console.log(`  Should find ButtonTransformer`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.2: search_transformer_registry - transformer registry', async () => {
  const handler = transpilerCodegenHandlers.get('search_transformer_registry');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'transformer registry',
    maxResults: 10
  });
  
  console.log(`  Should find registration code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.3: search_transformer_registry - widget mappings', async () => {
  const handler = transpilerCodegenHandlers.get('search_transformer_registry');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'widget transformer mappings',
    maxResults: 15
  });
  
  console.log(`  Should find widget-to-transformer mappings`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 3: search_html_parser
// ============================================================================

await runner.runTest('3.1: search_html_parser - AST generation', async () => {
  const handler = transpilerCodegenHandlers.get('search_html_parser');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'AST generation',
    maxResults: 10
  });
  
  console.log(`  Should find AST builder`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.2: search_html_parser - XML processing', async () => {
  const handler = transpilerCodegenHandlers.get('search_html_parser');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'XML parser',
    maxResults: 10
  });
  
  console.log(`  Should find XML parser`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_html_parser - wm- tag handling', async () => {
  const handler = transpilerCodegenHandlers.get('search_html_parser');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'wm- tag',
    maxResults: 10
  });
  
  console.log(`  Should find wm- tag handling`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 4: search_css_parser
// ============================================================================

await runner.runTest('4.1: search_css_parser - LESS parsing', async () => {
  const handler = transpilerCodegenHandlers.get('search_css_parser');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'LESS parsing',
    maxResults: 10
  });
  
  console.log(`  Should find LESS parser`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.2: search_css_parser - style extraction', async () => {
  const handler = transpilerCodegenHandlers.get('search_css_parser');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'style extraction CSS rules',
    maxResults: 10
  });
  
  console.log(`  Should find CSS rule extraction`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.3: search_css_parser - mixin handling', async () => {
  const handler = transpilerCodegenHandlers.get('search_css_parser');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'mixin handling',
    maxResults: 10
  });
  
  console.log(`  Should find mixin handling`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 5: search_template_system
// ============================================================================

await runner.runTest('5.1: search_template_system - Handlebars templates', async () => {
  const handler = transpilerCodegenHandlers.get('search_template_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'Handlebars templates',
    maxResults: 10
  });
  
  console.log(`  Should find .hbs files`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('5.2: search_template_system - template helpers', async () => {
  const handler = transpilerCodegenHandlers.get('search_template_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'template helpers',
    maxResults: 10
  });
  
  console.log(`  Should find helper functions`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('5.3: search_template_system - component templates', async () => {
  const handler = transpilerCodegenHandlers.get('search_template_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'component template',
    maxResults: 15
  });
  
  console.log(`  Should find component templates`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 6: search_build_flow
// ============================================================================

await runner.runTest('6.1: search_build_flow - build pipeline', async () => {
  const handler = transpilerCodegenHandlers.get('search_build_flow');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'build pipeline orchestration',
    maxResults: 10
  });
  
  console.log(`  Should find build orchestration`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('6.2: search_build_flow - build profiles', async () => {
  const handler = transpilerCodegenHandlers.get('search_build_flow');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'build profiles dev prod',
    maxResults: 10
  });
  
  console.log(`  Should find dev/prod configs`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('6.3: search_build_flow - output bundling', async () => {
  const handler = transpilerCodegenHandlers.get('search_build_flow');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'output bundling',
    maxResults: 10
  });
  
  console.log(`  Should find output bundling code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

