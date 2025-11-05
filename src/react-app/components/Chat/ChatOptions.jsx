import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChatManager } from '@js/managers/ConversationManager/ChatManager';

const Manager = new ChatManager()

export const ChatOptions = ({ isOpen, onToggle }) => {

    const confirmDeletion = useCallback(async () => {
        const confirmed = await window.ModalManager.confirm("Are you sure you want to delete this item?", "Confirm Deletion")
        if (confirmed) {
            const currentConversationId = document.getElementById('chatOptions-overlay').dataset.id
            Manager.currentConversationId = currentConversationId
            Manager.DeleteConversation(currentConversationId)
        }
    })

    const showRenameModal = useCallback(() => {
        const renameModal = document.getElementById('renameModal');
        const modalTitle = document.getElementById('modalTitle');

        //Display modal
        renameModal.classList.remove('translate-y-full')
        renameModal.classList.add('translate-y-0')

        const currentConversationId = document.getElementById('chatOptions-overlay').dataset.id
        Manager.currentConversationId = currentConversationId
        if (modalTitle && currentConversationId) modalTitle.textContent = `Rename ${currentConversationId}`;

    })

    const hideRenameModal = useCallback(() => {
        const renameModal = document.getElementById('renameModal');
        renameModal.classList.remove('translate-y-0')
        renameModal.classList.add('translate-y-full')
    })

    const rename = useCallback(() => {
        hideRenameModal()
        const newName = document.getElementById('newName').value.trim();
        Manager.RenameConversation(newName, document.getElementById('chatOptions-overlay').dataset.id)
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
                    if(!document.querySelector('[id^="confirm-dialog-"'))
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
        <div id="chatOptions-overlay" className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40 hidden w-full h-full max-4xl max-h-4xl">
            {/*-- Conversation options */}
            <div id="chatOptions" className="fixed flex inset-0 items-center justify-center rounded-lg shadow-2xl z-50 animate-exit">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 backdrop-blur-sm bg-white/95">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Conversation Options</h2>
                        <section className="space-y-6">
                            <div className="flex flex-row justify-center gap-4">
                                <button onClick={showRenameModal} id="renameOption" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl w-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-blue-700 active:scale-95 font-semibold text-lg">
                                    ✏️ Rename
                                </button>
                                <button onClick={confirmDeletion} id="DeleteOption" className="bg-gradient-to-br from-red-500 to-red-600 text-white py-3 px-6 rounded-xl w-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl hover:from-red-600 hover:to-red-700 active:scale-95 font-semibold text-lg">
                                    🗑️ Delete
                                </button>
                            </div>
                            <div className="items-center pt-2">
                                <button onClick={() => Manager.hideConversationOptions()} id="renameOptionsBt" className="bg-gray-100 text-gray-700 py-3 px-8 rounded-xl w-fit shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-200 hover:shadow-lg active:scale-95 font-medium text-lg border border-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/*--Conversation Rename modal-*/}
            <div
                onClick={(e) => {
                    if (e.traget == e.currentTarget) hideRenameModal()
                }} id="renameModal" className="fixed inset-0 z-50 flex translate-y-full items-center justify-center bg-black bg-opacity-40 transform transition-transform duration-700 ease-in-out">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 id="modalTitle" className="text-2xl font-bold text-gray-800 mb-4"></h3>
                    <div className="mb-4">
                        <label htmlFor="newName" className="block text-gray-700 mb-2">New Name:</label>
                        <input type="text" id="newName" className="w-full p-2 border rounded" placeholder="Enter new name"></input>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button onClick={rename} id="SubmitRenameButton" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Rename</button>
                        <button onClick={hideRenameModal} id="canceRenamelButton" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
