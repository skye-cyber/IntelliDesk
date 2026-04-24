import { useCallback, useEffect, useRef, useState } from 'react';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';

export const ConfirmDialog = () => {
    const portalRef = useRef(null)
    const contentRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState(null)
    const [message, setMessage] = useState(null)
    //const [onResolve, setOnResolve] = useState(fn)
    const onResolve = useRef(null)

    const reset = useCallback(() => {
        setTimeout(() => {
            setTitle(null)
            setMessage(null)
            onResolve.current = null
            setIsOpen(false)
        }, 500)
    }, [title, message, isOpen])

    const cancel = useCallback(() => {
        if (onResolve.current) onResolve.current(false)
        reset()
    }, [onResolve.current])

    const resolve = useCallback(() => {
        if (onResolve.current) onResolve.current(true)
        reset()
    }, [onResolve.current])

    useEffect(() => {
        const onOpen = globalEventBus.on('dialog:confirm:show', ({ onConfirm, title, message }) => {
            onResolve.current = onConfirm
            setTitle(title)
            setMessage(message)
            setIsOpen(true)
        })
        const onClose = globalEventBus.on('dialog:confirm:hide', () => {
            setIsOpen(false)
        })
        return () => {
            onOpen.unsubscribe()
            onClose.unsubscribe()
        }
    })

    if (!isOpen) return

    return (
        <div
            ref={portalRef}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div ref={contentRef}
                id='dialog-content'
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all ease-in-out duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{title || 'Confirm Action'}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-6">{message || 'Confirm!'}</p>
                    <div className="flex space-x-3">
                        <button type="button"
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                            onClick={cancel}>
                            Cancel
                        </button>
                        <button type="button"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                            onClick={resolve}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
