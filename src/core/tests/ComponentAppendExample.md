# Component Append Functionality - Usage Guide

## Overview

The new `appendComponentToStreamingPortal` method allows you to append React components (not just text) to existing streaming portals. This is useful for adding UI elements like tool responses, error messages, or additional information components to ongoing conversations.

## New Methods Added

### 1. `appendComponentToStreamingPortal` (PortalBridge.js)

```javascript
streamingPortalBridge.appendComponentToStreamingPortal(
    portalId, 
    componentType, 
    componentProps = {}, 
    options = {}
)
```

**Parameters:**
- `portalId`: ID of the target streaming portal
- `componentType`: Type of component to append (must be registered in streamingComponentRegistry)
- `componentProps`: Props to pass to the appended component
- `options`: Additional options
  - `position`: 'after' | 'before' | 'replace' (default: 'after')
  - `targetElement`: Specific element ID to target, or null for portal root
  - `mergeStrategy`: 'append' | 'update' | 'replace' (default: 'append')

### 2. Convenience Methods

```javascript
// Append component after the main component
streamingPortalBridge.appendComponentAfter(portalId, componentType, componentProps)

// Append component before the main component  
streamingPortalBridge.appendComponentBefore(portalId, componentType, componentProps)

// Replace main component with new component
streamingPortalBridge.replaceWithComponent(portalId, componentType, componentProps)
```

## Usage Examples

### Example 1: Adding a Tool Response Component

```javascript
// After receiving tool results, append a ToolResponse component
const toolResponsePortal = streamingPortalBridge.appendComponentToStreamingPortal(
    message_portal, // Target portal ID
    'ToolResponse', // Component type (must be registered)
    {
        toolCalls: [
            {
                toolCallId: 'call_12345',
                toolName: 'read_file',
                params: { path: '/home/user/documents' },
                result: { success: true, files: ['file1.txt', 'file2.txt'] }
            }
        ],
        finalResponse: 'Found 2 files in your documents folder.'
    },
    {
        position: 'after' // Append after the main message
    }
);
```

### Example 2: Adding an Error Component

```javascript
// When a tool fails, append an error component
streamingPortalBridge.appendComponentAfter(
    message_portal,
    'ToolErrorHandler',
    {
        error: {
            message: 'Permission denied: cannot access restricted directory',
            type: 'permission'
        },
        toolName: 'read_file',
        onRetry: () => retryToolExecution(),
        onDismiss: () => dismissError()
    }
);
```

### Example 3: Adding Multiple Components

```javascript
// Add multiple components to build a complex UI
streamingPortalBridge.appendComponentAfter(
    message_portal,
    'LoadingIndicator',
    { text: 'Processing tool results...' }
);

// Later, replace the loading indicator with results
streamingPortalBridge.replaceWithComponent(
    message_portal,
    'ToolResponse',
    { toolCalls: results, finalResponse: 'Analysis complete!' }
);
```

## Implementation Details

### StreamingPortalContainer.jsx Changes

1. **New Event Handler**: `handleComponentAppend` - Processes component append events
2. **Enhanced Rendering**: `renderStreamingPortal` now renders both main component and appended components
3. **Component Storage**: Appended components are stored in `portalData.appendedComponents` array

### PortalBridge.js Changes

1. **New Method**: `appendComponentToStreamingPortal` - Main method for appending components
2. **Convenience Methods**: `appendComponentAfter`, `appendComponentBefore`, `replaceWithComponent`

## Component Registration

Make sure your components are registered in the `streamingComponentRegistry` in `StreamingPortalContainer.jsx`:

```javascript
const streamingComponentRegistry = {
    // Existing components
    Diagram,
    UserMessage,
    AiMessage,
    LoadingAnimation,
    ConversationItem,
    FileItem,
    
    // Add your new components
    ToolResponse,
    ToolErrorHandler,
    ToolCallDisplay
};
```

## Best Practices

1. **Component Types**: Use descriptive component type names
2. **Error Handling**: Check if components are registered before appending
3. **Performance**: Limit the number of appended components to avoid performance issues
4. **Cleanup**: Remove unused components when they're no longer needed

## Debugging

If components don't appear:
1. Check if the component type is registered in `streamingComponentRegistry`
2. Verify the portal ID is correct
3. Ensure the portal exists and is active
4. Check browser console for warnings/errors

## Example: Complete Tool Integration Flow

```javascript
// 1. User asks a question that requires tools
const messagePortal = streamingPortalBridge.createStreamingPortal(
    'AiMessage', 
    'chatArea', 
    { message: 'Analyzing your request...' }
);

// 2. AI decides to use tools
streamingPortalBridge.updateProps(messagePortal.id, {
    message: 'I need to use some tools to complete your request.'
});

// 3. Tool execution starts
streamingPortalBridge.appendComponentAfter(
    messagePortal.id,
    'LoadingIndicator',
    { text: 'Executing tools...' }
);

// 4. Tools complete - show results
streamingPortalBridge.replaceWithComponent(
    messagePortal.id,
    'ToolResponse',
    {
        toolCalls: toolResults,
        finalResponse: 'Here are the results of your request:'
    }
);

// 5. Add individual tool details
toolResults.forEach(toolCall => {
    streamingPortalBridge.appendComponentAfter(
        messagePortal.id,
        'ToolCallDisplay',
        {
            toolCall: toolCall,
            isExpanded: false
        }
    );
});
```

This new functionality provides a flexible way to build complex, dynamic UIs within streaming portals by composing multiple components together.