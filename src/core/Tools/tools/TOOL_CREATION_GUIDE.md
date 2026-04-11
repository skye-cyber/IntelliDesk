# Creating a Custom Tool for the AI Agent

This guide explains how to build a new tool that conforms to the expected structure, based on the `SearchWebTool` example. All tools must extend `ToolBase` and implement its core methods.

## File Structure

Every tool lives in its own `.ts` (or `.js`) file inside the tools directory. Example:
```bash
src/tools/SearchWebTool.ts
src/tools/YourNewTool.ts
```

## Step-by-Step Implementation

### 1. Import dependencies and `ToolBase`

```typescript
import { ToolBase } from '../ToolBase';
//...  any other libraries you need
```

### 2. Define the class and constructor

```typescript
export class YourNewTool extends ToolBase {
    constructor() {
        // Tool name and description – used by the AI to decide when to call it
        super('your_tool_name', 'A brief description of what the tool does');
    }
}
```
### 3. Implement defineSchema()
This returns a JSON Schema describing the function's parameters. The AI uses this to generate valid calls.
```typescript
defineSchema() {
    return {
        type: "function",
        function: {
            name: "your_tool_name",          // must match constructor name
            description: "Detailed description. The AI reads this.",
            parameters: {
                type: "object",
                properties: {
                    param1: {
                        type: "string",
                        description: "What param1 does"
                    },
                    param2: {
                        type: "integer",
                        description: "What param2 does",
                        default: 10
                    }
                },
                required: ["param1"]   // only list mandatory parameters
            }
        }
    };
}
```

### 4. Implement _execute(params, context)
This is where the actual work happens. It receives the validated parameters and an optional execution context.

```typescript
async _execute({ param1, param2 = 10 }, context) {
    // 1. Validate inputs (defensively)
    if (!param1 || typeof param1 !== 'string') {
        throw new Error('param1 must be a non-empty string');
    }

    // 2. Apply any limits from configuration
    const maxItems = Math.min(param2, this.config.max_items || 50);

    // 3. Perform the core logic (API call, computation, etc.)
    let resultData;
    if (this.config.some_api_url) {
        resultData = await this.callExternalApi(param1, maxItems);
    } else {
        resultData = this.generateMockData(param1, maxItems);
    }

    // 4. Return raw result object (will be passed to formatResult)
    return {
        query: param1,
        items: resultData,
        count: resultData.length,
        timestamp: new Date().toISOString()
    };
}
```
#### 5. (Optional) Implement helper methods like callExternalApi and generateMockData
These are not required by ToolBase, but they keep _execute clean.

```typescript
async callExternalApi(query: string, limit: number) {
    const response = await axios.get(this.config.some_api_url, {
        params: { q: query, num: limit },
        headers: { Authorization: `Bearer ${this.config.api_key}` },
        timeout: this.config.timeout || 10000
    });
    // Transform API response into a consistent format
    return response.data.results.map(item => ({
        id: item.id,
        title: item.title,
        content: item.body
    }));
}

generateMockData(query: string, limit: number) {
    const mock = [];
    for (let i = 1; i <= limit; i++) {
        mock.push({
            id: i,
            title: `Mock result ${i} for "${query}"`,
            content: `This is placeholder data. Configure an API to get real results.`
        });
    }
    return mock;
}
```
### 6. Implement formatResult(result)
This method standardises the output returned to the AI. It should wrap the raw result and add a success: true flag.

```typescript
formatResult(result) {
    return {
        success: true,
        query: result.query,
        items: result.items,
        count: result.count,
        timestamp: result.timestamp
    };
}
```
| Why formatResult? The AI often expects a predictable shape. It also allows you to strip out internal fields before sending the result back to the model.

## Configuration
Your tool can access runtime configuration via this.config. The parent ToolBase should inject a config object (e.g., from environment variables or a settings file). Typical config fields:
```json
{
  "max_results": 10,
  "timeout": 15000,
  "search_api_url": "https://api.example.com/search",
  "search_api_key": "your-key-here"
}
```
Inside your tool, you read them as this.config.max_results, etc.

### Error Handling
- Throw Error with a user‑friendly message when something fails.

- The base class (or the tool orchestrator) will catch the error and relay it to the AI.

- Avoid exposing internal stack traces or API keys in error messages.

```typescript
try {
    // risky operation
} catch (error) {
    throw new Error(`YourNewTool failed: ${error.message}`);
}
```

### Adding the Tool to the Agent
> Once your tool class is ready, register it with the AI agent (exact method depends on your framework). Typically:

```typescript
import { YourNewTool } from './tools/YourNewTool';

const agent = new Agent();
agent.registerTool(new YourNewTool());
agent.setConfig('your_new_tool', {
    api_key: process.env.MY_API_KEY,
    max_items: 20
});
```
### Full Example: A Weather Tool
```typescript
import { ToolBase } from '../ToolBase';
import axios from 'axios';

export class WeatherTool extends ToolBase {
    constructor() {
        super('get_weather', 'Get current weather for a city');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "get_weather",
                description: "Retrieve current weather conditions for a given city",
                parameters: {
                    type: "object",
                    properties: {
                        city: { type: "string", description: "City name" },
                        unit: { type: "string", enum: ["celsius", "fahrenheit"], default: "celsius" }
                    },
                    required: ["city"]
                }
            }
        };
    }

    async _execute({ city, unit = "celsius" }, context) {
        if (!city || city.trim().length === 0) throw new Error('City is required');

        const apiKey = this.config.weather_api_key;
        if (!apiKey) {
            // fallback to mock data
            return this.generateMockWeather(city, unit);
        }

        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
        const response = await axios.get(url, { timeout: this.config.timeout || 8000 });

        const temp = unit === 'celsius' ? response.data.current.temp_c : response.data.current.temp_f;
        return {
            city: response.data.location.name,
            temperature: temp,
            unit: unit,
            condition: response.data.current.condition.text,
            timestamp: new Date().toISOString()
        };
    }

    generateMockWeather(city: string, unit: string) {
        return {
            city: city,
            temperature: unit === 'celsius' ? 22 : 72,
            unit: unit,
            condition: 'Sunny (mock data)',
            timestamp: new Date().toISOString()
        };
    }

    formatResult(result) {
        return {
            success: true,
            city: result.city,
            temperature: `${result.temperature}°${result.unit === 'celsius' ? 'C' : 'F'}`,
            condition: result.condition,
            timestamp: result.timestamp
        };
    }
}
```

### Checklist for a Complete Tool
Extends ToolBase

- Constructor calls super(name, description)
- defineSchema() returns a valid JSON function schema
- _execute() validates parameters, uses this.config, handles errors
- Implements real API call and a mock fallback for development 
- formatResult() returns a clean, AI‑friendly object with success: true
- No hardcoded secrets – they come from this.config
- Proper async/await and error messages


