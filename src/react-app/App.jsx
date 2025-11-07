import React, { useState } from 'react';
import { MainLayout } from '@components/Layout/MainLayout';
import { Header } from '@components/Header/Header';
import { ChatInterface } from '@components/Chat/ChatInterface';
import { Sidebar } from '@components/Sidebar/Sidebar';
import { Canvas } from '@components/Canvas/Canvas';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import '@js/katex/katex.min.js';
import '@js/katex/contrib/auto-render.min.js';
import '@css/styles.css';
import '@css/dark-code-theme.css'
import '@css/light-code-theme.css'
import { Recording } from '@components/RecordingUI/Recording';
import '@js/Timer/timer.js'
import { DiagramUi } from '@components/DiagramUI/diagram.jsx'
import { Settings } from '@components/Settings/Settings.jsx';
import { StatusUI } from '@components/StatusUI/StatusUI.jsx';
import '@js/StatusUIManager/SuccessModal.js'
import '@js/StatusUIManager/Manager.js'
import { APIKeysManager } from '@components/ApiManager/api.jsx';
import { DropZone } from '@components/DropZone/dropzone.jsx'
import { NotificationFlyer } from '@components/Notifications/Notification.jsx'
import { Notifcation } from '@components/Notification/notification';
import '@js/MathBase/MathNormalize.js';
import '@js/MathBase/mathRenderer.js';
import '@js/diagraming/Utils.js'
import '@js/diagraming/vizcharting.js'
import '@js/diagraming/jscharting.js'
import '@js/Notification/notification';
import '@js/ChatExport/export';
import '@js/Utils/keyshortcuts';
//import { StateManager } from '@js/managers/StatesManager';


const App = () => {
    //const { electron } = useElectron();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('mistral-large-latest');
    const [isRecordingOn, setIsRecordingOn] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCanvas = () => setIsCanvasOpen(!isCanvasOpen);
    const toggleRecording = () => setIsRecordingOn(!isRecordingOn);

    return (
        <ErrorBoundary>
            <MainLayout>
                <div className='flex flex-1 overflow-hidden max-w-full'>
                    <div className='flex flex-shrink'>
                        <ErrorBoundary>
                            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
                        </ErrorBoundary>
                        <div id="main-container-center" className='block h-[90vh] w-[calc(100vw-40px)] md:w-[96vw]'>
                            <ErrorBoundary>
                                <Header
                                    onToggleSidebar={toggleSidebar}
                                    selectedModel={selectedModel}
                                    onModelChange={setSelectedModel}
                                />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <ChatInterface
                                    isCanvasOpen={isCanvasOpen}
                                    onToggleCanvas={toggleCanvas}
                                    onToggleRecording={toggleRecording} />
                            </ErrorBoundary>
                        </div>
                    </div>
                    <ErrorBoundary>
                        <Canvas isOpen={isCanvasOpen} onToggle={toggleCanvas} />
                    </ErrorBoundary>
                </div>
                <ErrorBoundary>
                    <DiagramUi isOpen={true} onToggle={null} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <Settings isOpen={true} onToggle={null} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <StatusUI isOpen={true} onToggle={null} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <APIKeysManager isOpen={true} onToggle={null} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <DropZone isOpen={true} onToggle={null} />
                </ErrorBoundary>

                <ErrorBoundary>
                    <Recording isOpen={isRecordingOn} onToggle={toggleRecording} />
                </ErrorBoundary>

                <ErrorBoundary>
                    <NotificationFlyer isOpen={true} onToggle={null} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <Notifcation isOpen={true} onToggle={null} />
                </ErrorBoundary>
            </MainLayout>
        </ErrorBoundary>
    );
};

export default App;
