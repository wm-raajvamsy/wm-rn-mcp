/**
 * Style & Theme Tools Tests (7 tools)
 * Tests for style definitions, class names, theme compilation, CSS transforms, and precedence
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig } from '../utils/test-helpers.js';
import { styleThemeHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎨 STYLE & THEME TOOLS TESTS (7 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_style_definitions
// ============================================================================

await runner.runTest('1.1: search_style_definitions - component=button', async () => {
  const handler = styleThemeHandlers.get('search_style_definitions');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button styles',
    component: 'button',
    extractClassNames: true,
    includeNested: true,
    maxResults: 10
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  return result.success;
});

await runner.runTest('1.2: search_style_definitions - extractClassNames=true', async () => {
  const handler = styleThemeHandlers.get('search_style_definitions');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'icon styles',
    component: 'button',
    extractClassNames: true,
    includeNested: true,
    maxResults: 5
  });
  
  console.log(`  Should extract rnStyleSelector calls`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.3: search_style_definitions - includeNested=true', async () => {
  const handler = styleThemeHandlers.get('search_style_definitions');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'nested selectors',
    extractClassNames: true,
    includeNested: true,
    maxResults: 10
  });
  
  console.log(`  Should include multi-level selectors`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 2: search_class_names
// ============================================================================

await runner.runTest('2.1: search_class_names - component=button', async () => {
  const handler = styleThemeHandlers.get('search_class_names');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'button',
    includeNested: true
  });
  
  console.log(`  Class names found: ${result.data?.classNames?.length || 0}`);
  console.log(`  Should find button-icon, button-label classes`);
  return result.success;
});

await runner.runTest('2.2: search_class_names - includeNested=true', async () => {
  const handler = styleThemeHandlers.get('search_class_names');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'button',
    includeNested: true
  });
  
  console.log(`  Should find button-icon-left patterns`);
  console.log(`  Class names found: ${result.data?.classNames?.length || 0}`);
  return result.success;
});

await runner.runTest('2.3: search_class_names - all components', async () => {
  const handler = styleThemeHandlers.get('search_class_names');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    includeNested: true
  });
  
  console.log(`  Extract all class names from all components`);
  console.log(`  Total class names: ${result.data?.classNames?.length || 0}`);
  console.log(`  Components: ${result.data?.totalComponents || 0}`);
  return result.success;
});

await runner.runTest('2.4: search_class_names - usage examples', async () => {
  const handler = styleThemeHandlers.get('search_class_names');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    includeNested: true
  });
  
  console.log(`  Should return usage examples`);
  console.log(`  Examples: ${result.data?.examples?.length || 0}`);
  return result.success && (result.data?.examples?.length || 0) > 0;
});

// ============================================================================
// Test 3: search_theme_compilation
// ============================================================================

await runner.runTest('3.1: search_theme_compilation - theme processing', async () => {
  const handler = styleThemeHandlers.get('search_theme_compilation');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'theme processing',
    maxResults: 10
  });
  
  console.log(`  Should find ThemeService`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.2: search_theme_compilation - LESS compilation', async () => {
  const handler = styleThemeHandlers.get('search_theme_compilation');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'LESS compilation',
    maxResults: 10
  });
  
  console.log(`  Should find LESS parser`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_theme_compilation - style generation', async () => {
  const handler = styleThemeHandlers.get('search_theme_compilation');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'style generation',
    maxResults: 10
  });
  
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 4: search_css_to_rn
// ============================================================================

await runner.runTest('4.1: search_css_to_rn - CSS parsing', async () => {
  const handler = styleThemeHandlers.get('search_css_to_rn');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'CSS parsing',
    maxResults: 10
  });
  
  console.log(`  Should find CSS parser implementation`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.2: search_css_to_rn - property conversion', async () => {
  const handler = styleThemeHandlers.get('search_css_to_rn');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'backgroundColor property conversion',
    maxResults: 10
  });
  
  console.log(`  Should find background-color to backgroundColor conversion`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('4.3: search_css_to_rn - unit transformation', async () => {
  const handler = styleThemeHandlers.get('search_css_to_rn');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'unit transformation px to dp',
    maxResults: 10
  });
  
  console.log(`  Should find px to dp conversion code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 5: read_theme_variables
// ============================================================================

await runner.runTest('5.1: read_theme_variables - default theme', async () => {
  const handler = styleThemeHandlers.get('read_theme_variables');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath
  });
  
  console.log(`  Should find default theme variables`);
  console.log(`  Variables found: ${result.data?.variables?.length || 0}`);
  return result.success;
});

await runner.runTest('5.2: read_theme_variables - with themeName', async () => {
  const handler = styleThemeHandlers.get('read_theme_variables');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    themeName: 'custom'
  });
  
  console.log(`  Filter to custom theme`);
  console.log(`  Variables found: ${result.data?.variables?.length || 0}`);
  return result.success;
});

await runner.runTest('5.3: read_theme_variables - color, font, spacing', async () => {
  const handler = styleThemeHandlers.get('read_theme_variables');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath
  });
  
  console.log(`  Should extract colors, fonts, spacing`);
  console.log(`  Variables found: ${result.data?.variables?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 6: search_nested_styles
// ============================================================================

await runner.runTest('6.1: search_nested_styles - component=list', async () => {
  const handler = styleThemeHandlers.get('search_nested_styles');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'list',
    maxResults: 10
  });
  
  console.log(`  Should find list-item-caption patterns`);
  console.log(`  Nested styles found: ${result.data?.styles?.length || 0}`);
  return result.success;
});

await runner.runTest('6.2: search_nested_styles - 3+ level selectors', async () => {
  const handler = styleThemeHandlers.get('search_nested_styles');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    maxResults: 15
  });
  
  console.log(`  Should find 3+ level selectors`);
  console.log(`  Nested styles found: ${result.data?.styles?.length || 0}`);
  return result.success;
});

await runner.runTest('6.3: search_nested_styles - nesting information', async () => {
  const handler = styleThemeHandlers.get('search_nested_styles');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'button',
    maxResults: 10
  });
  
  console.log(`  Should return nesting information`);
  console.log(`  Nested styles found: ${result.data?.styles?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 7: analyze_style_precedence
// ============================================================================

await runner.runTest('7.1: analyze_style_precedence - component=button', async () => {
  const handler = styleThemeHandlers.get('analyze_style_precedence');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'button'
  });
  
  console.log(`  Should show precedence order`);
  console.log(`  Precedence levels: ${result.data?.levels?.length || 0}`);
  return result.success;
});

await runner.runTest('7.2: analyze_style_precedence - precedence levels', async () => {
  const handler = styleThemeHandlers.get('analyze_style_precedence');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'button'
  });
  
  console.log(`  Should identify default, theme, user, inline levels`);
  console.log(`  Levels found: ${result.data?.levels?.length || 0}`);
  return result.success;
});

await runner.runTest('7.3: analyze_style_precedence - merge order', async () => {
  const handler = styleThemeHandlers.get('analyze_style_precedence');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath
  });
  
  console.log(`  Should show style merge order`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

