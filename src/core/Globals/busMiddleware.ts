// Event Bus Middleware/Interceptor
import { EventMap } from "./types";
import { EventBus } from "./eventBus";

type Middleware = <K extends keyof EventMap>(
    event: K,
    args: EventMap[K],
    next: () => void
) => void;

class EventBusWithMiddleware extends EventBus {
    private middlewares: Middleware[] = [];

    use(middleware: Middleware): void {
        this.middlewares.push(middleware);
    }

    emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
        const execute = (index: number): void => {
            if (index >= this.middlewares.length) {
                super.emit(event, ...args);
                return;
            }

            this.middlewares[index](event, args, () => execute(index + 1));
        };

        execute(0);
    }
}

// Example middleware: logging only for specific events
const loggingMiddleware: Middleware = (event, args, next) => {
    if (event === 'sigint') {
        console.warn('[SIGINT] Intercepted!', args);
    }
    next();
};

// Usage
const bus = new EventBusWithMiddleware();
bus.use(loggingMiddleware);
