/**
 * Test Helper Utilities
 * Provides validation, path checking, and mock data generation for tests
 */

// Test result validation helpers
export function validateToolResult(result, expectations) {
  const checks = {
    hasSuccess: result.success === expectations.shouldSucceed,
    hasData: expectations.shouldSucceed ? !!result.data : true,
    hasError: !expectations.shouldSucceed ? !!result.error : true,
    hasMeta: !!result.meta && typeof result.meta.executionTimeMs === 'number',
    hasCorrectDomain: result.meta?.domain === expectations.domain
  };
  
  return {
    passed: Object.values(checks).every(v => v),
    checks,
    details: {
      filesFound: result.data?.files?.length || 0,
      executionTime: result.meta?.executionTimeMs || 0
    }
  };
}

// Path existence checker
export async function validatePaths(paths) {
  const { listDirectory } = await import('../../build/tools/filesystem.js');
  const results = {};
  
  for (const [name, path] of Object.entries(paths)) {
    try {
      await listDirectory({ directoryPath: path, includeHidden: false });
      results[name] = { exists: true, path };
    } catch (error) {
      results[name] = { exists: false, path, error: error.message };
    }
  }
  
  return results;
}

// Mock data generator for edge cases
export function generateMockArgs(toolName, scenario = 'default') {
  const basePaths = {
    runtimePath: process.env.TEST_RUNTIME_PATH || '/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/app-rn-runtime',
    codegenPath: process.env.TEST_CODEGEN_PATH || '/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/rn-codegen'
  };
  
  const scenarios = {
    default: basePaths,
    invalidPaths: {
      runtimePath: '/nonexistent/path',
      codegenPath: '/nonexistent/path'
    },
    emptyQuery: {
      ...basePaths,
      query: ''
    },
    longQuery: {
      ...basePaths,
      query: 'a'.repeat(1000)
    }
  };
  
  return scenarios[scenario] || scenarios.default;
}

// Test configuration
export function getTestConfig() {
  return {
    runtimePath: process.env.TEST_RUNTIME_PATH || '/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/app-rn-runtime',
    codegenPath: process.env.TEST_CODEGEN_PATH || '/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/rn-codegen',
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
    verbose: process.env.TEST_VERBOSE === 'true'
  };
}

// Assert helpers
export function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

export function assertGreaterThan(actual, threshold, message) {
  if (actual <= threshold) {
    throw new Error(`Assertion failed: ${message}\nExpected > ${threshold}, got ${actual}`);
  }
}

export function assertExists(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}\nValue does not exist`);
  }
}

