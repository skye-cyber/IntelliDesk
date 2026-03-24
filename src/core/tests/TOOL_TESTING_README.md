# 🧪 Mistral Vibe Tool Calling Test Suite

## Overview

This comprehensive test suite validates the advanced tool calling capabilities of the Mistral Vibe AI system. It simulates AI interactions without requiring actual API calls, testing complex workflows including sequential tools, iterative usage, and interleaved responses.

## Features

- **No API Dependencies**: Tests run entirely locally using mock data
- **Mistral Vibe Compatible**: Mimics exact response structure from session logs
- **Comprehensive Coverage**: Tests all tool workflow patterns
- **Visual Interface**: HTML test runner with real-time feedback
- **Detailed Reporting**: Success/failure tracking and analytics

## Test Suite Structure

```
src/renderer/js/tests/
├── ToolCallingTestSuite.js    # Core test suite (5 test scenarios)
├── runToolTests.js           # Node.js test runner
├── testRunner.html           # Browser-based test interface
└── TOOL_TESTING_README.md    # This documentation
```

## Test Scenarios

### 1. **Single Tool Call**
Tests basic tool invocation and response handling
- User request → AI analysis → Tool call → Tool response → Final answer

### 2. **Multiple Sequential Tool Calls**
Tests chained tool usage for complex tasks
- User request → Tool call 1 → Tool response 1 → Tool call 2 → Tool response 2 → Final answer

### 3. **Iterative Tool Usage**
Tests same tool called multiple times with different parameters
- User request → Tool call (param A) → Tool response → Tool call (param B) → Tool response → Final summary

### 4. **Mixed Tool Types**
Tests combination of different tools in single workflow
- User request → Search tool → Write tool → Final answer

### 5. **Error Handling**
Tests graceful error recovery and user-friendly messages
- User request → Invalid tool call → Error handling → Helpful response

## Response Structure (Mistral Vibe Format)

```json
[
  {
    "role": "user",
    "content": "User's request"
  },
  {
    "role": "assistant",
    "content": "AI's analysis",
    "tool_calls": [
      {
        "id": "unique_id",
        "index": 0,
        "function": {
          "name": "tool_name",
          "arguments": "{...}"
        },
        "type": "function"
      }
    ]
  },
  {
    "role": "tool",
    "content": "Tool response data",
    "name": "tool_name",
    "tool_call_id": "unique_id"
  },
  {
    "role": "assistant",
    "content": "Final response to user"
  }
]
```

## Usage

### Browser Testing (Recommended)

1. **Open the HTML test runner**:
   ```bash
   # From project root
   open src/renderer/js/tests/testRunner.html
   ```

2. **Run tests**:
   - Click "Run All Tests" for complete suite
   - Click individual test buttons for specific scenarios
   - View real-time progress and results

### Node.js Testing

1. **Run the test suite**:
   ```bash
   # From project root
   node src/renderer/js/tests/runToolTests.js
   ```

2. **Expected output**:
   ```
   🚀 Starting Mistral Vibe Tool Calling Test Suite
   ==============================================
   
   🧪 Running: Single Tool Call
   ✅ Single Tool Call: PASS
   
   🧪 Running: Multiple Sequential Tool Calls
   ✅ Multiple Sequential Tool Calls: PASS - 2 tool calls processed
   
   📊 TEST REPORT
   ===================================================
   ✅ PASS Single Tool Call
      Single tool call workflow completed successfully
   ✅ PASS Multiple Sequential Tool Calls
      Multiple sequential tool calls completed
   ✅ PASS Iterative Tool Usage
      Iterative tool usage (3 calls) completed
   ✅ PASS Mixed Tool Types
      Mixed tool types (search + write) completed
   ✅ PASS Error Handling
      Error handling works correctly
   
   🎯 SUMMARY: 5 passed, 0 failed
   📈 SUCCESS RATE: 100%
   ```

### Programmatic Testing

```javascript
import { ToolCallingTestSuite } from './ToolCallingTestSuite.js';

const testSuite = new ToolCallingTestSuite();
const results = await testSuite.runAllTests();

console.log(`Tests completed: ${results.passed} passed, ${results.failed} failed`);
```

