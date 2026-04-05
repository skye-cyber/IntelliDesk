export type ToolTypes = {
    Function: "function",
}

export type FunctionCall = {
    name: string;
    arguments: { [k: string]: any } | string;
};

export interface ToolCall {
    id?: string | undefined;
    type?: ToolTypes | undefined;
    function: FunctionCall;
    index?: number | undefined;
}

export type toolCalls = Array<ToolCall> | null | undefined;

export interface ToolResult {
    success: boolean,
    result: Record<any, any>
    tool: string,
    timestamp: string
}

export interface ToolError extends ToolResult {
    error: string,
    params: string,
}

export interface ToolSchema {
    type: string | "function",
    function: {
        name: string,
        description: string,
        parameters: {
            type: string | "object",
            properties: Record<any, any>,
            required: string[]
        }
    }
}

export interface ToolStat {
    totalTools: number
    availableTools: number
    toolList: Array<string>
}
