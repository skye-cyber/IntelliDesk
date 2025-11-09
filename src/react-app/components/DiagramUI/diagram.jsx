import React, { useCallback, useEffect } from 'react';
import { closediagViewModal } from '@js/diagraming/Utils.js';
import { exportSvgToPng } from '../../../renderer/js/diagraming/Utils';

export const DiagramUi = ({ isOpen, onClose, content }) => {

    const shouldClose = useCallback((e) => {
        if (!document.getElementById('diag-modal-content-container').contains(e.target)) closediagViewModal()
    })

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) closediagViewModal();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    function initCanvas() {
        initialized = true;
        const ctx = canvas.getContext('2d');
        // background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        // subtle grid
        ctx.strokeStyle = 'rgba(15,23,42,0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for (let y = 0; y < canvas.height; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }


        // sample drawing
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(120, 120, 48, 0, Math.PI * 2);
        ctx.fill();


        ctx.fillStyle = '#0ea5a4';
        ctx.fillRect(220, 80, 160, 80);


        ctx.fillStyle = '#0f172a';
        ctx.font = '18px system-ui, -apple-system, Roboto, Arial';
        ctx.fillText('Canvas is open', 220, 55);
    }

    if (!isOpen) return null;

    return (
        <div
            id="diagViewModal"
            onClick={shouldClose}
            className="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 opacity-0 translate-x-full"
        >
            <section
                data-portal-container='diagram_canvas'
                id="diag-modal-content-container"
                className="relative bg-white dark:bg-slate-800  rounded-2xl shadow-2xl border border-slate-600/30 w-full max-w-[98vw] h-[98vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 dark:from-cyan-100 dark:to-blue-200 bg-clip-text text-transparent">
                                Diagram Studio
                            </h2>
                            <p className="text-sm text-slate-700 dark:text-slate-400">Interactive visualization</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="hidden px-4 py-2 text-sm gradient-neon dark:gradient-neon-dark hover:bg-slate-600/50 text-gray-700 dark:text-slate-200 rounded-xl transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg disabled pointekr-events-none">
                            Export
                        </button>
                        <button
                            id="close-diagram"
                            onClick={closediagViewModal}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-gray-100 shadow-none hover:shadow-xl shadow-message shadow-primary-400 dark:shadow-slate-700 dark:hover:bg-slate-700/50 rounded-xl border border-transparent hover:border-slate-600/50 hover:translate-y-[2px] transition-all duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 flex bg-white dark:bg-slate-900">
                    {/* Diagram Canvas */}
                    <div className="flex-1 p-6 overflow-x-hidden">
                        <div id="diag-modal-content" data-portal-container="diagram" className="react-portal-root flex justify-center items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-700/50 min-h-full h-[50vh] block space-y-2 p-4 backdrop-blur-sm shadow-2xl overflow-y-auto overflow-x-hidden scrollbar-custom scroll-smooth">
                            <div id="diag-placeholder" className="text-center text-slate-400">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <svg className="w-10 h-10 text-cyan-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-slate-200 mb-2">No diagram content</p>
                                <p className="text-sm text-slate-400">Generate a diagram to view it here</p>
                            </div>
                        </div>
                        <button onClick={(e) => { document.getElementById('dg-sidebar-content').classList.toggle('hidden') }} className="absolute z-10 top-0 right-0 flex justify-center items-center text-slate-900 dark:text-white py-[0px] px-[2px] cursor-w-resize group focus:ring-none focus:outline-none">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon max-md:hidden">
                                <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z">
                                </path>
                            </svg>
                        </button>
                    </div>


                    {/* Sidebar - Properties/Code */}
                    <div id="dg-sidebar" className="hidden md:block w-fit max-w-96 border-l border-slate-700/50 bg-slate-100 dark:bg-slate-800/30 backdrop-blur-sm flex flex-col">
                        <div id="dg-sidebar-content" className=''>
                            <div className="p-3 border-b border-slate-700/50">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-lg mb-1">Properties</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Customize your diagram</p>
                            </div>
                            <div className="flex-1 p-6 overflow-auto space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-sky-500/90 dark:text-cyan-200 mb-3">
                                        Layout Engine
                                    </label>
                                    <select className="w-full p-3 bg-slate-300/90 dark:bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-300">
                                        <option className="bg-slate-300 dark:bg-slate-800">Hierarchical</option>
                                        <option className="bg-slate-300 dark:bg-slate-800">Force-directed</option>
                                        <option className="bg-slate-300 dark:bg-slate-800">Circular</option>
                                        <option className="bg-slate-300 dark:bg-slate-800">Grid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-sky-500/90 dark:text-cyan-200 mb-3">
                                        Color Theme
                                    </label>
                                    <select className="w-full p-3 bg-slate-300/90 dark:bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-300">
                                        <option className="bg-slate-300 dark:bg-slate-800">Midnight Blue</option>
                                        <option className="bg-slate-300 dark:bg-slate-800">Cyber Punk</option>
                                        <option className="bg-slate-300 dark:bg-slate-800">Deep Ocean</option>
                                        <option className="bg-slate-300 dark:bg-slate-800">Solarized Dark</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-sky-500/90 dark:text-cyan-200 mb-3">
                                        Node Style
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 text-sm">
                                            <input type="radio" name="node-style" className="text-cyan-500 focus:ring-cyan-500" defaultChecked />
                                            <span>Rounded</span>
                                        </label>
                                        <label className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 text-sm">
                                            <input type="radio" name="node-style" className="text-cyan-500 focus:ring-cyan-500" />
                                            <span>Sharp</span>
                                        </label>
                                        <label className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 text-sm">
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
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-primary-400/50 dark:border-slate-700/50 bg-slate-200 dark:bg-slate-800/50 backdrop-blur-sm hidden md:flex justify-between items-center">
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
                        <button className="px-4 py-2 text-sm bg-slate-700/90 dark:bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-200 dark:text-slate-300 rounded-xl transition-all duration-300 hover:border-slate-500/50">
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

export const Diagram = ({ name = 'diagram', exportId, dgId, description, content = null }) => {
    const el = document.getElementById('diag-modal-content')
    if (el) {
        el.classList.remove('justify-center', 'items-center')
        el.classList.add('flex-cols', 'flex-wrap')
    }
    return (
        <section className='dg p-0.5 sm:p-1 border border-blue-400 rounded-md bg-white dark:bg-primary-700 transition-all duration-700'>
            <div className='flex justify-between'>
                <p data-name={name} id={name} className='bg-gray-200 dark:bg-blend-600 rounded-md p-0 my-1.5 w-fit font-mono text-blue-500 dark:text-blue-400 transition-all duration-1000 font-sans'><span className='gap-3 font-semibold text-slate-800 dark:text-slate-200'>Name: </span><span className='font-brand'>{name}</span></p>
                <button
                    onClick={() => exportSvgToPng(`${exportId}-${name}-${dgId}`)}
                    data-value={`${exportId}-${name}-${dgId}`}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                    aria-label={`Export ${name} diagram`}
                >
                    Export
                </button>
            </div>
            {description ?
                <p className='text-sm text-gray-500 dark:text-gray-300 italic mb-0 transition-all duration-1000'>{description}</p>
                : ''}
            <div id={`${exportId}-${name?.replace(' ','-')}-${dgId}`} className='h-fit max-h-full w-fit max-w-[250px] sm:max-w-[81vw] md:max-w-[65vw] lg:md:max-w-[71vw] xl:md:max-w-[76vw] overflow-x-auto scrollbar-custom scroll-smooth rounded-lg bg-gray-50 dark:bg-primary-800 transition-all duration-1000'>
                {content ?
                    <div dangerouslySetInnerHTML={{ __html: content }}>
                    </div>
                    :
                    ''
                }
            </div>
        </section>
    );
};
