# Advanced Tool Integration Simulator for IntelliDesk

## Overview

The **Advanced Tool Integration Simulator** is a comprehensive testing framework designed to simulate AI interactions with tool integration without requiring actual API calls. This allows for thorough testing of different conversation paths, error scenarios, and complex workflows while preserving API quotas.

## Features

- **Multiple Scenario Types**: Test basic conversations, single tool calls, multiple tools, error handling, iterative usage, and complex workflows
- **Conditional Logic**: Simulate AI decision-making based on tool results
- **Error Simulation**: Test error handling and recovery scenarios
- **Custom Scenarios**: Create custom test sequences with mixed AI responses and tool calls
- **Statistics Tracking**: Monitor test execution and tool usage statistics
- **Conversation Export**: Export complete conversation histories for debugging

## Installation

The simulator is already integrated into the IntelliDesk codebase. No additional installation is required.

## Usage

### Basic Setup

```javascript
import { advancedToolSimulator } from './AdvancedToolIntegrationSimulator.js';

// Enable test mode (bypasses actual API calls)
advancedToolSimulator.enableTestMode();
```

### Running Tests

The simulator provides several predefined test scenarios:

#### 1. Basic Conversation (No Tools)

```javascript
const result = await advancedToolSimulator.simulateScenario('basic', {
    userMessage: 'What is the capital of France?',
    aiResponse: 'The capital of France is Paris.'
});
```

#### 2. Single Tool Call

```javascript
const result = await advancedToolSimulator.simulateScenario('single_tool', {
    userMessage: 'List files in my documents folder',
    toolName: 'read_file',
    toolParams: { path: '/home/user/documents' },
    toolResponse: { success: true, files: ['file1.txt', 'file2.txt'] },
    finalAiResponse: 'I found 2 files in your documents folder.'
});
```

#### 3. Multiple Tool Calls

```javascript
const result = await advancedToolSimulator.simulateScenario('multiple_tools', {
    userMessage: 'Analyze system performance',
    tools: [
        { name: 'bash', params: { command: 'df -h' }, response: { disk_usage: '45%' } },
        { name: 'bash', params: { command: 'free -m' }, response: { memory_usage: '60%' } }
    ],
    finalAiResponse: 'System analysis complete.'
});
```

#### 4. Tool Error Handling

```javascript
const result = await advancedToolSimulator.simulateScenario('tool_error', {
    userMessage: 'Delete system file',
    toolName: 'write_file',
    toolParams: { path: '/protected/file.txt', content: 'test' },
    errorResponse: { success: false, error: 'Permission denied' },
    recoveryAiResponse: 'Cannot delete protected files.'
});
```

#### 5. Iterative Tool Usage

```javascript
const result = await advancedToolSimulator.simulateScenario('iterative_tools', {
    userMessage: 'Find and analyze large files',
    initialTool: {
        name: 'bash',
        params: { command: 'find /home -size +100M' },
        response: { files: ['large1.dat', 'large2.log'] }
    },
    analysisTools: [
        { name: 'read_file', params: { path: 'large1.dat' }, response: { size: 150000000 } },
        { name: 'read_file', params: { path: 'large2.log' }, response: { size: 200000000 } }
    ],
    finalAiResponse: 'Found 2 large files.'
});
```

#### 6. Complex Workflow with Conditional Logic

```javascript
const result = await advancedToolSimulator.simulateScenario('complex_workflow', {
    userMessage: 'Perform system maintenance',
    diagnosticTools: [
        { name: 'bash', params: { command: 'df -h' }, response: { disk_usage: '92%' } },
        { name: 'bash', params: { command: 'free -m' }, response: { memory_usage: '85%' } }
    ],
    conditionalTools: [
        {
            condition: (results) => results[0].disk_usage > '90%',
            tool: { name: 'bash', params: { command: 'cleanup' }, response: { cleaned: '5GB' } },
            message: 'Cleaning temporary files...'
        }
    ],
    finalAiResponse: 'System maintenance complete.'
});
```

#### 7. Custom Scenario

```javascript
const result = await advancedToolSimulator.simulateScenario('custom', {
    userMessage: 'Create a report',
    steps: [
        { type: 'ai_response', content: 'Starting report creation...' },
        { 
            type: 'tool_call', 
            toolName: 'read_file', 
            params: { path: '/data' }, 
            response: { files: ['data1.csv', 'data2.csv'] },
            aiMessage: 'Reading data files...'
        },
        { 
            type: 'tool_call', 
            toolName: 'calculate', 
            params: { expression: '100 + 200' }, 
            response: { result: 300 },
            aiMessage: 'Performing calculations...'
        }
    ],
    finalResponse: 'Report created successfully.'
});
```

