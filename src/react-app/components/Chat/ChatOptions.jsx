import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChatManager } from '@js/managers/ConversationManager/ChatManager';

const Manager = new ChatManager()

export const ChatOptions = ({ isOpen, onToggle }) => {

    const confirmDeletion = useCallback(() => {
        const confirmed = window.ModalManager.confirm("Are you sure you want to delete this item?", "Confirm Deletion")
        if (confirmed) Manager.DeleteConversation()
    })

    const showtRenameModal = useCallback(() => {
        const renameModal = document.getElementById('renameModal');
        const modalTitle = document.getElementById('modalTitle');

        //Display modal
        renameModal.classList.remove('translate-y-full')
        renameModal.classList.add('translate-y-0')

        const currentConversationId = Manager._get_conversation_id()
        if (modalTitle && currentConversationId) modalTitle.textContent = `Rename ${currentConversationId}`;

    })

    const hideRenameModal = useCallback(() => {
        const renameModal = document.getElementById('renameModal');
        renameModal.classList.remove('translate-y-full')
        renameModal.classList.add('translate-y-0')
    })

    const rename = useCallback(() => {
        hideRenameModal()
        const newName = document.getElementById('newName').value.trim();
        Manager().RenameConversation(newName)
        hideRenameModal()
    })

    useEffect(() => {
        const newNameInput = document.getElementById('newName');

        newNameInput.addEventListener('keypress', (event) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
                rename();
            }
        }, { once: true });
    })
    return (
        <div id="chatOptions-overlay" className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden w-full h-full">
            {/*-- Conversation options */}
            <div id="chatOptions" className="fixed flex inset-0 items-center justify-center rounded-lg shadow-xl z-50 animate-exit">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full bg-gradient-to-r from-blue-400 to-sky-400">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Options</h2>
                        <section className="grid grid-rows-2 space-y-4">
                            <div className="flex flex-row justify-center space-x-4">
                                <button onClick={showtRenameModal} id="renameOption" className="bg-blue-800 text-white p-1 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                                    Rename
                                </button>
                                <button onClick={confirmDeletion} id="DeleteOption" className="bg-red-500 text-white p-2 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                                    Delete
                                </button>
                            </div>
                            <div className="items-center">
                                <button onClick={() => ChatManager.hideConversationOptions()} id="renameOptionsBt" className="bg-gray-300 text-gray-700 mt-4 p-3 rounded-lg w-fit shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                                    Cancel
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>


            {/*--Conversation Rename modal-*/}
            <div id="renameModal" className="fixed inset-0 z-50 flex translate-y-full items-center justify-center bg-black bg-opacity-40 transform transition-transform duration-700 ease-in-out">
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
