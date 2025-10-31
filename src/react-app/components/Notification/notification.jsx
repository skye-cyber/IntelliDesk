import React from 'react';

export const Notifcation = ({ isOpen, onToggle }) => {
    return (
        <div id="quickaiNotify" className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 opacity-0 pointer-events-none transition-all duration-500 ease-in-out">
            {/* Modal Content */}
            <div className="items-center justify-center bg-white dark:bg-[#24272b] p-6 rounded-lg shadow-lg w-full max-w-md border-2 border-[#141618]">
                {/* Close Button */}
                <button id="closeMessageModal" className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal Title */}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Message</h2>

                {/* Message Content */}
                <p id="messageContent" className="text-gray-700 dark:text-gray-300">
                    Request completed in <span id="timeTaken" className="font-semibold text-blue-600 dark:text-blue-400">5 seconds</span>
                </p>

                {/* Submit Button */}
                <button className="hidden mt-6 bg-blue-500 text-white p-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    OK
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
