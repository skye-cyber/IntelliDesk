import React, { useCallback, useEffect } from 'react';
import { opendiagViewModal, closediagViewModal } from '@js/diagraming/Utils.js';

export const DiagramUi = ({ isOpen, onClose, content }) => {

    const shouldClose = useCallback((e) => {
        if (!document.getElementById('diag-modal-content').contains(e.target)) closediagViewModal()
    })

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) closediagViewModal();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            id="diagViewModal"
            onClick={shouldClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 opacity-0 translate-x-full"
        >
            <section
                id="diag-modal-content"
                className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-600/30 w-full max-w-[98vw] h-[98vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900/80">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text text-transparent">
                                Diagram Studio
                            </h2>
                            <p className="text-sm text-slate-400">Interactive visualization</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-200 rounded-xl transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg">
                            Export
                        </button>
                        <button
                            id="close-diagram"
                            onClick={closediagViewModal}
                            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 rounded-xl border border-transparent hover:border-slate-600/50 transition-all duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex bg-gradient-to-br from-slate-900 to-slate-800">
                    {/* Diagram Canvas */}
                    <div className="flex-1 p-6 overflow-auto">
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 min-h-full flex items-center justify-center backdrop-blur-sm shadow-2xl">
                            {content ? (
                                <div
                                    id="diagram-canvas"
                                    className="w-full h-full p-8"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <svg className="w-10 h-10 text-cyan-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-slate-300 mb-2">No diagram content</p>
                                    <p className="text-sm text-slate-500">Generate a diagram to view it here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Properties/Code */}
                    <div className="w-96 border-l border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex flex-col">
                        <div className="p-3 border-b border-slate-700/50">
                            <h3 className="font-semibold text-slate-200 text-lg mb-1">Properties</h3>
                            <p className="text-sm text-slate-400">Customize your diagram</p>
                        </div>
                        <div className="flex-1 p-6 overflow-auto space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-cyan-200 mb-3">
                                    Layout Engine
                                </label>
                                <select className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-300">
                                    <option className="bg-slate-800">Hierarchical</option>
                                    <option className="bg-slate-800">Force-directed</option>
                                    <option className="bg-slate-800">Circular</option>
                                    <option className="bg-slate-800">Grid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-cyan-200 mb-3">
                                    Color Theme
                                </label>
                                <select className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-300">
                                    <option className="bg-slate-800">Midnight Blue</option>
                                    <option className="bg-slate-800">Cyber Punk</option>
                                    <option className="bg-slate-800">Deep Ocean</option>
                                    <option className="bg-slate-800">Solarized Dark</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-cyan-200 mb-3">
                                    Node Style
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 text-slate-300 text-sm">
                                        <input type="radio" name="node-style" className="text-cyan-500 focus:ring-cyan-500" defaultChecked />
                                        <span>Rounded</span>
                                    </label>
                                    <label className="flex items-center space-x-3 text-slate-300 text-sm">
                                        <input type="radio" name="node-style" className="text-cyan-500 focus:ring-cyan-500" />
                                        <span>Sharp</span>
                                    </label>
                                    <label className="flex items-center space-x-3 text-slate-300 text-sm">
                                        <input type="radio" name="node-style" className="text-cyan-500 focus:ring-cyan-500" />
                                        <span>Circular</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700/50">
                                <button className="w-full p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="text-slate-400 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span>Ready</span>
                        </div>
                        <div className="text-slate-500">
                            Drag to pan • Scroll to zoom • Shift + Drag to select
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 rounded-xl transition-all duration-300 hover:border-slate-500/50">
                            Reset View
                        </button>
                        <button className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Render Diagram
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
