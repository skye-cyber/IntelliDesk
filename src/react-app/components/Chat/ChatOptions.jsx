import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChatManager } from '@js/managers/ConversationManager/ChatManager';

const Manager = new ChatManager()

export const ChatOptions = ({ isOpen, onToggle }) => {

    const confirmDeletion = useCallback(async () => {
        const confirmed = await window.ModalManager.confirm("Are you sure you want to delete this item?", "Confirm Deletion")
        if (confirmed) {
            const overlay = document.getElementById('chatOptions-overlay');
            const currentConversationId = overlay.dataset.id
            const potalId = overlay.dataset.portalid

            Manager.currentConversationId = currentConversationId
            if (Manager.DeleteConversation(currentConversationId)) {
                window.reactPortalBridge.closeComponent(potalId)
            }
            window.ModalManager.showMessage('File deleted successfully!', 'success')
        }
    })

    const showRenameModal = useCallback(() => {
        const renameModal = document.getElementById('renameModal');
        const modalTitle = document.getElementById('modalTitle');

        //Display modal
        renameModal.classList.remove('hidden', 'translate-y-full')
        renameModal.classList.add('translate-y-0')

        const overlay = document.getElementById('chatOptions-overlay');
        const currentConversationId = overlay?.dataset.id

        Manager.currentConversationId = currentConversationId
        if (modalTitle && currentConversationId) modalTitle.textContent = `Rename ${currentConversationId}`;

    })

    const hideRenameModal = useCallback(() => {
        const renameModal = document.getElementById('renameModal');
        renameModal.classList.remove('translate-y-0')
        renameModal.classList.add('translate-y-full')
        setTimeout(() => {
            renameModal.classList.add('hidden')
        }, 500)
    })

    const rename = useCallback(() => {
        hideRenameModal()
        const newName = document.getElementById('newName').value.trim();
        const overlay = document.getElementById('chatOptions-overlay');
        const currentConversationId = overlay.dataset.id
        //const potalId = overlay.dataset.portalid

        if (Manager.RenameConversation(newName, currentConversationId)) {
            document.querySelector(`[data-id^="${currentConversationId}"]`).dataset.name = newName
            window.ModalManager.showMessage('File renamed successfully!', 'success')
        }
        hideRenameModal()
    })

    useEffect(() => {
        const newNameInput = document.getElementById('newName');

        const handleKeyPress = (event) => {
            event.stopPropagation();
            if (event.key === 'Enter' && !event.shiftKey && document.getElementById('renameModal')?.classList?.contains('translate-y-0')) {
                rename();
            } else if (event.key === 'Escape') {
                if (document.getElementById('renameModal')?.classList.contains('translate-y-0')) {
                    hideRenameModal()
                } else {
                    if (!document.querySelector('#dialog-content')?.classList?.contains('opacity-100'))
                        Manager.hideConversationOptions()
                }
            }
        }
        document.addEventListener('close-rename-modal', hideRenameModal);
        newNameInput.addEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            newNameInput.removeEventListener('keypress', handleKeyPress);
            document.removeEventListener('close-rename', hideRenameModal);
            document.removeEventListener('keydown', handleKeyPress)
        }
    })
    return (
        <>
            <div
                id="chatOptions-overlay"
                className="fixed size-fit inset-0 z-40 hidden"
                onClick={() => Manager.hideConversationOptions()}
                onMouseLeave={Manager.hideConversationOptions}
            >
                {/* Conversation Options Tooltip */}
                <div
                    id="chatOptions"
                    className="absolute bg-white dark:bg-blend-900 rounded-lg shadow-lg z-70 border border-gray-200 dark:border-blend-200 backdrop-blur-sm min-w-fit animate-exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-2">
                        <button
                            onClick={showRenameModal}
                            id="renameOption"
                            className="flex items-center w-full px-0 py-2 text-left text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-blend-600 transition-colors duration-200 gap-1"
                        >
                            <svg fill="currentColor" className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M472.8 64C445.4 64 419.2 74.9 399.8 94.2L382.1 112L369 98.9C340.9 70.8 295.3 70.8 267.2 98.9L167 199C157.6 208.4 157.6 223.6 167 232.9C176.4 242.2 191.6 242.3 200.9 232.9L301.1 132.9C310.5 123.5 325.7 123.5 335 132.9L348.1 145.9L248 246.1L393.9 392L545.8 240.2C565.2 220.8 576 194.6 576 167.2C576 110.2 529.8 64 472.8 64zM166.4 327.7C116.5 377.6 83.1 441.7 70.9 511.2L64.4 547.8C63 555.6 65.5 563.4 71 569C76.5 574.6 84.4 577 92.1 575.7L128.8 569.2C198.3 556.9 262.4 523.6 312.3 473.7L360 425.9L214.1 280L166.4 327.7z" /></svg> Rename
                        </button>
                        <button
                            onClick={() => { }}
                            id="PinOption"
                            className="flex items-center w-full px-0 py-2 text-left text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-blend-600 transition-colors duration-200 gap-1"
                        >
                            <svg fill="currentColor" className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M160 96C160 78.3 174.3 64 192 64L448 64C465.7 64 480 78.3 480 96C480 113.7 465.7 128 448 128L418.5 128L428.8 262.1C465.9 283.3 494.6 318.5 507 361.8L510.8 375.2C513.6 384.9 511.6 395.2 505.6 403.3C499.6 411.4 490 416 480 416L160 416C150 416 140.5 411.3 134.5 403.3C128.5 395.3 126.5 384.9 129.3 375.2L133 361.8C145.4 318.5 174 283.3 211.2 262.1L221.5 128L192 128C174.3 128 160 113.7 160 96zM288 464L352 464L352 576C352 593.7 337.7 608 320 608C302.3 608 288 593.7 288 576L288 464z" /></svg>Pin
                        </button>

                        <button
                            onClick={() => { }}
                            id="ShareOption"
                            className="flex items-center w-full px-0 py-2 text-left text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-blend-600 transition-colors duration-200 gap-1"
                        >
                            <svg fill="currentColor" className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M457.5 71C450.6 64.1 440.3 62.1 431.3 65.8C422.3 69.5 416.5 78.3 416.5 88L416.5 144L368.5 144C280.1 144 208.5 215.6 208.5 304C208.5 350.7 229.2 384.4 252.1 407.4C260.2 415.6 268.6 422.3 276.4 427.8C285.6 434.3 298.1 433.5 306.5 425.9C314.9 418.3 316.7 405.9 311 396.1C307.4 389.8 304.5 381.2 304.5 369.4C304.5 333.2 333.8 303.9 370 303.9L416.5 303.9L416.5 359.9C416.5 369.6 422.3 378.4 431.3 382.1C440.3 385.8 450.6 383.8 457.5 376.9L593.5 240.9C602.9 231.5 602.9 216.3 593.5 207L457.5 71zM464.5 168L464.5 145.9L542.6 224L464.5 302.1L464.5 280C464.5 266.7 453.8 256 440.5 256L370 256C319.1 256 276.1 289.5 261.7 335.6C258.4 326.2 256.5 315.8 256.5 304C256.5 242.1 306.6 192 368.5 192L440.5 192C453.8 192 464.5 181.3 464.5 168zM144.5 160C100.3 160 64.5 195.8 64.5 240L64.5 496C64.5 540.2 100.3 576 144.5 576L400.5 576C444.7 576 480.5 540.2 480.5 496L480.5 472C480.5 458.7 469.8 448 456.5 448C443.2 448 432.5 458.7 432.5 472L432.5 496C432.5 513.7 418.2 528 400.5 528L144.5 528C126.8 528 112.5 513.7 112.5 496L112.5 240C112.5 222.3 126.8 208 144.5 208L168.5 208C181.8 208 192.5 197.3 192.5 184C192.5 170.7 181.8 160 168.5 160L144.5 160z" /></svg> Share
                        </button>
                        <button
                            onClick={() => { }}
                            id="ArchiveOption"
                            className="flex items-center w-full px-0 py-2 text-left text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-blend-600 transition-colors duration-200 gap-1"
                        >
                            <svg fill="currentColor" className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z" /></svg>Archive
                        </button>
                        <button
                            onClick={confirmDeletion}
                            id="DeleteOption"
                            className="flex items-center w-full px-0 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-blend-600 transition-colors duration-200 gap-1"
                        >
                            <svg fill="currentColor" className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z" /></svg> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Rename Modal */}
            <RenameModal onRename={rename} onRenameModalHide={hideRenameModal} />
        </>
    );
};

export const RenameModal = ({ onRenameModalHide, onRename }) => {
    const shouldClose = useCallback((e) => {
        if (!e.currentTarget.childNodes[0].contains(e.target)) {
            onRenameModalHide()
        }
    })
    return (
        <div
            id="renameModal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden transition translate-y-full duration-300"
            onClick={shouldClose}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 id="modalTitle" className="text-xl font-bold text-gray-800 mb-4">
                    Rename Conversation #{Manager.currentConversationId}
                </h3>
                <div className="mb-4">
                    <label htmlFor="newName" className="block text-gray-700 mb-2">
                        New Name:
                    </label>
                    <input
                        type="text"
                        id="newName"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new name"
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onRename}
                        id="SubmitRenameButton"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        Rename
                    </button>
                    <button
                        onClick={onRenameModalHide}
                        id="canceRenamelButton"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
