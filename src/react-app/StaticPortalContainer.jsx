import React, { useState, useEffect } from 'react';
import { Diagram } from './components/DiagramUI/diagram';
import ReactDOM from 'react-dom';
import { UserMessage, AiMessage, LoadingAnimation } from './components/ConversationRenderer/Renderer';

const componentRegistry = {
    Diagram,
    UserMessage,
    AiMessage,
    LoadingAnimation,
};

export const StaticPortalContainer = () => {
    const [portals, setPortals] = useState([]);
    const [targetedPortals, setTargetedPortals] = useState(new Map()); // containerId -> portals[]

    useEffect(() => {
        const handleShowPortal = (event) => {
            const { portalId, componentType, props } = event.detail;

            setPortals(prev => [...prev, {
                id: portalId,
                componentType,
                props,
                containerId: 'global' // Global portal
            }]);
        };

        const handleShowTargetedPortal = (event) => {
            const { portalId, componentType, containerId, props } = event.detail;
            setTargetedPortals(prev => {
                const newMap = new Map(prev);
                const containerPortals = newMap.get(containerId) || [];
                newMap.set(containerId, [
                    ...containerPortals,
                    { id: portalId, componentType, props, containerId }
                ]);
                return newMap;
            });
        };

        const handleClosePortal = (event) => {
            const { portalId } = event.detail;

            setPortals(prev => prev.filter(portal => portal.id !== portalId));
            setTargetedPortals(prev => {
                const newMap = new Map();
                for (const [containerId, portals] of prev.entries()) {
                    newMap.set(containerId, portals.filter(p => p.id !== portalId));
                }
                return newMap;
            });
        };

        const handleCloseContainer = (event) => {
            const { containerId } = event.detail;

            setTargetedPortals(prev => {
                const newMap = new Map(prev);
                newMap.delete(containerId);
                return newMap;
            });
        };

        document.addEventListener('react-portal-show', handleShowPortal);
        document.addEventListener('react-portal-show-targeted', handleShowTargetedPortal);
        document.addEventListener('react-portal-close', handleClosePortal);
        document.addEventListener('react-portal-close-container', handleCloseContainer);

        return () => {
            document.removeEventListener('react-portal-show', handleShowPortal);
            document.removeEventListener('react-portal-show-targeted', handleShowTargetedPortal);
            document.removeEventListener('react-portal-close', handleClosePortal);
            document.removeEventListener('react-portal-close-container', handleCloseContainer);
        };
    }, []);

    const closePortal = (portalId) => {
        setPortals(prev => prev.filter(portal => portal.id !== portalId));
        setTargetedPortals(prev => {
            const newMap = new Map();
            for (const [containerId, portals] of prev.entries()) {
                newMap.set(containerId, portals.filter(p => p.id !== portalId));
            }
            return newMap;
        });
    };

    const renderPortal = (portal) => {
        const Component = componentRegistry[portal.componentType];
        if (!Component) {
            console.warn(`Component ${portal.componentType} not found`);
            return null;
        }

        console.log(portal)
        return React.createElement(Component, {
            key: portal.id,
            ...portal.props,
            onClose: () => closePortal(portal.id),
            onConfirm: portal.props.onConfirm ? (...args) => {
                portal.props.onConfirm?.(...args);
                if (!portal.props.disableAutoClose) closePortal(portal.id);
            } : () => closePortal(portal.id),
            onCancel: portal.props.onCancel ? (...args) => {
                portal.props.onCancel?.(...args);
                if (!portal.props.disableAutoClose) closePortal(portal.id);
            } : () => closePortal(portal.id),
        });
    };

    return (
        <>
            {/* Global portals (modals, loading spinners) */}
            {portals.map(renderPortal)}

            {/* Targeted portals - rendered in their respective containers via React.createPortal */}
            {Array.from(targetedPortals.entries()).map(([containerId, containerPortals]) => {
                const containerElement = document.querySelector(`[data-portal-container="${containerId}"]`);

                if (!containerElement) {
                    console.warn(`Container ${containerId} not found in DOM`);
                    return null;
                }

                console.log(containerId, containerElement)
                const portalRoot = containerElement.querySelector('.react-portal-root');
                if (!portalRoot) return null;

                return ReactDOM.createPortal(
                    containerPortals.map(renderPortal),
                    portalRoot
                );
            })}
        </>
    );
};