### Running the Complete Test Suite

```javascript
import { runToolIntegrationTests } from './runToolIntegrationTests.js';

// Run all tests
await runToolIntegrationTests();
```

## API Reference

### `advancedToolSimulator` Methods

#### `enableTestMode()`
Enables test mode to bypass actual API calls.

#### `disableTestMode()`
Disables test mode.

#### `simulateScenario(scenarioType, customData)`
Simulates a complete conversation scenario.

- `scenarioType`: Type of scenario to simulate ('basic', 'single_tool', 'multiple_tools', 'tool_error', 'iterative_tools', 'complex_workflow', 'custom')
- `customData`: Custom data for the scenario

#### `reset()`
Resets the simulator state.

#### `getHistory()`
Returns the conversation history.

#### `getToolCallHistory()`
Returns the tool call history.

#### `getStats()`
Returns statistics about test execution.

#### `exportConversation()`
Exports the conversation history as JSON.

## Test Scenarios

### Scenario Types

| Type | Description | Use Case |
|------|-------------|----------|
| `basic` | Simple conversation without tools | Testing basic AI responses |
| `single_tool` | Single tool call | Testing individual tool integration |
| `multiple_tools` | Multiple sequential tool calls | Testing tool chaining |
| `tool_error` | Tool error handling | Testing error recovery |
| `iterative_tools` | Iterative tool usage based on results | Testing dynamic workflows |
| `complex_workflow` | Complex workflows with conditional logic | Testing decision-making |
| `custom` | Custom defined scenarios | Testing specific use cases |

## Integration with IntelliDesk

### Using in Base.js

To use the simulator in `Base.js` instead of actual API calls:

```javascript
// Instead of:
stream = await clientmanager.MistralClient.chat.stream({
    model: model_name,
    messages: window.desk.api.getHistory(true),
    max_tokens: 3000,
});

// Use:
if (StateManager.get('test_mode')) {
    const simulatorResult = await advancedToolSimulator.simulateScenario(
        'complex_workflow', 
        { /* your scenario data */ }
    );
    stream = createMockStream(simulatorResult.finalResponse);
} else {
    stream = await clientmanager.MistralClient.chat.stream({
        model: model_name,
        messages: window.desk.api.getHistory(true),
        max_tokens: 3000,
    });
}
```

## Best Practices

1. **Test Isolation**: Reset the simulator between tests to ensure clean state
2. **Scenario Coverage**: Test all scenario types to ensure comprehensive coverage
3. **Error Testing**: Include error scenarios to test robustness
4. **Statistics Monitoring**: Use `getStats()` to monitor test execution
5. **Conversation Export**: Export conversations for debugging complex issues

## Examples

### Example 1: Testing File Operations

```javascript
const fileTest = await advancedToolSimulator.simulateScenario('multiple_tools', {
    userMessage: 'Analyze my document files',
    tools: [
        {
            name: 'read_file',
            params: { path: '/documents' },
            response: { files: ['report.pdf', 'notes.txt'], size: '5MB' }
        },
        {
            name: 'calculate',
            params: { expression: '5 * 1024' },
            response: { result: 5120 }
        }
    ],
    finalAiResponse: 'Found 2 files (5MB total) in your documents folder.'
});
```

### Example 2: Testing Error Recovery

```javascript
const errorTest = await advancedToolSimulator.simulateScenario('tool_error', {
    userMessage: 'Access restricted data',
    toolName: 'read_file',
    toolParams: { path: '/restricted/data.txt' },
    errorResponse: {
        success: false,
        error: 'Access denied: insufficient permissions',
        code: 'EPERM'
    },
    recoveryAiResponse: 'I cannot access that file due to permission restrictions.'
});
```

## Debugging

### Exporting Conversations

```javascript
const conversationJson = advancedToolSimulator.exportConversation();
console.log(conversationJson);
// Or save to file
fs.writeFileSync('conversation_debug.json', conversationJson);
```

### Viewing Statistics

```javascript
const stats = advancedToolSimulator.getStats();
console.log('Test Statistics:', stats);
```

## Contributing

To add new scenario types or enhance existing ones:

1. Add new methods to the `AdvancedToolIntegrationSimulator` class
2. Update the `simulateScenario` method to handle the new type
3. Add corresponding test cases in `runToolIntegrationTests.js`
4. Update this README with documentation

## License

This software is part of the IntelliDesk project and is licensed under the same terms.

## Support

For issues or questions, please refer to the main IntelliDesk documentation or contact the development team.