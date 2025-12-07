/**
 * Test suite for codebase tools
 * 
 * This test file validates that the core codebase tools can:
 * 1. Search for JavaScript files (not just TypeScript)
 * 2. Handle brace expansion in file patterns
 * 3. Find files in node_modules/@wavemaker paths
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { grepFiles, findFiles, listDirectory } from '../build/tools/filesystem.js';
import { 
    baseComponentHandlers,
    widgetComponentHandlers,
    variableBindingHandlers,
    fragmentPageHandlers,
    serviceHandlers
} from '../build/tools/codebase/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test paths - adjust these to your actual paths
const TEST_PATHS = {
    runtimePath: '/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/app-rn-runtime',
    codegenPath: '/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/rn-codegen'
};

console.log('\n==============================================');
console.log('🧪 CODEBASE TOOLS TEST SUITE');
console.log('==============================================\n');

// Test 1: Verify paths exist
console.log('📁 Test 1: Verify test paths exist');
console.log('------------------------------------------');

async function testPathsExist() {
    try {
        const runtimeResult = await listDirectory({ directoryPath: TEST_PATHS.runtimePath, includeHidden: false });
        const codegenResult = await listDirectory({ directoryPath: TEST_PATHS.codegenPath, includeHidden: false });
        
        console.log(`✅ Runtime path exists: ${TEST_PATHS.runtimePath}`);
        console.log(`   - Entries found: ${runtimeResult.entries?.length || 0}`);
        console.log(`✅ Codegen path exists: ${TEST_PATHS.codegenPath}`);
        console.log(`   - Entries found: ${codegenResult.entries?.length || 0}`);
        return true;
    } catch (error) {
        console.log(`❌ Path verification failed: ${error.message}`);
        return false;
    }
}

// Test 2: Test filesystem grep with brace expansion
console.log('\n📝 Test 2: Filesystem grep with brace expansion');
console.log('------------------------------------------');

async function testGrepWithBraceExpansion() {
    try {
        // Test searching for JavaScript files
        const result = await grepFiles({
            pattern: 'class.*Component',
            paths: [TEST_PATHS.runtimePath + '/components'],
            recursive: true,
            ignoreCase: false,
            includeLineNumbers: false,
            filePattern: '*.{tsx,ts,jsx,js}'
        });
        
        console.log(`Files searched: ${result.filesSearched}`);
        console.log(`Matches found: ${result.totalMatches}`);
        
        if (result.matches && result.matches.length > 0) {
            console.log(`✅ Grep with brace expansion works!`);
            console.log(`   Sample matches:`);
            result.matches.slice(0, 3).forEach(match => {
                console.log(`   - ${match.file.split('/').pop()}`);
            });
            return true;
        } else {
            console.log(`❌ No matches found - grep may not be working`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Grep test failed: ${error.message}`);
        return false;
    }
}

// Test 3: Test filesystem find with patterns
console.log('\n🔍 Test 3: Filesystem find with patterns');
console.log('------------------------------------------');

async function testFindWithPatterns() {
    try {
        // Test finding component files (with recursive pattern)
        const result = await findFiles({
            searchPath: TEST_PATHS.runtimePath + '/components',
            pattern: '**/*.component.js',  // Must use **/ for recursive search
            type: 'file',
            maxDepth: 5
        });
        
        console.log(`Files found: ${result.files?.length || 0}`);
        
        if (result.files && result.files.length > 0) {
            console.log(`✅ Find with patterns works!`);
            console.log(`   Sample files:`);
            result.files.slice(0, 3).forEach(file => {
                console.log(`   - ${file.path.split('/').pop()}`);
            });
            return true;
        } else {
            console.log(`❌ No files found - find may not be working`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Find test failed: ${error.message}`);
        return false;
    }
}

// Test 4: Test BaseComponent search tool
console.log('\n🔧 Test 4: search_base_component tool');
console.log('------------------------------------------');

async function testBaseComponentSearch() {
    try {
        const handler = baseComponentHandlers.get('search_base_component');
        if (!handler) {
            console.log('❌ Handler not found');
            return false;
        }
        
        const result = await handler({
            runtimePath: TEST_PATHS.runtimePath,
            codegenPath: TEST_PATHS.codegenPath,
            query: 'BaseComponent lifecycle',
            maxResults: 5
        });
        
        console.log(`Success: ${result.success}`);
        console.log(`Files found: ${result.data?.files?.length || 0}`);
        console.log(`Total found: ${result.meta?.totalFound || 0}`);
        console.log(`Execution time: ${result.meta?.executionTimeMs}ms`);
        
        if (result.success && result.data?.files && result.data.files.length > 0) {
            console.log(`✅ BaseComponent search works!`);
            console.log(`   Sample files:`);
            result.data.files.slice(0, 3).forEach(file => {
                console.log(`   - ${file.path.split('/').pop()} (${file.lineCount} lines)`);
            });
            return true;
        } else {
            console.log(`❌ No files found - tool may not be working`);
            console.log(`   Error: ${result.error || 'Unknown'}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ BaseComponent search failed: ${error.message}`);
        console.log(error.stack);
        return false;
    }
}

// Test 5: Test list_all_widgets tool
console.log('\n🔧 Test 5: list_all_widgets tool');
console.log('------------------------------------------');

async function testListAllWidgets() {
    try {
        const handler = widgetComponentHandlers.get('list_all_widgets');
        if (!handler) {
            console.log('❌ Handler not found');
            return false;
        }
        
        const result = await handler({
            runtimePath: TEST_PATHS.runtimePath,
            codegenPath: TEST_PATHS.codegenPath,
            category: 'all'
        });
        
        console.log(`Success: ${result.success}`);
        console.log(`Widgets found: ${result.data?.widgets?.length || 0}`);
        console.log(`Execution time: ${result.meta?.executionTimeMs}ms`);
        
        if (result.success && result.data?.widgets && result.data.widgets.length > 0) {
            console.log(`✅ List all widgets works!`);
            console.log(`   Sample widgets:`);
            result.data.widgets.slice(0, 3).forEach(widget => {
                console.log(`   - ${widget.name} (${widget.category})`);
            });
            return true;
        } else {
            console.log(`❌ No widgets found - tool may not be working`);
            console.log(`   Error: ${result.error || 'Unknown'}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ List widgets failed: ${error.message}`);
        console.log(error.stack);
        return false;
    }
}

// Test 6: Test search_widget_by_name tool
console.log('\n🔧 Test 6: search_widget_by_name tool');
console.log('------------------------------------------');

async function testSearchWidgetByName() {
    try {
        const handler = widgetComponentHandlers.get('search_widget_by_name');
        if (!handler) {
            console.log('❌ Handler not found');
            return false;
        }
        
        const result = await handler({
            runtimePath: TEST_PATHS.runtimePath,
            codegenPath: TEST_PATHS.codegenPath,
            widgetName: 'button',
            maxResults: 5
        });
        
        console.log(`Success: ${result.success}`);
        console.log(`Files found: ${result.data?.files?.length || 0}`);
        console.log(`Execution time: ${result.meta?.executionTimeMs}ms`);
        
        if (result.success && result.data?.files && result.data.files.length > 0) {
            console.log(`✅ Search widget by name works!`);
            console.log(`   Sample files:`);
            result.data.files.slice(0, 3).forEach(file => {
                console.log(`   - ${file.path.split('/').pop()}`);
            });
            return true;
        } else {
            console.log(`❌ No files found - tool may not be working`);
            console.log(`   Error: ${result.error || 'Unknown'}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Widget search failed: ${error.message}`);
        console.log(error.stack);
        return false;
    }
}

// Test 7: Test search_variable_system tool
console.log('\n🔧 Test 7: search_variable_system tool');
console.log('------------------------------------------');

async function testSearchVariableSystem() {
    try {
        const handler = variableBindingHandlers.get('search_variable_system');
        if (!handler) {
            console.log('❌ Handler not found');
            return false;
        }
        
        const result = await handler({
            runtimePath: TEST_PATHS.runtimePath,
            codegenPath: TEST_PATHS.codegenPath,
            query: 'BaseVariable',
            variableType: 'all',
            maxResults: 5
        });
        
        console.log(`Success: ${result.success}`);
        console.log(`Files found: ${result.data?.files?.length || 0}`);
        console.log(`Execution time: ${result.meta?.executionTimeMs}ms`);
        
        if (result.success && result.data?.files && result.data.files.length > 0) {
            console.log(`✅ Search variable system works!`);
            console.log(`   Sample files:`);
            result.data.files.slice(0, 3).forEach(file => {
                console.log(`   - ${file.path.split('/').pop()}`);
            });
            return true;
        } else {
            console.log(`❌ No files found - tool may not be working`);
            console.log(`   Error: ${result.error || 'Unknown'}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Variable search failed: ${error.message}`);
        console.log(error.stack);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const results = [];
    
    results.push(await testPathsExist());
    results.push(await testGrepWithBraceExpansion());
    results.push(await testFindWithPatterns());
    results.push(await testBaseComponentSearch());
    results.push(await testListAllWidgets());
    results.push(await testSearchWidgetByName());
    results.push(await testSearchVariableSystem());
    
    console.log('\n==============================================');
    console.log('📊 TEST SUMMARY');
    console.log('==============================================');
    
    const passed = results.filter(r => r).length;
    const failed = results.filter(r => !r).length;
    
    console.log(`Total tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Check output above for details.');
    }
    
    console.log('\n==============================================\n');
    
    process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
    console.error('\n❌ Test suite crashed:', error);
    process.exit(1);
});