## Test Results Interpretation

### ✅ PASS Status
- All workflow steps completed successfully
- Tool calls executed and returned valid responses
- Conversation history maintained correctly
- Final response generated appropriately

### ❌ FAIL Status
- Workflow interrupted or incomplete
- Tool execution failed
- Invalid response format
- Missing conversation history entries

## Advanced Features

### Conversation History Export

```javascript
const testSuite = new ToolCallingTestSuite();
await testSuite.runAllTests();

// Export full conversation history for debugging
const conversationHistory = testSuite.exportConversationHistory();
console.log(conversationHistory);
```

### Individual Test Execution

```javascript
const testSuite = new ToolCallingTestSuite();

// Run specific test
await testSuite.testSingleToolCall();
await testSuite.testMultipleSequentialTools();
await testSuite.testIterativeToolUsage();
await testSuite.testMixedToolTypes();
await testSuite.testErrorHandling();

// Get results
console.log(testSuite.testResults);
```

## Technical Details

### Tool Manager Integration
The test suite uses the actual `ToolManager` from the Mistral Vibe system:
- Real tool execution with mock data
- Actual validation and error handling
- Production-ready tool implementations

### Response Simulation
- **Tool Call IDs**: Generated with timestamp + counter
- **Response Formatting**: Matches Mistral Vibe session logs exactly
- **Error Simulation**: Tests both success and failure paths

### Safety Features
- **Max Iterations**: Prevents infinite loops
- **Error Boundaries**: Graceful error handling
- **State Validation**: Continuous integrity checks

## Development

### Adding New Tests

1. **Create test method** in `ToolCallingTestSuite.js`:
```javascript
async testNewFeature() {
    const testName = "New Feature Test";
    try {
        // Setup test scenario
        this.simulator.reset();
        this.simulator.addUserMessage("Test input");
        
        // Execute tool calls
        const toolCalls = [...];
        const assistantMsg = this.simulator.createAssistantMessageWithTools(...);
        
        // Verify results
        // ...
        
        this.testResults.push({ name: testName, status: "✅ PASS", details: "..." });
        return true;
    } catch (error) {
        this.testResults.push({ name: testName, status: "❌ FAIL", details: error.message });
        return false;
    }
}
```

2. **Add to test runner** in `testRunner.html`:
```javascript
// Add button to HTML
<button id="runNewFeatureBtn">Run New Feature Test</button>

// Add event listener
runNewFeatureBtn.addEventListener('click', () => runSpecificTest('New Feature Test'));

// Add to test array in runAllTests()
const tests = [
    ...existingTests,
    { name: 'New Feature Test', method: testSuite.testNewFeature.bind(testSuite) }
];
```

### Debugging

- **Console Output**: Detailed logging with timestamps
- **Visual Feedback**: Color-coded test results
- **History Export**: Full conversation JSON for analysis
- **Browser DevTools**: Inspect test execution in real-time

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Tool not found"
- **Solution**: Ensure tool is registered in `ToolManager`
- **Check**: Verify tool name spelling matches exactly

**Issue**: Tests hang or timeout
- **Solution**: Check for infinite loops in test logic
- **Check**: Verify max iterations are properly enforced

**Issue**: Response format mismatches
- **Solution**: Compare with session log format
- **Check**: Use `exportConversationHistory()` to inspect output

### Error Handling

The test suite includes comprehensive error handling:
- Invalid tool names
- Missing parameters
- Network timeouts (simulated)
- Response format errors

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Reset State**: Always call `simulator.reset()` before tests
3. **Validate Responses**: Check both success and error paths
4. **Document Tests**: Add clear descriptions for each test case
5. **Performance**: Keep tests focused and efficient

## Contributing

Contributions to the test suite are welcome! Please follow:
- Existing code style and patterns
- Comprehensive test coverage
- Clear documentation
- Backward compatibility

## License

This test suite is part of the Mistral Vibe project and follows the same licensing terms.

---

**🎉 Happy Testing!** The Mistral Vibe tool calling system is now fully testable without API dependencies.