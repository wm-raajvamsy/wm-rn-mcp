/**
 * Test Runner with Enhanced Reporting
 * Manages test execution, timeouts, and result aggregation
 */

export class TestRunner {
  constructor() {
    this.results = { passed: [], failed: [], skipped: [], errors: [] };
    this.startTime = Date.now();
  }
  
  async runTest(testName, testFn, options = {}) {
    console.log(`\n🧪 ${testName}`);
    console.log('--'.repeat(40));
    
    const testStart = Date.now();
    
    try {
      const result = await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), 
          options.timeout || 30000)
        )
      ]);
      
      const duration = Date.now() - testStart;
      
      if (result) {
        console.log(`✅ PASSED (${duration}ms)`);
        this.results.passed.push({ name: testName, duration });
      } else {
        console.log(`❌ FAILED (${duration}ms)`);
        this.results.failed.push({ name: testName, duration });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - testStart;
      console.log(`❌ ERROR: ${error.message} (${duration}ms)`);
      this.results.errors.push({ name: testName, error, duration });
      return false;
    }
  }
  
  skipTest(testName, reason) {
    console.log(`\n⏭️  ${testName}`);
    console.log(`   Skipped: ${reason}`);
    this.results.skipped.push({ name: testName, reason });
  }
  
  printSummary() {
    const total = this.results.passed.length + 
                  this.results.failed.length + 
                  this.results.errors.length;
    const passRate = total > 0 ? 
      ((this.results.passed.length / total) * 100).toFixed(1) : 0;
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total: ${total} | Passed: ${this.results.passed.length} (${passRate}%) | Failed: ${this.results.failed.length} | Errors: ${this.results.errors.length}`);
    if (this.results.skipped.length > 0) {
      console.log(`Skipped: ${this.results.skipped.length}`);
    }
    console.log(`Total Time: ${totalTime}ms`);
    
    if (this.results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.failed.forEach(t => console.log(`   - ${t.name}`));
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n💥 Error Tests:');
      this.results.errors.forEach(t => 
        console.log(`   - ${t.name}: ${t.error.message}`)
      );
    }
    
    if (this.results.skipped.length > 0) {
      console.log('\n⏭️  Skipped Tests:');
      this.results.skipped.forEach(t => 
        console.log(`   - ${t.name}: ${t.reason}`)
      );
    }
    
    return this.results.failed.length === 0 && this.results.errors.length === 0;
  }
  
  getResults() {
    return this.results;
  }
}

