import React, { useState, useEffect } from 'react';
import { Diagram } from './components/DiagramUI/diagram';
import ReactDOM from 'react-dom';
import { UserMessage, AiMessage } from './components/ConversationRenderer/Renderer';
import { ConversationItem } from './components/Chat/ConversationItem';
import { LoadingAnimation } from './components/StatusUI/loader';
import { ErrorModal } from './components/ErrorHandler/ErrorHandler';
import { ConfirmationDialog } from './components/StatusUI/confirmDialog';
import { Toast } from './components/StatusUI/Toasts';
import { ToolPermissionRequest } from './components/Tools/ToolPermRequest';

const componentRegistry = {
    Diagram,
    UserMessage,
    AiMessage,
    LoadingAnimation,
    ConversationItem,
    ErrorModal,
    Toast,
    ConfirmationDialog,
    ToolPermissionRequest
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
            const { id, prefix } = event.detail;
            const portalId = id

            if (prefix) {
                // Remove all portals that start with this portalId as prefix
                setPortals(prev => prev.filter(portal => !portal?.id.startsWith(portalId)));

                // Remove from targetedPortals state
                setTargetedPortals(prev => {
                    const newMap = new Map();
                    for (const [containerId, portals] of prev.entries()) {
                        newMap.set(containerId, portals.filter(p => !p?.id.startsWith(portalId)));
                    }
                    return newMap;
                });

                //console.log(`Removed portals with prefix: ${portalId}`);
            } else {
                // remove single portal
                setPortals(prev => prev.filter(portal => portal?.id !== portalId));

                setTargetedPortals(prev => {
                    const newMap = new Map();
                    for (const [containerId, portals] of prev.entries()) {
                        newMap.set(containerId, portals.filter(p => p?.id !== portalId));
                    }
                    return newMap;
                });
            }
        };

        const handleCloseContainer = (event) => {
            const { containerId } = event.detail;

            setTargetedPortals(prev => {
                const newMap = new Map(prev);
                newMap.delete(containerId);
                return newMap;
            });
        };

        document.addEventListener('data-portal-show', handleShowPortal);
        document.addEventListener('data-portal-show-targeted', handleShowTargetedPortal);
        document.addEventListener('data-portal-close', handleClosePortal);
        document.addEventListener('data-portal-close-container', handleCloseContainer);

        return () => {
            document.removeEventListener('data-portal-show', handleShowPortal);
            document.removeEventListener('data-portal-show-targeted', handleShowTargetedPortal);
            document.removeEventListener('data-portal-close', handleClosePortal);
            document.removeEventListener('data-portal-close-container', handleCloseContainer);
        };
    }, []);

    const closePortal = (portalId) => {
        setPortals(prev => prev.filter(portal => portal?.id !== portalId));
        setTargetedPortals(prev => {
            const newMap = new Map();
            for (const [containerId, portals] of prev.entries()) {
                newMap.set(containerId, portals.filter(p => p?.id !== portalId));
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

                const portalRoot = containerElement.querySelector('.data-portal-root');

                if (!portalRoot) {
                    console.warn(`Container .data-portal-root not found in ${containerId}`);
                    return null;
                }

                return ReactDOM.createPortal(
                    containerPortals.map(renderPortal),
                    portalRoot
                );
            })}
        </>
    );
};

