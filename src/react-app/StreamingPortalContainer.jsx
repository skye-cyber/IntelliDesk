import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Diagram } from './components/DiagramUI/diagram';
import { UserMessage, AiMessage, LoadingAnimation } from './components/ConversationRenderer/Renderer';
const streamingComponentRegistry = {
    Diagram,
    UserMessage,
    AiMessage,
    LoadingAnimation,
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

            if (portalDataRef.current.has(portalId)) {
                const portalData = portalDataRef.current.get(portalId);
                portalData.props = { ...portalData.props, ...props };

                // Force update
                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    if (newMap.has(portalId)) {
                        const portal = newMap.get(portalId);
                        newMap.set(portalId, {
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
            const { portalId, data } = event.detail;

            if (portalDataRef.current.has(portalId)) {
                const portalData = portalDataRef.current.get(portalId);

                // Handle different append strategies
                if (Array.isArray(portalData.data)) {
                    portalData.data.push(data);
                } else if (typeof portalData.data === 'object') {
                    portalData.data = { ...portalData.data, ...data };
                } else {
                    portalData.data = data;
                }

                // Force update
                setStreamingPortals(prev => {
                    const newMap = new Map(prev);
                    if (newMap.has(portalId)) {
                        const portal = newMap.get(portalId);
                        newMap.set(portalId, {
                            ...portal,
                            version: portal.version + 1,
                            lastUpdate: Date.now()
                        });
                    }
                    return newMap;
                });
            }
        };

        const handleStreamClose = (event) => {
            const { portalId } = event.detail;

            portalDataRef.current.delete(portalId);
            setStreamingPortals(prev => {
                const newMap = new Map(prev);
                newMap.delete(portalId);
                return newMap;
            });
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
