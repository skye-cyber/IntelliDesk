import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Shield,
    Terminal,
    FileText,
    Globe,
    Database,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Infinity,
    ChevronDown,
    ChevronUp,
    Copy,
    Timer
} from 'lucide-react';
import { staticPortalBridge } from '../../../core/PortalBridge.ts';
import { useDispatch, useSelector } from 'react-redux';
import {
    toggleExpanded,
    setCopied,
    addNotification
} from '../../store/uiSlice';
import {
    resolvePermissionRequest,
    addPermissionRequest
} from '../../store/toolPermissionsSlice';


interface ToolPermissionRequestProps {
    toolName: string;
    toolArgs: Record<string, any>;
    toolDescription?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    onDecision: (decision: 'allow' | 'allow_session' | 'always_allow' | 'deny' | 'always_deny') => void;
    onClose?: () => void;
    portal_id: string
}

type PermissionDecision = 'allow' | 'allow_session' | 'always_allow' | 'deny' | 'always_deny';

interface ToolConfig {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
    description: string;
}


interface ToolPermissionRequestProps {
    toolName: string;
    toolArgs: Record<string, any>;
    toolDescription?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    onDecision: (decision: 'allow' | 'allow_session' | 'always_allow' | 'deny' | 'always_deny') => void;
    onClose?: () => void;
    onTimeout?: () => void;
    /** Timeout in milliseconds, default is 30000 (30s) */
    timeoutDuration?: number;
    /** Default action when timeout expires: 'allow' | 'allow_session' | 'always_allow' | 'deny' | 'always_deny' */
    defaultAction?: 'allow' | 'allow_session' | 'always_allow' | 'deny' | 'always_deny';
    /** Whether to show the countdown timer */
    showCountdown?: boolean;
    portal_id: string;
}


