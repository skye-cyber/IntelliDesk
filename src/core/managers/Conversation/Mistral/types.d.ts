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
