/**
 * Test Script for Advanced Tool Integration Simulator
 * Demonstrates how to test different conversation paths and scenarios
 */

import { advancedToolSimulator } from './AdvancedToolIntegrationSimulator.js';
import { StateManager } from '../managers/StatesManager.js';

/**
 * Main test function
 */
async function runToolIntegrationTests() {
    console.log('🧪 Starting Advanced Tool Integration Tests\n');

    // Enable test mode
    advancedToolSimulator.enableTestMode();

    try {
        // Test 1: Basic Conversation (No Tools)
        console.log('=== Test 1: Basic Conversation ===');
        await testBasicConversation();

        // Test 2: Single Tool Call
        console.log('\n=== Test 2: Single Tool Call ===');
        await testSingleToolCall();

        // Test 3: Multiple Tool Calls
        console.log('\n=== Test 3: Multiple Tool Calls ===');
        await testMultipleToolCalls();

        // Test 4: Tool Error Handling
        console.log('\n=== Test 4: Tool Error Handling ===');
        await testToolErrorHandling();

        // Test 5: Iterative Tool Usage
        console.log('\n=== Test 5: Iterative Tool Usage ===');
        await testIterativeToolUsage();

        // Test 6: Complex Workflow with Conditional Logic
        console.log('\n=== Test 6: Complex Workflow ===');
        await testComplexWorkflow();

        // Test 7: Custom Scenario
        console.log('\n=== Test 7: Custom Scenario ===');
        await testCustomScenario();

        // Test 8: Edge Cases
        console.log('\n=== Test 8: Edge Cases ===');
        await testEdgeCases();

        // Display statistics
        console.log('\n=== Test Statistics ===');
        displayTestStatistics();

    } catch (error) {
        console.error('❌ Test suite failed:', error);
    } finally {
        // Disable test mode
        advancedToolSimulator.disableTestMode();
        console.log('\n🧪 All tests completed');
    }
}

/**
 * Test 1: Basic Conversation (No Tools)
 */
async function testBasicConversation() {
    const result = await advancedToolSimulator.simulateScenario('basic', {
        userMessage: 'What is the capital of France?',
        aiResponse: 'The capital of France is Paris. It is known for the Eiffel Tower and Louvre Museum.'
    });

    console.log('✅ Basic conversation test passed');
    console.log('   User: What is the capital of France?');
    console.log('   AI: The capital of France is Paris...');
    console.log('   Tool calls:', result.toolCalls.length);
}

/**
 * Test 2: Single Tool Call
 */
async function testSingleToolCall() {
    const result = await advancedToolSimulator.simulateScenario('single_tool', {
        userMessage: 'List files in my documents folder',
        toolName: 'read_file',
        toolParams: { path: '/home/user/documents' },
        toolResponse: {
            success: true,
            files: ['resume.pdf', 'project.txt', 'notes.md'],
            size: 3
        },
        finalAiResponse: 'I found 3 files in your documents folder: resume.pdf, project.txt, and notes.md'
    });

    console.log('✅ Single tool call test passed');
    console.log('   User: List files in my documents folder');
    console.log('   Tool: read_file');
    console.log('   Result:', result.toolCalls[0].result.files.join(', '));
    console.log('   AI Final Response:', result.finalResponse.substring(0, 50) + '...');
}

/**
 * Test 3: Multiple Tool Calls
 */
async function testMultipleToolCalls() {
    const result = await advancedToolSimulator.simulateScenario('multiple_tools', {
        userMessage: 'Analyze system performance',
        tools: [
            {
                name: 'bash',
                params: { command: 'df -h' },
                response: { success: true, disk_usage: '45%', free_space: '250GB' }
            },
            {
                name: 'bash',
                params: { command: 'free -m' },
                response: { success: true, memory_usage: '60%', free_memory: '8GB' }
            },
            {
                name: 'calculate',
                params: { expression: '250 * 0.8' },
                response: { success: true, result: 200 }
            }
        ],
        finalAiResponse: 'System analysis complete. Disk: 45% used (250GB free), Memory: 60% used (8GB free).'
    });

    console.log('✅ Multiple tool calls test passed');
    console.log('   User: Analyze system performance');
    console.log('   Tools:', result.toolCalls.map(tc => tc.toolName).join(', '));
    console.log('   Tool calls made:', result.toolCalls.length);
    console.log('   Final AI Response:', result.finalResponse.substring(0, 50) + '...');
}

