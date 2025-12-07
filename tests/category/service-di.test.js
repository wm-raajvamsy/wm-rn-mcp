/**
 * Service & DI Tools Tests (3 tools)
 * Tests for runtime services, dependency injection, and service layer
 */

import { TestRunner } from '../utils/test-runner.js';
import { validateToolResult, getTestConfig } from '../utils/test-helpers.js';
import { serviceHandlers } from '../../build/tools/codebase/index.js';

const TEST_PATHS = getTestConfig();
const runner = new TestRunner();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 SERVICE & DI TOOLS TESTS (3 tools)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================================================
// Test 1: search_runtime_services
// ============================================================================

await runner.runTest('1.1: search_runtime_services - NavigationService', async () => {
  const handler = serviceHandlers.get('search_runtime_services');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'NavigationService',
    serviceName: 'NavigationService',
    maxResults: 10
  });
  
  console.log(`  Success: ${result.success}`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  console.log(`  Execution time: ${result.meta?.executionTimeMs}ms`);
  
  return result.success;
});

await runner.runTest('1.2: search_runtime_services - SecurityService', async () => {
  const handler = serviceHandlers.get('search_runtime_services');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'SecurityService',
    serviceName: 'SecurityService',
    maxResults: 10
  });
  
  console.log(`  Should find SecurityService`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.3: search_runtime_services - ModalService', async () => {
  const handler = serviceHandlers.get('search_runtime_services');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'modal service',
    serviceName: 'ModalService',
    maxResults: 10
  });
  
  console.log(`  Should find ModalService`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('1.4: search_runtime_services - all services', async () => {
  const handler = serviceHandlers.get('search_runtime_services');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'runtime services',
    maxResults: 20
  });
  
  console.log(`  Should find all runtime services`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 2: search_di_system
// ============================================================================

await runner.runTest('2.1: search_di_system - injector implementation', async () => {
  const handler = serviceHandlers.get('search_di_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'injector',
    maxResults: 10
  });
  
  console.log(`  Should find DI injector implementation`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.2: search_di_system - @Injectable decorator', async () => {
  const handler = serviceHandlers.get('search_di_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'dependency injection @Injectable',
    maxResults: 10
  });
  
  console.log(`  Should find @Injectable decorator`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('2.3: search_di_system - service resolution', async () => {
  const handler = serviceHandlers.get('search_di_system');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'service resolution',
    maxResults: 10
  });
  
  console.log(`  Should find service resolution code`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// ============================================================================
// Test 3: search_service_layer
// ============================================================================

await runner.runTest('3.1: search_service_layer - service registration', async () => {
  const handler = serviceHandlers.get('search_service_layer');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'service registration',
    maxResults: 10
  });
  
  console.log(`  Should find service registry`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.2: search_service_layer - service lifecycle', async () => {
  const handler = serviceHandlers.get('search_service_layer');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'service lifecycle management',
    maxResults: 10
  });
  
  console.log(`  Should find service lifecycle management`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

await runner.runTest('3.3: search_service_layer - singleton pattern', async () => {
  const handler = serviceHandlers.get('search_service_layer');
  if (!handler) return false;
  
  const result = await handler({
    runtimePath: TEST_PATHS.runtimePath,
    codegenPath: TEST_PATHS.codegenPath,
    query: 'singleton pattern',
    maxResults: 10
  });
  
  console.log(`  Should find singleton pattern`);
  console.log(`  Files found: ${result.data?.files?.length || 0}`);
  return result.success;
});

// Print summary
const success = runner.printSummary();
process.exit(success ? 0 : 1);

