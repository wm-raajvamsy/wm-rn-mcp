/**
 * Integration Workflow Tests
 * Tests complete workflows across multiple tools
 */

import { TestRunner } from '../utils/test-runner.js';
import { getTestConfig } from '../utils/test-helpers.js';
import { 
  widgetComponentHandlers,
  styleThemeHandlers,
  fragmentPageHandlers,
  transpilerCodegenHandlers,
  variableBindingHandlers
} from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 INTEGRATION WORKFLOW TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Workflow 1: Component Discovery to Style Application
// ============================================================================

await runner.runTest('Workflow 1.1: search_widget_by_name → read_widget_structure', async () => {
  // Step 1: Find button widget
  const searchHandler = widgetComponentHandlers.get('search_widget_by_name');
  if (!searchHandler) return false;
  
  const searchResult = await searchHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    widgetName: 'button',
    includeRelated: true
  });
  
  console.log(`  Step 1: Found ${searchResult.data?.files?.length || 0} button files`);
  
  if (!searchResult.success || !searchResult.data?.files?.[0]) {
    console.log('  ❌ Failed to find button widget');
    return false;
  }
  
  // Step 2: Read button structure
  const readHandler = widgetComponentHandlers.get('read_widget_structure');
  if (!readHandler) return false;
  
  const readResult = await readHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    filePath: searchResult.data.files[0].path,
    extractProps: true,
    extractEvents: true,
    extractStyles: true
  });
  
  console.log(`  Step 2: Read widget structure (props, events, styles)`);
  console.log(`  ✅ Complete button widget information retrieved`);
  
  return readResult.success;
});

await runner.runTest('Workflow 1.2: read_widget_structure → search_style_definitions', async () => {
  // Step 1: Get button widget
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
  
  const readResult = await readHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    filePath: searchResult.data.files[0].path,
    extractStyles: true
  });
  
  console.log(`  Step 1: Read widget structure`);
  
  // Step 2: Find style definitions
  const styleHandler = styleThemeHandlers.get('search_style_definitions');
  if (!styleHandler) return false;
  
  const styleResult = await styleHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button styles',
    component: 'button',
    extractClassNames: true,
    includeNested: true,
    maxResults: 10
  });
  
  console.log(`  Step 2: Found ${styleResult.data?.files?.length || 0} style definition files`);
  console.log(`  ✅ Widget structure and styles linked`);
  
  return styleResult.success;
});

await runner.runTest('Workflow 1.3: search_style_definitions → search_class_names', async () => {
  // Step 1: Find button style definitions
  const styleDefHandler = styleThemeHandlers.get('search_style_definitions');
  if (!styleDefHandler) return false;
  
  const styleDefResult = await styleDefHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'button',
    component: 'button',
    extractClassNames: true,
    includeNested: true,
    maxResults: 5
  });
  
  console.log(`  Step 1: Found button style definitions`);
  
  // Step 2: Extract all class names
  const classNameHandler = styleThemeHandlers.get('search_class_names');
  if (!classNameHandler) return false;
  
  const classNameResult = await classNameHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    component: 'button',
    includeNested: true
  });
  
  console.log(`  Step 2: Extracted ${classNameResult.data?.classNames?.length || 0} class names`);
  console.log(`  ✅ Complete button styling information available`);
  
  return classNameResult.success;
});

// ============================================================================
// Workflow 2: Page Creation Flow
// ============================================================================

await runner.runTest('Workflow 2.1: search_fragment_system → search_page_structure', async () => {
  // Step 1: Understand fragment system
  const fragmentHandler = fragmentPageHandlers.get('search_fragment_system');
  if (!fragmentHandler) return false;
  
  const fragmentResult = await fragmentHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'BaseFragment page lifecycle',
    maxResults: 10
  });
  
  console.log(`  Step 1: Found ${fragmentResult.data?.files?.length || 0} fragment system files`);
  
  // Step 2: Understand page structure
  const pageHandler = fragmentPageHandlers.get('search_page_structure');
  if (!pageHandler) return false;
  
  const pageResult = await pageHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'page lifecycle structure',
    maxResults: 10
  });
  
  console.log(`  Step 2: Found ${pageResult.data?.files?.length || 0} page structure files`);
  console.log(`  ✅ Page creation foundation understood`);
  
  return fragmentResult.success && pageResult.success;
});