/**
 * Test 4: Tool Error Handling
 */
async function testToolErrorHandling() {
    const result = await advancedToolSimulator.simulateScenario('tool_error', {
        userMessage: 'Delete system file',
        toolName: 'write_file',
        toolParams: { path: '/etc/protected/config.conf', content: 'malicious content' },
        errorResponse: {
            success: false,
            error: 'Permission denied: cannot modify protected system files',
            code: 'EACCES'
        },
        recoveryAiResponse: 'I cannot delete that file because it is a protected system file. This is for your security.'
    });

    console.log('✅ Tool error handling test passed');
    console.log('   User: Delete system file');
    console.log('   Tool: write_file (failed)');
    console.log('   Error:', result.error);
    console.log('   Recovery:', result.finalResponse.substring(0, 50) + '...');
}

/**
 * Test 5: Iterative Tool Usage
 */
async function testIterativeToolUsage() {
    const result = await advancedToolSimulator.simulateScenario('iterative_tools', {
        userMessage: 'Find and analyze all configuration files',
        initialTool: {
            name: 'bash',
            params: { command: 'find /home/user -name "*.conf" -o -name "*.config"' },
            response: {
                success: true,
                files: ['/home/user/app.conf', '/home/user/settings.config']
            }
        },
        analysisTools: [
            {
                name: 'read_file',
                params: { path: '/home/user/app.conf' },
                response: { success: true, size: 1024, lines: 25 }
            },
            {
                name: 'read_file',
                params: { path: '/home/user/settings.config' },
                response: { success: true, size: 2048, lines: 50 }
            }
        ],
        finalAiResponse: 'Found 2 configuration files: app.conf (25 lines) and settings.config (50 lines).'
    });

    console.log('✅ Iterative tool usage test passed');
    console.log('   User: Find and analyze all configuration files');
    console.log('   Initial tool: bash (find files)');
    console.log('   Analysis tools:', result.toolCalls.slice(1).map(tc => tc.toolName).join(', '));
    console.log('   Total tool calls:', result.toolCalls.length);
}

/**
 * Test 6: Complex Workflow with Conditional Logic
 */
async function testComplexWorkflow() {
    const result = await advancedToolSimulator.simulateScenario('complex_workflow', {
        userMessage: 'Perform system maintenance',
        diagnosticTools: [
            {
                name: 'bash',
                params: { command: 'df -h' },
                response: { success: true, disk_usage: '92%', free_space: '15GB' }
            },
            {
                name: 'bash',
                params: { command: 'free -m' },
                response: { success: true, memory_usage: '85%', free_memory: '2GB' }
            }
        ],
        conditionalTools: [
            {
                condition: (results) => results[0].disk_usage > '90%',
                tool: {
                    name: 'bash',
                    params: { command: 'echo "Cleaning temporary files..."' },
                    response: { success: true, cleaned: '5GB', files_deleted: 120 }
                },
                message: 'Disk usage is critical (92%), cleaning temporary files...'
            },
            {
                condition: (results) => results[1].memory_usage > '80%',
                tool: {
                    name: 'bash',
                    params: { command: 'echo "Optimizing memory usage..."' },
                    response: { success: true, optimized: '1.5GB', processes_restarted: 5 }
                },
                message: 'Memory usage is high (85%), optimizing memory...'
            }
        ],
        finalAiResponse: 'System maintenance complete. Cleaned 5GB of temporary files and optimized 1.5GB of memory.'
    });

    console.log('✅ Complex workflow test passed');
    console.log('   User: Perform system maintenance');
    console.log('   Diagnostic tools:', result.toolCalls.slice(0, 2).map(tc => tc.toolName).join(', '));
    console.log('   Conditional tools executed:', result.toolCalls.length - 2);
    console.log('   Maintenance actions:', result.finalResponse.substring(0, 50) + '...');
}

