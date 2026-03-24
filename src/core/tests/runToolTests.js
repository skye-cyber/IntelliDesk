/**
 * Tool Calling Test Runner
 * Executes the comprehensive test suite for Mistral Vibe tools
 */

import { ToolCallingTestSuite } from './ToolCallingTestSuite';

/**
 * Run all tool tests and display results
 */
async function runToolTests() {
    console.log('🔧 Mistral Vibe Tool Calling Test Runner');
    console.log('======================================');
    console.log('Initializing test suite...\n');

    try {
        const testSuite = new ToolCallingTestSuite();
        const results = await testSuite.runAllTests();

        console.log('\n🎉 Test runner completed!');
        console.log('Results: {results.passed} passed, {results.failed} failed');

        if (results.failed === 0) {
            console.log('🌟 All tests passed! The tool system is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Check the details above.');
        }

        return results;

    } catch (error) {
        console.error('❌ Test runner failed:', error);
        console.error('Stack:', error.stack);
        return { passed: 0, failed: 1, total: 1, error: error.message };
    }
}

/**
 * Run tests if this file is executed directly
 */
if (typeof require !== 'undefined' && require.main === module) {
    runToolTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}

// Export for programmatic use
export { runToolTests };
