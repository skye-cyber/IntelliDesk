/**
 * Todo Tool - Manage a simple task list with persistence
 */
import { ToolBase } from '../ToolBase';
import { StateManager } from '../../managers/StatesManager';
import type { Todo } from '../../../main/utils/SessionManager';


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

    async _execute(params: any, context) {
        const { action, todos = null } = params
        let currentTodos: Todo[] | null = StateManager.get('todoList') || [];
        const metadata = window.desk.api.getmetadata()
        let sessionId = metadata ? metadata.sessionId : null
        // const session: Session = window.desk.sessionmanager.read(sessionId as string) as Session
        if (sessionId && (!currentTodos || currentTodos.length === 0)) {
            const TodoList = window.desk.sessionmanager.read_todo(sessionId)
            if (TodoList) {
                currentTodos = TodoList
            }
        }

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
                StateManager.set('todoList', todos);

                if (sessionId) window.desk.sessionmanager.update_todo(sessionId, todos)

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

    validateTodos(todos: Todo[]) {
        if (!Array.isArray(todos)) {
            throw new Error('Todos must be an array');
        }

        for (const todo of todos) {
            if (!todo.id || typeof todo.id !== 'string') {
                throw new Error('Each todo must have a string id');
            }

            if (!todo.title || typeof todo.title !== 'string') {
                throw new Error('Each todo must have a string title');
            }

            if (!todo.status || typeof todo.status !== 'string') {
                throw new Error('Each todo must have a string status');
            }

            // Validate status
            const validStatuses = ['pending', 'in_progress', 'failed', 'completed', 'cancelled'];
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
            //tool: this.name,
            action: result.action,
            todos: result.todos,
            total_count: result.total_count,
            message: result.message || null,
            timestamp: new Date().toISOString()
        } as any;
    }
}