/**
 * Test 7: Custom Scenario
 */
async function testCustomScenario() {
    const result = await advancedToolSimulator.simulateScenario('custom', {
        userMessage: 'Create a report about my documents',
        steps: [
            {
                type: 'ai_response',
                content: 'Sure, let me analyze your documents and create a report.'
            },
            {
                type: 'tool_call',
                toolName: 'read_file',
                params: { path: '/home/user/documents' },
                response: {
                    success: true,
                    files: ['report1.pdf', 'report2.pdf', 'data.csv'],
                    total_size: '12MB'
                },
                aiMessage: 'Scanning documents folder...'
            },
            {
                type: 'tool_call',
                toolName: 'calculate',
                params: { expression: '12 * 1024' },
                response: { success: true, result: 12288 },
                aiMessage: 'Calculating total size in KB...'
            },
            {
                type: 'tool_call',
                toolName: 'write_file',
                params: { 
                    path: '/home/user/documents_report.txt',
                    content: 'Documents Report: 3 files, 12MB total'
                },
                response: { success: true, written: true, path: '/home/user/documents_report.txt' },
                aiMessage: 'Creating report file...'
            }
        ],
        finalResponse: 'Report created successfully! Found 3 files (12MB) in your documents folder. Report saved as documents_report.txt.'
    });

    console.log('✅ Custom scenario test passed');
    console.log('   User: Create a report about my documents');
    console.log('   Steps executed:', result.toolCalls.length + 1); // +1 for AI response
    console.log('   Tools used:', result.toolCalls.map(tc => tc.toolName).join(', '));
    console.log('   Final result:', result.finalResponse.substring(0, 50) + '...');
}

/**
 * Test 8: Edge Cases
 */
async function testEdgeCases() {
    console.log('🔍 Testing edge cases...');

    // Test empty tool response
    const emptyResult = await advancedToolSimulator.simulateScenario('single_tool', {
        userMessage: 'Test empty response',
        toolName: 'read_file',
        toolParams: { path: '/empty/folder' },
        toolResponse: { success: true, files: [] },
        finalAiResponse: 'The folder is empty.'
    });

    // Test tool with error recovery
    const errorRecoveryResult = await advancedToolSimulator.simulateScenario('tool_error', {
        userMessage: 'Test error recovery',
        toolName: 'write_file',
        toolParams: { path: '/read-only/file.txt', content: 'test' },
        errorResponse: { success: false, error: 'Read-only filesystem' },
        recoveryAiResponse: 'Cannot write to read-only filesystem. Operation aborted.'
    });

    console.log('✅ Edge cases test passed');
    console.log('   Empty response handled:', emptyResult.success);
    console.log('   Error recovery handled:', errorRecoveryResult.success === false);
}

/**
 * Display test statistics
 */
function displayTestStatistics() {
    const stats = advancedToolSimulator.getStats();
    
    console.log('📊 Test Statistics:');
    console.log('   Total scenarios tested:', stats.totalScenarios);
    console.log('   Total tool calls simulated:', stats.totalToolCalls);
    console.log('   Available tools:', stats.availableTools);
    console.log('   Tool execution stats:', JSON.stringify(stats.toolStats, null, 2));
    
    // Export conversation history for debugging
    const conversationExport = advancedToolSimulator.exportConversation();
    console.log('\n📝 Conversation history exported (available for debugging)');
}

/**
 * Run tests if this script is executed directly
 */
if (typeof window !== 'undefined') {
    // Browser/Node environment
    window.runToolIntegrationTests = runToolIntegrationTests;
} else if (typeof global !== 'undefined') {
    // Node.js environment
    global.runToolIntegrationTests = runToolIntegrationTests;
}

// Export for module usage
export { runToolIntegrationTests };

// If running as standalone script
default runToolIntegrationTests();