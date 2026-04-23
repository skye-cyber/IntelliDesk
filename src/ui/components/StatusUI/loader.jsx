import { useEffect, useState } from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { globalEventBus } from '../../../core/Globals/eventBus';

export const LoadingAnimation = ({ }) => {
    const loaderUUID = `loader_${Math.random().toString(30).substring(3, 9)}`;

    return (
        <ErrorBoundary>
            <div id={loaderUUID} className='fixed bottom-[10vh] left-16 z-[71]'>
                <div id="loader-parent">
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="transform scale-75">
                        <circle cx="12" cy="24" r="4" className="fill-green-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="24" cy="24" r="4" className="fill-blue-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                        </circle>
                        <circle cx="36" cy="24" r="4" className="fill-yellow-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                        </circle>
                    </svg>
                </div>
            </div>
        </ErrorBoundary>
    )
}

export const LoadingDisplay = () => {
    const [message, setMessage] = useState('Processing, please wait')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const showLoader = globalEventBus.on('status:loading:show', (message) => {
            if (message) setMessage(message)
            setIsOpen(true)
        })
        const hideLoader = globalEventBus.on('status:loading:hide', () => {
            setMessage('Processing, please wait')
            setIsOpen(false)
        })
        return () => {
            showLoader.unsubscribe()
            hideLoader.unsubscribe()
        }
    })

    if (!isOpen) return

    return (
        <div id="loadingModal" className="fixed z-70 inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
            <div id="modalMainBox" className="bg-white min-h-32 p-6 rounded-lg shadow-lg flex gap-1 items-center  transition-all duration-700">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p id="loadingMSG" className="mt-3 text-gray-700">{message.length > 25 ? `${message?.slice(0, 25)} ...` : message}</p>
            </div>
        </div>
    )
}

