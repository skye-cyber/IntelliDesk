import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Diagram } from './components/DiagramUI/diagram';
import { UserMessage, AiMessage } from './components/ConversationRenderer/Renderer';
import { ConversationItem } from './components/Chat/ConversationItem';
import { FileItem } from './components/DropZone/dropzone';
import { LoadingAnimation } from './components/StatusUI/StatusUI';
import ToolResponse from './components/Chat/ToolResponse';
import ToolErrorHandler from './components/Chat/ToolErrorHandler';
import ToolCallDisplay from './components/Chat/ToolCallDisplay';
import { ResponseWrapper } from './components/ConversationRenderer/Renderer';

const streamingComponentRegistry = {
    Diagram,
    UserMessage,
    AiMessage,
    LoadingAnimation,
    ConversationItem,
    FileItem,
    ToolResponse,
    ToolErrorHandler,
    ToolCallDisplay,
    ResponseWrapper
};

export const StreamingPortalContainer = () => {
    const [streamingPortals, setStreamingPortals] = useState(new Map());
    const portalDataRef = useRef(new Map());

    useEffect(() => {
        const handleStreamCreate = (event) => {
            const { portalId, componentType, containerId, props, controller } = event.detail;

            portalDataRef.current.set(portalId, {
                componentType,
                containerId,
                props: { ...props },
                data: [],
                componentChildren: [], // Initialize children array
                controller
            });

            setStreamingPortals(prev => {
                const newMap = new Map(prev);
                newMap.set(portalId, {
                    id: portalId,
                    componentType,
                    containerId,
                    props: { ...props },
                    version: 0
                });
                return newMap;
            });
        };

        const handleStreamUpdate = (event) => {
            const { portalId, props } = event.detail;
            const pid = typeof (portalId) === 'string' ? portalId : portalId?.id;

            if (portalDataRef.current.has(pid)) {
                const portalData = portalDataRef.current.get(pid);
                portalData.props = { ...portalData.props, ...props };

                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    if (newMap.has(pid)) {
                        const portal = newMap.get(pid);
                        newMap.set(pid, {
                            ...portal,
                            props: portalData.props,
                            version: portal.version + 1
                        });
                    }
                    return newMap;
                });
            }
        };

        const handleStreamAppend = (event) => {
            const { portalId, data, options = {} } = event.detail;
            const pid = typeof portalId === 'string' ? portalId : portalId?.id || portalId;

            if (!portalDataRef.current.has(pid)) {
                console.warn('❌ Portal not found for append:', pid);
                return;
            }

            const portalData = portalDataRef.current.get(pid);
            const {
                mergeStrategy = 'auto',
                target = 'auto',
                replace = { target_props: [], repvalues: [] }
            } = options;

            const finalTarget = target === 'auto' ?
                (data.actual_response !== undefined ? 'props' : 'streamData') :
                target;

            const finalMergeStrategy = mergeStrategy === 'auto' ?
                (finalTarget === 'props' ? 'update' : 'append') :
                mergeStrategy;

            if (finalTarget === 'props') {
                handlePropsUpdate(portalData, data, finalMergeStrategy, replace);
            } else {
                handleStreamDataAppend(portalData, data, finalMergeStrategy);
            }

            setStreamingPortals(prev => {
                const newMap = new Map(prev);
                if (newMap.has(pid)) {
                    const portal = newMap.get(pid);
                    newMap.set(pid, {
                        ...portal,
                        version: portal.version + 1,
                        lastUpdate: Date.now()
                    });
                }
                return newMap;
            });
        };

        const handlePropsUpdate = (portalData, newData, strategy, replace) => {
            switch (strategy) {
                case 'update':
                    portalData.props = mergeProps(portalData.props, newData);
                    break;
                case 'replace':
                    portalData.props = { ...newData };
                    break;
                case 'append':
                    portalData.props = appendProps(portalData.props, newData, replace);
                    break;
                default:
                    console.warn(`Unknown merge strategy: ${strategy}`);
            }
        };

        const handleStreamDataAppend = (portalData, newData, strategy) => {
            if (!Array.isArray(portalData.streamData)) {
                portalData.streamData = [];
            }

            switch (strategy) {
                case 'append':
                    portalData.streamData = [...portalData.streamData, newData];
                    break;
                case 'update':
                    if (portalData.streamData.length > 0) {
                        const lastIndex = portalData.streamData.length - 1;
                        portalData.streamData[lastIndex] = {
                            ...portalData.streamData[lastIndex],
                            ...newData
                        };
                    } else {
                        portalData.streamData = [newData];
                    }
                    break;
                case 'replace':
                    portalData.streamData = [newData];
                    break;
            }
        };

        const mergeProps = (currentProps, newProps) => {
            const merged = { ...currentProps };

            for (const [key, value] of Object.entries(newProps)) {
                if (value === undefined || value === null) continue;

                if (key === 'actual_response' && currentProps.actual_response) {
                    merged.actual_response = currentProps.actual_response + value;
                } else if (key === 'think_content') {
                    merged.think_content = value;
                } else if (key === 'isThinking') {
                    merged.isThinking = value;
                } else if (key === 'conversation_name' && !currentProps.conversation_name) {
                    merged.conversation_name = value;
                } else {
                    merged[key] = value;
                }
            }

            return merged;
        };

        const appendProps = (currentProps, newData, replace) => {
            const updated = { ...currentProps };

            for (const [key, value] of Object.entries(newData)) {
                if (value === undefined || value === null) continue;

                if (typeof currentProps[key] === 'string' && typeof value === 'string') {
                    let data = (currentProps[key] || '') + value;

                    if (replace && replace.target_props && replace.target_props.includes(key) && replace.repvalues && replace.repvalues.length > 0) {
                        replace.repvalues.forEach(replacement => {
                            data = data.replace(replacement.pattern, replacement.repl);
                        });
                    }

                    updated[key] = data;
                } else {
                    updated[key] = value;
                }
            }

            return updated;
        };

        const handleStreamClose = (event) => {
            const { portalId, prefix } = event.detail;

            if (prefix) {
                const portalsToRemove = [];

                portalDataRef.current.forEach((value, key) => {
                    if (key.startsWith(portalId)) {
                        portalsToRemove.push(key);
                    }
                });

                portalsToRemove.forEach(id => {
                    portalDataRef.current.delete(id);
                });

                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    portalsToRemove.forEach(id => {
                        newMap.delete(id);
                    });
                    return newMap;
                });

            } else {
                portalDataRef.current?.delete(portalId?.id);
                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    newMap?.delete(portalId);
                    return newMap;
                });
            }
        };

        // FIXED: Handle component append events
        const handleComponentAppend = (event) => {
            const { portalId, componentType, componentProps, options = {} } = event.detail;
            const pid = typeof portalId === 'string' ? portalId : portalId?.id || portalId;

            if (!portalDataRef.current.has(pid)) {
                console.warn('❌ Portal not found for component append:', pid);
                return;
            }

            const portalData = portalDataRef.current.get(pid);
            const {
                mergeStrategy = 'append',
                target = 'componentChildren',
                position = 'append' // 'append', 'prepend', 'insertAt'
            } = options;

            //console.log("🔄 Appending component:", { pid, componentType, target, position });

            // Handle different append strategies
            switch (target) {
                case 'componentChildren':
                    // Append component as a child of the main component
                    if (!portalData.componentChildren) {
                        portalData.componentChildren = [];
                    }

                    const newChild = {
                        componentType,
                        componentProps,
                        id: `${pid}-child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: Date.now()
                    };

                    if (position === 'prepend') {
                        portalData.componentChildren.unshift(newChild);
                    } else if (position === 'insertAt' && options.index !== undefined) {
                        portalData.componentChildren.splice(options.index, 0, newChild);
                    } else {
                        portalData.componentChildren.push(newChild);
                    }
                    break;

                case 'props':
                    // Append component as a prop (e.g., children prop)
                    if (!portalData.props.children) {
                        portalData.props.children = [];
                    }

                    const Component = streamingComponentRegistry[componentType];
                    if (Component) {
                        const childElement = React.createElement(Component, {
                            key: `${pid}-prop-child-${Date.now()}`,
                            ...componentProps
                        });

                        if (Array.isArray(portalData.props.children)) {
                            portalData.props.children = [...portalData.props.children, childElement];
                        } else {
                            portalData.props.children = [portalData.props.children, childElement];
                        }
                    }
                    break;

                default:
                    console.warn(`Unknown target for component append: ${target}`);
                    return;
            }

            // Force React update
            setStreamingPortals(prev => {
                const newMap = new Map(prev);
                if (newMap.has(pid)) {
                    const portal = newMap.get(pid);
                    newMap.set(pid, {
                        ...portal,
                        version: portal.version + 1,
                        lastUpdate: Date.now()
                    });
                }
                return newMap;
            });
        };

        // Register event listeners
        document.addEventListener('stream-data-portal-create', handleStreamCreate);
        document.addEventListener('stream-data-portal-update', handleStreamUpdate);
        document.addEventListener('stream-data-portal-append', handleStreamAppend);
        document.addEventListener('stream-data-portal-append-component', handleComponentAppend);
        document.addEventListener('stream-data-portal-close', handleStreamClose);

        return () => {
            document.removeEventListener('stream-data-portal-create', handleStreamCreate);
            document.removeEventListener('stream-data-portal-update', handleStreamUpdate);
            document.removeEventListener('stream-data-portal-append', handleStreamAppend);
            document.removeEventListener('stream-data-portal-append-component', handleComponentAppend);
            document.removeEventListener('stream-data-portal-close', handleStreamClose);
        };
    }, []);

    // FIXED: Render streaming portal with children
    const renderStreamingPortal = (portal) => {
        const Component = streamingComponentRegistry[portal.componentType];
        if (!Component) {
            console.warn(`Streaming component ${portal.componentType} not found`);
            return null;
        }

        const portalData = portalDataRef.current.get(portal.id);
        if (!portalData) return null;

        // Get component children
        const componentChildren = portalData.componentChildren || [];

        // Render child components
        const renderedChildren = componentChildren.map((child) => {
            const ChildComponent = streamingComponentRegistry[child.componentType];
            if (!ChildComponent) {
                console.warn(`Child component ${child.componentType} not found`);
                return null;
            }

            return React.createElement(ChildComponent, {
                key: child.id,
                ...child.componentProps
            });
        });

        // Combine props children with component children
        const allChildren = [
            ...(portalData.props.children ?
                (Array.isArray(portalData.props.children) ? portalData.props.children : [portalData.props.children])
                : []),
            ...renderedChildren
        ];

        // Create the main component with all children
        return React.createElement(Component, {
            key: portal.id,
            ...portalData.props,
            children: allChildren.length > 0 ? allChildren : portalData.props.children,
            streamData: portalData.data,
            onUpdate: (newProps) => portalData.controller.update(newProps),
            onAppend: (data) => portalData.controller.append(data),
        });
    };

    // Group portals by container
    const portalsByContainer = Array.from(streamingPortals.values()).reduce((acc, portal) => {
        if (!acc[portal.containerId]) {
            acc[portal.containerId] = [];
        }
        acc[portal.containerId].push(portal);
        return acc;
    }, {});

    return (
        <>
            {Object.entries(portalsByContainer).map(([containerId, portals]) => {
                const containerElement = document.querySelector(`[data-portal-container="${containerId}"]`);
                if (!containerElement) {
                    console.warn(`Container ${containerId} not found`);
                    return null;
                }

                const portalRoot = containerElement.querySelector('.data-portal-root');

                if (!portalRoot) return null;

                return ReactDOM.createPortal(
                    portals.map(renderStreamingPortal),
                    portalRoot
                );
            })}
        </>
    );
};
