import React, { useCallback, useEffect, useRef, useState } from 'react';

export const ConfirmationDialog = ({ title, message, dialog_id, portal_id, resolve }) => {
    const portalRef = useRef(null)
    const contentRef = useRef(null)
    const [shown, setShown] = useState(false)

    const fadeIn = useCallback(() => {
        setTimeout(() => {
            contentRef.current?.classList.remove("scale-95", "opacity-0");
            contentRef.current?.classList.add("scale-100", "opacity-100");
            setShown(true)
        }, 10)
    }, [])

    useEffect(() => {
        if (!shown) {
            fadeIn()
        }
    }, [])

    const closePortal = useCallback((confirmed) => {
        if (portal_id) {
            if (portalRef.current) {
                portalRef.current?.classList.remove("scale-100", "opacity-100");;
                portalRef.current?.classList.add("scale-95", "opacity-0");

                // Resolve promise and close dialog portal
                setTimeout(() => {
                    window.reactPortalBridge.closeComponent(portal_id)
                    resolve(confirmed)
                }, 510);
            }
        } else {
            //window.ModalManager.hideConfirmDialog(dialog_id, confirmed, resolve)
        }
    })

    const cancel = useCallback(() => {
        closePortal(false)
    })

    return (
        <div id={dialog_id}
            ref={portalRef}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={contentRef}
                id='dialog-content'
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all ease-in-out duration-300 scale-95 opacity-0">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-6">{message}</p>
                    <div className="flex space-x-3">
                        <button type="button"
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                            onClick={cancel}>
                            Cancel
                        </button>
                        <button type="button"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                            onClick={()=> closePortal(true)}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