await runner.runTest('Workflow 2.2: search_page_structure → search_transpiler_engine', async () => {
  // Step 1: Understand page structure
  const pageHandler = fragmentPageHandlers.get('search_page_structure');
  if (!pageHandler) return false;
  
  const pageResult = await pageHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'page structure',
    maxResults: 5
  });
  
  console.log(`  Step 1: Analyzed page structure`);
  
  // Step 2: Understand transpilation
  const transpilerHandler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!transpilerHandler) return false;
  
  const transpilerResult = await transpilerHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'markup to JSX conversion',
    phase: 'all',
    maxResults: 10
  });
  
  console.log(`  Step 2: Found ${transpilerResult.data?.files?.length || 0} transpiler files`);
  console.log(`  ✅ Page structure and transpilation linked`);
  
  return transpilerResult.success;
});

await runner.runTest('Workflow 2.3: search_transpiler_engine → search_template_system', async () => {
  // Step 1: Understand transpiler
  const transpilerHandler = transpilerCodegenHandlers.get('search_transpiler_engine');
  if (!transpilerHandler) return false;
  
  const transpilerResult = await transpilerHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'code generation',
    phase: 'generate',
    maxResults: 5
  });
  
  console.log(`  Step 1: Analyzed transpiler`);
  
  // Step 2: Find templates
  const templateHandler = transpilerCodegenHandlers.get('search_template_system');
  if (!templateHandler) return false;
  
  const templateResult = await templateHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'page templates',
    maxResults: 10
  });
  
  console.log(`  Step 2: Found ${templateResult.data?.files?.length || 0} template files`);
  console.log(`  ✅ Complete page generation pipeline understood`);
  
  return templateResult.success;
});

// ============================================================================
// Workflow 3: Variable Binding Flow
// ============================================================================

await runner.runTest('Workflow 3.1: search_variable_system → search_binding_mechanism', async () => {
  // Step 1: Understand variable system
  const variableHandler = variableBindingHandlers.get('search_variable_system');
  if (!variableHandler) return false;
  
  const variableResult = await variableHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'LiveVariable ServiceVariable',
    variableType: 'all',
    maxResults: 10
  });
  
  console.log(`  Step 1: Found ${variableResult.data?.files?.length || 0} variable system files`);
  
  // Step 2: Understand binding mechanism
  const bindingHandler = variableBindingHandlers.get('search_binding_mechanism');
  if (!bindingHandler) return false;
  
  const bindingResult = await bindingHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'data binding two-way',
    maxResults: 10
  });
  
  console.log(`  Step 2: Found ${bindingResult.data?.files?.length || 0} binding files`);
  console.log(`  ✅ Variable and binding system connected`);
  
  return variableResult.success && bindingResult.success;
});

await runner.runTest('Workflow 3.2: search_binding_mechanism → search_watcher_system', async () => {
  // Step 1: Understand binding
  const bindingHandler = variableBindingHandlers.get('search_binding_mechanism');
  if (!bindingHandler) return false;
  
  const bindingResult = await bindingHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'property binding',
    maxResults: 5
  });
  
  console.log(`  Step 1: Analyzed binding mechanism`);
  
  // Step 2: Understand watchers
  const watcherHandler = variableBindingHandlers.get('search_watcher_system');
  if (!watcherHandler) return false;
  
  const watcherResult = await watcherHandler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'watch digest cycle',
    maxResults: 10
  });
  
  console.log(`  Step 2: Found ${watcherResult.data?.files?.length || 0} watcher files`);
  console.log(`  ✅ Complete binding lifecycle understood`);
  
  return watcherResult.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

