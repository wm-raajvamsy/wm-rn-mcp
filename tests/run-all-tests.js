/**
 * Master Test Runner
 * Executes all test suites and generates comprehensive summary
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n' + '='.repeat(80));
console.log('🧪 COMPREHENSIVE TEST SUITE - ALL 35 CODEBASE TOOLS');
console.log('='.repeat(80));
console.log('\nRunning complete test suite across 7 categories...\n');

const testSuites = [
  {
    name: 'Base Component Tools (6 tools)',
    file: 'category/base-component.test.js',
    tools: 6
  },
  {
    name: 'Widget Component Tools (5 tools)',
    file: 'category/widget-component.test.js',
    tools: 5
  },
  {
    name: 'Style & Theme Tools (7 tools)',
    file: 'category/style-theme.test.js',
    tools: 7
  },
  {
    name: 'Transpiler & Codegen Tools (6 tools)',
    file: 'category/transpiler-codegen.test.js',
    tools: 6
  },
  {
    name: 'Variable & Binding Tools (5 tools)',
    file: 'category/variable-binding.test.js',
    tools: 5
  },
  {
    name: 'Fragment & Page Tools (3 tools)',
    file: 'category/fragment-page.test.js',
    tools: 3
  },
  {
    name: 'Service & DI Tools (3 tools)',
    file: 'category/service-di.test.js',
    tools: 3
  },
  {
    name: 'Integration Workflows',
    file: 'integration/workflows.test.js',
    tools: 0
  },
  {
    name: 'Edge Cases & Error Handling',
    file: 'edge-cases.test.js',
    tools: 0
  },
  {
    name: 'Performance Benchmarks',
    file: 'performance.test.js',
    tools: 0
  }
];

const results = {
  passed: [],
  failed: [],
  totalTests: 0,
  totalPassed: 0,
  totalFailed: 0,
  startTime: Date.now()
};

// Run each test suite
for (const suite of testSuites) {
  console.log('\n' + '━'.repeat(80));
  console.log(`📂 Running: ${suite.name}`);
  console.log('━'.repeat(80));
  
  const testFile = join(__dirname, suite.file);
  
  try {
    execSync(`node ${testFile}`, { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log(`\n✅ ${suite.name} - PASSED`);
    results.passed.push(suite.name);
    
  } catch (error) {
    console.log(`\n❌ ${suite.name} - FAILED`);
    results.failed.push(suite.name);
  }
}

// Calculate totals
const totalTime = Date.now() - results.startTime;
const totalSuites = testSuites.length;
const passedSuites = results.passed.length;
const failedSuites = results.failed.length;
const passRate = ((passedSuites / totalSuites) * 100).toFixed(1);

// Print final summary
console.log('\n' + '='.repeat(80));
console.log('📊 FINAL TEST SUMMARY');
console.log('='.repeat(80));
console.log(`\nTest Suites:`);
console.log(`  Total: ${totalSuites}`);
console.log(`  ✅ Passed: ${passedSuites} (${passRate}%)`);
console.log(`  ❌ Failed: ${failedSuites}`);

console.log(`\nTools Tested:`);
const totalTools = testSuites.filter(s => s.tools > 0).reduce((sum, s) => sum + s.tools, 0);
console.log(`  Total Tools: ${totalTools}/35`);
console.log(`  Coverage: ${((totalTools / 35) * 100).toFixed(1)}%`);

console.log(`\nExecution Time:`);
console.log(`  Total: ${(totalTime / 1000).toFixed(2)}s`);
console.log(`  Average per suite: ${(totalTime / totalSuites / 1000).toFixed(2)}s`);

if (failedSuites > 0) {
  console.log(`\n❌ Failed Suites:`);
  results.failed.forEach(suite => {
    console.log(`   - ${suite}`);
  });
}

console.log('\n' + '='.repeat(80));

if (failedSuites === 0) {
  console.log('🎉 ALL TEST SUITES PASSED!');
  console.log('='.repeat(80));
  console.log('\nAll 35 codebase tools have been tested successfully!');
  console.log('Test coverage includes:');
  console.log('  ✅ Unit tests for all tool categories');
  console.log('  ✅ Integration workflow tests');
  console.log('  ✅ Edge case and error handling');
  console.log('  ✅ Performance benchmarks');
  process.exit(0);
} else {
  console.log('⚠️  SOME TEST SUITES FAILED');
  console.log('='.repeat(80));
  console.log('\nPlease review the failed test suites above.');
  process.exit(1);
}