const TOOL_CONFIGS: Record<string, ToolConfig> = {
    bash: {
        icon: <Terminal className="w-5 h-5" />,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        label: 'Terminal Command',
        description: 'Execute shell commands'
    },
    file_write: {
        icon: <FileText className="w-5 h-5" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'File Write',
        description: 'Write to file system'
    },
    file_read: {
        icon: <FileText className="w-5 h-5" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'File Read',
        description: 'Read file contents'
    },
    web_search: {
        icon: <Globe className="w-5 h-5" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: 'Web Search',
        description: 'Search the internet'
    },
    database: {
        icon: <Database className="w-5 h-5" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Database Access',
        description: 'Query or modify database'
    },
    default: {
        icon: <Shield className="w-5 h-5" />,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800/50',
        label: 'Tool Execution',
        description: 'Execute tool action'
    }
};

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export const ToolPermissionRequest: React.FC<ToolPermissionRequestProps> = ({
    toolName,
    toolArgs,
    toolDescription,
    severity = 'medium',
    onDecision,
    onClose,
    onTimeout,
    timeoutDuration = DEFAULT_TIMEOUT,
    defaultAction = 'allow',
    showCountdown = true,
    portal_id
}) => {
    const dispatch = useDispatch();

    //Redux selectors
    const trustedTools = useSelector((state: any) => state.toolPermissions.trustedTools);
    const settings = useSelector((state: any) => state.toolPermissions.settings);

    // Local state
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [remainingTime, setRemainingTime] = useState(timeoutDuration);
    const [isPaused, setIsPaused] = useState(false);
    const [autoApprove, _] = useState(trustedTools[toolName]);
    const [iniOk, setInitOk] = useState(false);

    // Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const remainingTimeRef = useRef<number>(timeoutDuration);
    const pausedAtRef = useRef<number | null>(null); // Track when we paused
    //     const requestIdRef = useRef<number | null>(Date.now());
    const stats = useSelector((state: any) => state.toolPermissions)

    const toolConfig = TOOL_CONFIGS[toolName] || TOOL_CONFIGS.default;

    // Format arguments for display
    const formatArgs = (args: Record<string, any>): string => {
        try {
            return JSON.stringify(args, null, 2);
        } catch {
            return String(args);
        }
    };

    const argsString = formatArgs(toolArgs);
    const shouldTruncate = argsString.length > 200;
    const displayArgs = expanded ? argsString : argsString.slice(0, 200);

    // Create request in Redux
    const request = {
        toolName,
        toolArgs,
        timeoutDuration,
        createdAt: Date.now()
    };

    // Check if tool is already trusted
    useEffect(() => {
        const trustedDecision = trustedTools[toolName];
        if (trustedDecision) {
            // Auto-apply trusted decision

            const decisionMap = {
                allow_always: 'allow',
                deny_always: 'deny'
            }
            const decision = decisionMap[trustedDecision] || trustedDecision

            // Add to history
            const request = {
                toolName,
                toolArgs,
                autoApproved: true,
                trustedDecision
            };

            dispatch(addPermissionRequest({ ...request }));

            // Auto-resolve with a slight delay for UX
            setTimeout(() => {
                onDecision(decision);
                if (trustedDecision === 'always_allow') {
                    dispatch(addNotification({
                        type: 'info',
                        message: `Tool "${toolName}" auto-approved (Always Allow)`
                    }));
                }
            }, 100);
            dispatch(resolvePermissionRequest(request))
        }
    }, [trustedTools, toolName]);

    // Cleanup timers
    const cleanupTimers = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Handle timeout execution
    const executeTimeout = useCallback(() => {
        cleanupTimers();
        setIsExiting(true);
        setTimeout(() => {
            if (onTimeout) {
                onTimeout();
            }
            handleDecision(defaultAction);
        }, 200);
    }, [cleanupTimers, defaultAction, onDecision, onTimeout, portal_id]);

    // Start timers function
    const startTimers = useCallback(() => {
        cleanupTimers();

        if (isPaused) {
            return;
        }

        const currentRemaining = remainingTimeRef.current;

        if (currentRemaining <= 0) {
            executeTimeout();
            return;
        }

        timerRef.current = setTimeout(executeTimeout, currentRemaining);

        intervalRef.current = setInterval(() => {
            // Don't update if paused - this prevents time loss
            if (isPaused) {
                return;
            }

            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, currentRemaining - elapsed);
            setRemainingTime(remaining);
            remainingTimeRef.current = remaining;

            if (remaining <= 0) {
                cleanupTimers();
            }
        }, 100);
    }, [cleanupTimers, executeTimeout, isPaused]);

    // Initialize countdown timer
    useEffect(() => {
        if (!iniOk) {
            dispatch(addPermissionRequest({ ...request }));
            setInitOk(true)
        }
        startTimers();

        return () => {
            cleanupTimers();
        };
    }, [startTimers, cleanupTimers]);

    // Update remaining time ref when timeoutDuration changes
    useEffect(() => {
        if (!isPaused) {
            remainingTimeRef.current = timeoutDuration;
            setRemainingTime(timeoutDuration);
            startTimers();
        }
    }, [timeoutDuration]);

    const handleDecision = (decision: PermissionDecision) => {
        cleanupTimers();
        setIsExiting(true);
        // Resolve in Redux
        dispatch(resolvePermissionRequest({
            toolName: toolName,
            decision
        }));

        // Add notification
        dispatch(addNotification({
            type: decision.includes('allow') ? 'success' : 'warning',
            message: `${decision.replace('_', ' ')} for tool "${toolName}"`
        }));

        setTimeout(() => onDecision(decision), 200);
        staticPortalBridge.closeComponent(portal_id)
        staticPortalBridge.closeComponent('tool_perm_request', true)
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(argsString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCancel = () => {
        cleanupTimers();
        setTimeout(() => handleDecision('deny'), 200);
        if (onClose) onClose();
    };

    // Fixed pause/resume handlers
    const handleMouseEnter = () => {
        if (!isPaused) {
            // Stop the interval from updating by setting paused state
            // But first, capture the exact remaining time at this moment
            const exactRemaining = remainingTimeRef.current;
            pausedAtRef.current = exactRemaining;

            // Clean up timers immediately to stop countdown
            cleanupTimers();

            // Set paused state
            setIsPaused(true);

            // Keep the remaining time exactly as it was
            setRemainingTime(exactRemaining);
            remainingTimeRef.current = exactRemaining;
        }
    };

    const handleMouseLeave = () => {
        if (isPaused) {
            // Resume with the exact remaining time we saved
            const timeToResume = pausedAtRef.current !== null ? pausedAtRef.current : remainingTimeRef.current;

            // Update refs with the exact time
            remainingTimeRef.current = timeToResume;
            setRemainingTime(timeToResume);

            // Unpause first, then start timers
            setIsPaused(false);

            // Clear paused reference
            pausedAtRef.current = null;

            // Start timers will be triggered by the isPaused change in useEffect
            // But we need to ensure startTimeRef is set correctly
            startTimeRef.current = Date.now();
        }
    };

    // Format remaining time for display
    const formatTime = (ms: number): string => {
        const seconds = Math.ceil(ms / 1000);
        return `${seconds}s`;
    };

    // Get action label for timeout notification
    const getTimeoutActionLabel = (): string => {
        const labels: Record<PermissionDecision, string> = {
            'allow': 'Allow Once',
            'allow_session': 'Allow This Session',
            'always_allow': 'Always Allow',
            'deny': 'Deny',
            'always_deny': 'Always Deny'
        };
        return labels[defaultAction] || 'Allow';
    };

    const severityColors = {
        low: 'border-l-green-500 dark:border-l-green-400',
        medium: 'border-l-blue-500 dark:border-l-blue-400',
        high: 'border-l-orange-500 dark:border-l-orange-400',
        critical: 'border-l-red-500 dark:border-l-red-400'
    };

    const severityBg = {
        low: 'bg-green-50/50 dark:bg-green-900/10',
        medium: 'bg-blue-50/50 dark:bg-blue-900/10',
        high: 'bg-orange-50/50 dark:bg-orange-900/10',
        critical: 'bg-red-50/50 dark:bg-red-900/10'
    };

    // Calculate progress percentage
    const progressPercentage = (remainingTime / timeoutDuration) * 100;

    if (autoApprove) return

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleCancel}
        >
            <div
                className={`relative w-full max-w-2xl transform transition-all duration-200 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Main Card */}
                <div className={`relative overflow-hidden rounded-2xl shadow-2xl border-l-4 ${severityColors[severity]} bg-white dark:bg-gray-900`}>

                    {/* Timeout Banner */}
                    {showCountdown && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-bl-lg flex items-center gap-1 z-10">
                            <Timer className="w-3 h-3" />
                            Auto-{getTimeoutActionLabel()} in {formatTime(remainingTime)}
                        </div>
                    )}

                    {/* Header */}
                    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${severityBg[severity]}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${toolConfig.bgColor} ${toolConfig.color}`}>
                                    {toolConfig.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Permission Request
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {toolConfig.label} • {toolDescription || toolConfig.description}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5 space-y-4">

                        {/* Tool Name Badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Tool
                            </span>
                            <code className="px-3 py-1 rounded-full text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                {toolName}
                            </code>
                        </div>

                        {/* Arguments Section */}
                        <div className="space-y-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Arguments
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>

                            <div className="relative group">
                                <div className={`relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 transition-all duration-300 ${expanded ? 'max-h-32 overflow-y-auto' : 'max-h-24'}`}>
                                    <pre className="p-4 text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                                        {displayArgs}
                                        {shouldTruncate && !expanded && (
                                            <span className="text-gray-400 dark:text-gray-600">...</span>
                                        )}
                                    </pre>

                                    {/* Gradient overlay when truncated */}
                                    {shouldTruncate && !expanded && (
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent pointer-events-none" />
                                    )}
                                </div>

                                {shouldTruncate && (
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        {expanded ? (
                                            <>Show less <ChevronUp className="w-3 h-3" /></>
                                        ) : (
                                            <>Show more <ChevronDown className="w-3 h-3" /></>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Pause indicator */}
                            {isPaused && showCountdown && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    Timer paused while reading
                                </div>
                            )}
                        </div>

                        {/* Security Notice */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium">Security Notice</p>
                                <p className="text-yellow-700 dark:text-yellow-300/80 mt-1">
                                    This action may modify your system or access sensitive data. Review the arguments carefully before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-3">

                            {/* Primary Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleDecision('always_allow')}
                                    className={`group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg ${defaultAction === 'always_allow'
                                        ? 'bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900'
                                        : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white hover:shadow-green-500/20'
                                        }`}
                                >
                                    <Infinity className="w-4 h-4" />
                                    <span>Always Allow</span>
                                    {defaultAction === 'always_allow' && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleDecision('allow')}
                                    className={`group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg ${defaultAction === 'allow'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white hover:shadow-blue-500/20'
                                        }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Allow Once</span>
                                    {defaultAction === 'allow' && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    )}
                                </button>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => handleDecision('allow_session')}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${defaultAction === 'allow_session'
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600 ring-1 ring-blue-500'
                                        : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                        }`}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>This Session</span>
                                </button>

                                <button
                                    onClick={() => handleDecision('deny')}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${defaultAction === 'deny'
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-400 dark:border-gray-500 ring-1 ring-gray-500'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Deny</span>
                                </button>

                                <button
                                    onClick={() => handleDecision('always_deny')}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${defaultAction === 'always_deny'
                                        ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600 ring-1 ring-red-500'
                                        : 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                                        }`}
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Always Deny</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-200 dark:bg-gray-800 w-full relative overflow-hidden">
                        <div
                            className={`h-full transition-all duration-100 ease-linear ${progressPercentage < 20
                                ? 'bg-red-500 dark:bg-red-400'
                                : progressPercentage < 50
                                    ? 'bg-yellow-500 dark:bg-yellow-400'
                                    : 'bg-blue-500 dark:bg-blue-400'
                                }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="mt-3 text-center text-xs text-gray-700 dark:text-gray-500 space-x-3">
                    <span><kbd className="px-1.5 py-0.5 rounded text-gray-500 bg-gray-200 dark:bg-gray-800 font-mono">Enter</kbd> Allow</span>
                    <span><kbd className="px-1.5 py-0.5 rounded text-gray-500 bg-gray-200 dark:bg-gray-800 font-mono">Esc</kbd> Deny</span>
                    <span><kbd className="px-1.5 py-0.5 rounded text-gray-500 bg-gray-200 dark:bg-gray-800 font-mono">A</kbd> Always Allow</span>
                    <span><kbd className="px-1.5 py-0.5 rounded text-gray-500 bg-gray-200 dark:bg-gray-800 font-mono">Space</kbd> Pause</span>
                </div>
            </div>

            {/* Keyboard handler */}
            <KeyboardHandler
                onAllow={() => handleDecision('allow')}
                onDeny={() => handleDecision('deny')}
                onAlwaysAllow={() => handleDecision('always_allow')}
                onTogglePause={() => setIsPaused(p => !p)}
            />
        </div>
    );
};

// Separate component for keyboard handling to keep main component clean
const KeyboardHandler: React.FC<{
    onAllow: () => void;
    onDeny: () => void;
    onAlwaysAllow: () => void;
    onTogglePause: () => void;
}> = ({ onAllow, onDeny, onAlwaysAllow, onTogglePause }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent handling if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    onAllow();
                    break;
                case 'Escape':
                    e.preventDefault();
                    onDeny();
                    break;
                case 'a':
                case 'A':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        onAlwaysAllow();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    onTogglePause();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onAllow, onDeny, onAlwaysAllow, onTogglePause]);

    return null;
};

// Hook for using the permission request with timeout management
export const useToolPermission = () => {
    const [pendingRequest, setPendingRequest] = useState<{
        toolName: string;
        toolArgs: Record<string, any>;
        resolve: (decision: PermissionDecision) => void;
    } | null>(null);

    const requestPermission = useCallback((toolName: string, toolArgs: Record<string, any>): Promise<PermissionDecision> => {
        return new Promise((resolve) => {
            setPendingRequest({ toolName, toolArgs, resolve });
        });
    }, []);

    const handleDecision = useCallback((decision: PermissionDecision) => {
        if (pendingRequest) {
            pendingRequest.resolve(decision);
            setPendingRequest(null);
        }
    }, [pendingRequest]);

    return {
        requestPermission,
        pendingRequest,
        handleDecision,
        isPending: !!pendingRequest
    };
};

export default ToolPermissionRequest;
