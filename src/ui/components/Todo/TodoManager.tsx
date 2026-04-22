import React from 'react';
import { FiCircle, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { globalEventBus } from '../../../core/Globals/eventBus';
import { StateManager } from '../../../core/managers/StatesManager';


export type TodoStatus = 'in_progress' | 'pending' | 'completed' | 'cancelled' | 'failed';

export type TodoPriority = 'high' | 'medium' | 'low'

export interface Todo {
    id: string | number;
    title: string;
    status: TodoStatus;
    priority: TodoPriority
}

export function updateTodos(currentTodos: Todo[], payload: Todo[] | Partial<Todo> & { id: string }): Todo[] {
    if (Array.isArray(payload)) return [...payload];
    const { id, ...updates } = payload;
    const index = currentTodos.findIndex(t => t.id === id);
    if (index === -1) return currentTodos;
    const updated = [...currentTodos];
    updated[index] = { ...updated[index], ...updates };
    return updated;
}


const statusConfig: Record<TodoStatus, { icon: React.ElementType; colorLight: string; colorDark: string }> = {
    in_progress: { icon: FiCircle, colorLight: '#38bdf8', colorDark: '#7dd3fc' },      // cyber-400/300
    pending: { icon: FiClock, colorLight: '#f97316', colorDark: '#fb923c' },      // orange-500/400
    completed: { icon: FiCheckCircle, colorLight: '#22c55e', colorDark: '#4ade80' }, // green-500/400
    cancelled: { icon: FiXCircle, colorLight: '#9ca3af', colorDark: '#6b7280' },   // gray-400/500
    failed: { icon: FiAlertCircle, colorLight: '#ef4444', colorDark: '#f87171' },   // red-500/400
};

const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
    const { icon: Icon, colorLight, colorDark } = statusConfig[todo.status];
    const titleMap = {
        in_progress: 'Running',
        pending: 'Pending',
        cancelled: 'Cancelled',
        completed: 'Completed',
        failed: 'Failed'
    }
    return (
        <div className="flex items-center gap-2 py-1.5 px-1 border-b border-gray-100 dark:border-white/5 last:border-0" title={titleMap[todo.status]}>
            <Icon style={{ color: colorLight }} className={`${(todo.status === 'in_progress') ? 'animate-heartpulse' : ''} w-4 h-4 shrink-0 dark:[&>path]:stroke-current`} />
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{todo.title}</span>
        </div>
    );
};

export interface TodoManagerHandle {
    updateFullList: (todos: Todo[]) => void;
    updateSingleTodo: (updatedTodo: Partial<Todo> & { id: string }) => void;
}

interface TodoManagerProps {
    initialTodos?: Todo[];
    className?: string;
    maxHeight?: string;
}

const TodoManager = React.forwardRef<TodoManagerHandle, TodoManagerProps>(({
    initialTodos = [],
    className = '',
    maxHeight = '320px',
}, ref) => {
    const [todos, setTodos] = React.useState<Todo[]>(initialTodos);
    const [isActive, setActive] = React.useState<boolean>(false)

    const loadTodo = () => {
        const sessionId: string | null | undefined = window.desk.api.getmetadata()?.sessionId
        if (sessionId) {
            const todoList = window.desk.sessionmanager.read_todo(sessionId)
            if (todoList && todoList.length > 0) {
                setTodos(todoList)
            }
        }
    }

    React.useEffect(() => {
        if (todos.length === 0) {
            loadTodo()
        }
    }, [loadTodo])

    React.useImperativeHandle(ref, () => ({
        updateFullList: (newTodos) => setTodos(prev => updateTodos(prev, newTodos)),
        updateSingleTodo: (updated) => setTodos(prev => updateTodos(prev, updated)),
    }));

    React.useEffect(() => {
        const activateTaskMenu = globalEventBus.on('tasks:menu:toggle', () => setActive(!isActive))
        return () => activateTaskMenu.unsubscribe()
    })

    React.useEffect(() => {
        StateManager.subscribe('todoList', (newTodo: any) => setTodos(newTodo))
        const loadTodoListener = globalEventBus.on('conversation:open', loadTodo)
        return () => loadTodoListener.unsubscribe()
    })

    if (!isActive) return

    return (
        <div className='hidden md:block fixed left-10 bottom-4'>
            <section className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-2 shadow-sm w-fit max-h-42 max-w-72 overflow-y-auto scrollbar-custom">
                {(todos.length !== 0) ? (
                    <div className={`w-fit max-w-full ${className}`} style={{ maxHeight, overflowY: 'auto' }}>
                        {todos.map(todo => (
                            <TodoItem key={todo.id} todo={todo} />
                        ))}
                    </div>
                ) :
                    <div className='text-sm text-gray-600 dark:text-white italic px-1 py-2'>
                        No tasks for this chat
                    </div>
                }
            </section>
        </div>
    );
});

export default TodoManager;
TodoManager.displayName = 'TodoManager';
