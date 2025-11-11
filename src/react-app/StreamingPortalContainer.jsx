import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Diagram } from './components/DiagramUI/diagram';
import { UserMessage, AiMessage, LoadingAnimation } from './components/ConversationRenderer/Renderer';
import { ConversationItem } from './components/Chat/ConversationItem';
import { FileItem } from './components/DropZone/dropzone';

const streamingComponentRegistry = {
    Diagram,
    UserMessage,
    AiMessage,
    LoadingAnimation,
    ConversationItem,
    FileItem,
    //DropZone,
    //FilePreview
};

export const StreamingPortalContainer = () => {
    const [streamingPortals, setStreamingPortals] = useState(new Map());
    const portalDataRef = useRef(new Map()); // Store mutable data for streaming

    useEffect(() => {
        const handleStreamCreate = (event) => {
            const { portalId, componentType, containerId, props, controller } = event.detail;

            // Initialize data store for this portal
            portalDataRef.current.set(portalId, {
                componentType,
                containerId,
                props: { ...props },
                data: [], // For append operations
                controller
            });

            setStreamingPortals(prev => {
                const newMap = new Map(prev);
                newMap.set(portalId, {
                    id: portalId,
                    componentType,
                    containerId,
                    props: { ...props },
                    version: 0 // Force re-render on updates
                });
                return newMap;
            });
        };

        const handleStreamUpdate = (event) => {
            const { portalId, props } = event.detail;
            const pid = typeof (portalId) === 'string' ? portalId : portalId?.id

            if (portalDataRef.current.has(pid)) {
                const portalData = portalDataRef.current.get(pid);
                portalData.props = { ...portalData.props, ...props };

                // Force update
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

        const _handleStreamAppend_ = (event) => {
            const { portalId, data } = event.detail;
            //console.log('📝 Appending to portal:', portalId, data);

            // Handle both string portalId and object with id property
            const pid = typeof portalId === 'string' ? portalId : portalId?.id || portalId;

            if (portalDataRef.current.has(pid)) {
                const portalData = portalDataRef.current.get(pid);
                //console.log('📊 Current portal data before append:', portalData);

                // CRITICAL FIX: Ensure streamData is always an array for appending
                if (!Array.isArray(portalData.streamData)) {
                    portalData.streamData = [];
                }

                // Append the new data to the array
                const actual_response = data?.actual_response
                console.log(portalId, data)
                if (actual_response) portalData.props.actual_response += actual_response
                if(data.think_content) portalData.props.think_content = data.think_content
                    if(data.conversation_name) portalData.props.conversation_name = data.conversation_name
                portalData.streamData = [...portalData.streamData, data];

                //console.log('📊 Portal data after append:', portalData);

                // Force update
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
            } else {
                console.warn('❌ Portal not found for append:', pid);
                console.log('Available portals:', Array.from(portalDataRef.current.keys()));
            }
        }

        const handleStreamAppend = (event) => {
            const { portalId, data, options = {} } = event.detail;
            const pid = typeof portalId === 'string' ? portalId : portalId?.id || portalId;

            if (!portalDataRef.current.has(pid)) {
                //console.warn('❌ Portal not found for append:', pid);
                return;
            }

            const portalData = portalDataRef.current.get(pid);
            const {
                mergeStrategy = 'auto',
              target = 'auto'
            } = options;

            // Auto-detect based on data structure if not specified
            const finalTarget = target === 'auto' ?
            (data.actual_response !== undefined ? 'props' : 'streamData') :
            target;

            const finalMergeStrategy = mergeStrategy === 'auto' ?
            (finalTarget === 'props' ? 'update' : 'append') :
            mergeStrategy;

            /*
             * console.log(`🔄 Processing append:`, {
                portalId: pid,
                target: finalTarget,
                strategy: finalMergeStrategy,
                data
            });
            */

            // Handle based on target and strategy
            if (finalTarget === 'props') {
                handlePropsUpdate(portalData, data, finalMergeStrategy);
            } else {
                handleStreamDataAppend(portalData, data, finalMergeStrategy);
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

        // Handle props updates (current state)
        const handlePropsUpdate = (portalData, newData, strategy) => {
            switch (strategy) {
                case 'update':
                    // Merge props, handling special fields
                    portalData.props = mergeProps(portalData.props, newData);
                    break;

                case 'replace':
                    // Replace entire props
                    portalData.props = { ...newData };
                    break;

                case 'append':
                    // Append to string fields, replace others
                    portalData.props = appendProps(portalData.props, newData);
                    break;

                default:
                    console.warn(`Unknown merge strategy: ${strategy}`);
            }
        };

        // Handle stream data (historical data)
        const handleStreamDataAppend = (portalData, newData, strategy) => {
            if (!Array.isArray(portalData.streamData)) {
                portalData.streamData = [];
            }

            switch (strategy) {
                case 'append':
                    // Add to historical data array
                    portalData.streamData = [...portalData.streamData, newData];
                    break;

                case 'update':
                    // Update last item or add new
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
                    // Replace entire stream data
                    portalData.streamData = [newData];
                    break;
            }
        };

        // Smart props merging
        const mergeProps = (currentProps, newProps) => {
            const merged = { ...currentProps };

            for (const [key, value] of Object.entries(newProps)) {
                if (value === undefined || value === null) continue;

                if (key === 'actual_response' && currentProps.actual_response) {
                    // Append to existing response
                    merged.actual_response = currentProps.actual_response + value;
                } else if (key === 'think_content') {
                    // Replace think content
                    merged.think_content = value;
                } else if (key === 'isThinking') {
                    // Update thinking state
                    merged.isThinking = value;
                } else if (key === 'conversation_name' && !currentProps.conversation_name) {
                    // Set conversation name if not already set
                    merged.conversation_name = value;
                } else {
                    // Default: replace
                    merged[key] = value;
                }
            }

            return merged;
        };

        // Props appending (for chunked responses)
        const appendProps = (currentProps, newData) => {
            const updated = { ...currentProps };

            for (const [key, value] of Object.entries(newData)) {
                if (value === undefined || value === null) continue;

                if (typeof currentProps[key] === 'string' && typeof value === 'string') {
                    // Append to string fields
                    updated[key] = (currentProps[key] || '') + value;
                } else {
                    // Replace other fields
                    updated[key] = value;
                }
            }

            return updated;
        };

        const handleStreamClose = (event) => {
            const { id, prefix } = event.detail;
            const portalId = id;

            if (prefix) {
                // Remove all portals that start with this portalId as prefix
                const portalsToRemove = [];

                // Find all portal IDs that match the prefix
                portalDataRef.current.forEach((value, key) => {
                    if (key.startsWith(portalId)) {
                        portalsToRemove.push(key);
                    }
                });

                // Remove from portalDataRef
                portalsToRemove.forEach(id => {
                    portalDataRef.current.delete(id);
                });

                // Remove from streamingPortals state
                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    portalsToRemove.forEach(id => {
                        newMap.delete(id);
                    });
                    return newMap;
                });

                //console.log(`Removed ${portalsToRemove.length} portals with prefix: ${portalId}`);
            } else {
                // Original behavior - remove single portal
                portalDataRef.current?.delete(portalId);
                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    newMap?.delete(portalId);
                    return newMap;
                });
            }
        };

        // Register event listeners
        document.addEventListener('react-portal-stream-create', handleStreamCreate);
        document.addEventListener('react-portal-stream-update', handleStreamUpdate);
        document.addEventListener('react-portal-stream-append', handleStreamAppend);
        document.addEventListener('react-portal-stream-close', handleStreamClose);

        return () => {
            document.removeEventListener('react-portal-stream-create', handleStreamCreate);
            document.removeEventListener('react-portal-stream-update', handleStreamUpdate);
            document.removeEventListener('react-portal-stream-append', handleStreamAppend);
            document.removeEventListener('react-portal-stream-close', handleStreamClose);
        };
    }, []);

    const renderStreamingPortal = (portal) => {
        const Component = streamingComponentRegistry[portal.componentType];
        if (!Component) {
            console.warn(`Streaming component ${portal.componentType} not found`);
            return null;
        }

        const portalData = portalDataRef.current.get(portal.id);
        if (!portalData) return null;

        return React.createElement(Component, {
            key: portal.id,
            ...portalData.props,
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

                const portalRoot = containerElement.querySelector('.react-portal-root');

                if (!portalRoot) return null;

                return ReactDOM.createPortal(
                    portals.map(renderStreamingPortal),
                    portalRoot
                );
            })}
        </>
    );
};
