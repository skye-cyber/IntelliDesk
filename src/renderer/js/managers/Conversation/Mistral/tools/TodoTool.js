/**
 * Todo Tool - Manage a simple task list with persistence
 */
import { ToolBase } from '../ToolBase';
import { StateManager } from '../../StatesManager';

export class TodoTool extends ToolBase {
    constructor() {
        super('todo', 'Manage todos. Use action=\'read\' to view, action=\'write\' with complete list to update.');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "todo",
                description: "Manage todos. Use action='read' to view, action='write' with complete list to update.",
                parameters: {
                    type: "object",
                    properties: {
                        action: {
                            type: "string",
                            description: "Either 'read' or 'write'"
                        },
                        todos: {
                            anyOf: [
                                {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "string"
                                            },
                                            content: {
                                                type: "string"
                                            },
                                            status: {
                                                type: "string",
                                                enum: ["pending", "in_progress", "completed", "cancelled"],
                                                default: "pending"
                                            },
                                            priority: {
                                                type: "string",
                                                enum: ["low", "medium", "high"],
                                                default: "medium"
                                            }
                                        },
                                        required: ["id", "content"]
                                    }
                                },
                                {
                                    type: "null"
                                }
                            ],
                            default: null,
                            description: "Complete list of todos when writing."
                        }
                    },
                    required: ["action"]
                }
            }
        };
    }

    async _execute({ action, todos = null }, context) {
        const stateKey = this.config.state_key || 'todos';
        let currentTodos = StateManager.get(stateKey) || [];

        switch (action) {
            case 'read':
                return {
                    action: 'read',
                    todos: currentTodos,
                    total_count: currentTodos.length
                };

            case 'write':
                if (!todos || !Array.isArray(todos)) {
                    throw new Error('Todos must be provided as an array when writing');
                }

                // Validate todos
                this.validateTodos(todos);

                // Store the new todos
                StateManager.set(stateKey, todos);

                return {
                    action: 'write',
                    todos: todos,
                    total_count: todos.length,
                    message: 'Todos updated successfully'
                };

            default:
                throw new Error(`Invalid action: ${action}. Must be 'read' or 'write'`);
        }
    }

    validateTodos(todos) {
        if (!Array.isArray(todos)) {
            throw new Error('Todos must be an array');
        }

        for (const todo of todos) {
            if (!todo.id || typeof todo.id !== 'string') {
                throw new Error('Each todo must have a string id');
            }

            if (!todo.content || typeof todo.content !== 'string') {
                throw new Error('Each todo must have a string content');
            }

            // Validate status
            const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
            if (todo.status && !validStatuses.includes(todo.status)) {
                throw new Error(`Invalid status: ${todo.status}. Must be one of: ${validStatuses.join(', ')}`);
            }

            // Validate priority
            const validPriorities = ['low', 'medium', 'high'];
            if (todo.priority && !validPriorities.includes(todo.priority)) {
                throw new Error(`Invalid priority: ${todo.priority}. Must be one of: ${validPriorities.join(', ')}`);
            }
        }

        return true;
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            action: result.action,
            todos: result.todos,
            total_count: result.total_count,
            message: result.message || null,
            timestamp: new Date().toISOString()
        };
    }
}