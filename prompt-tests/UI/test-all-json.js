import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fg: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  }
};

const testCases = [
  'test-cases/i1.png',
  'test-cases/i2.png',
  'test-cases/i3.png',
  'test-cases/i4.png',
  'test-cases/i5.png',
];

console.log(`${colors.fg.cyan}${colors.bright}🚀 Testing all images...${colors.reset}\n`);

const results = [];

for (const testCase of testCases) {
  console.log(`${colors.fg.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.fg.blue}Testing: ${testCase}${colors.reset}`);
  console.log(`${colors.fg.blue}${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    const output = execSync(`node test-json.js ${testCase}`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    
    results.push({
      image: testCase,
      status: 'success',
    });
    
  } catch (error) {
    console.error(`${colors.fg.red}❌ Failed: ${testCase}${colors.reset}\n`);
    results.push({
      image: testCase,
      status: 'failed',
      error: error.message,
    });
  }
  
  console.log('\n');
}

// Summary
console.log(`${colors.fg.cyan}${colors.bright}${'='.repeat(70)}${colors.reset}`);
console.log(`${colors.fg.cyan}${colors.bright}📊 SUMMARY${colors.reset}`);
console.log(`${colors.fg.cyan}${colors.bright}${'='.repeat(70)}${colors.reset}\n`);

const successCount = results.filter(r => r.status === 'success').length;
const failCount = results.filter(r => r.status === 'failed').length;

results.forEach(result => {
  const icon = result.status === 'success' ? '✅' : '❌';
  const color = result.status === 'success' ? colors.fg.green : colors.fg.red;
  console.log(`${color}${icon} ${result.image}${colors.reset}`);
});

console.log(`\n${colors.fg.cyan}Total: ${results.length} | Success: ${successCount} | Failed: ${failCount}${colors.reset}\n`);

if (successCount === results.length) {
  console.log(`${colors.fg.green}${colors.bright}🎉 All tests passed!${colors.reset}\n`);
} else {
  console.log(`${colors.fg.yellow}⚠️  Some tests failed. Review the outputs and improve the prompt.${colors.reset}\n`);
}

