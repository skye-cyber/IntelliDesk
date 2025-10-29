import React, { useState } from 'react';
import { MainLayout } from '@components/Layout/MainLayout';
import { Header } from '@components/Header/Header';
import { ChatInterface } from '@components/Chat/ChatInterface';
import { InputSection } from '@components/Input/InputSection';
import { Sidebar } from '@components/Sidebar/Sidebar';
import { Canvas } from '@components/Canvas/Canvas';
import { useElectron } from '@hooks/useElectron';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import '@js/katex/katex.min.js';
import '@js/katex/contrib/auto-render.min.js';
import '@css/styles.css';
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
import { ChatOptions } from '@components/Chat/ChatOptions.jsx';

const App = () => {
    //const { electron } = useElectron();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-72B-Instruct');
    const { sendMessage } = useElectron();
    const [isRecordingOn, setIsRecordingOn] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCanvas = () => setIsCanvasOpen(!isCanvasOpen);

    const toggleRecording = () => setIsRecordingOn(!isRecordingOn);


    return (
        <ErrorBoundary>
            <MainLayout>
                <div className='flex flex-1 overflow-hidden w-full'>
                    <div id="mainLayoutA" className='w-full'>
                        <ErrorBoundary>
                            <Header
                                onToggleSidebar={toggleSidebar}
                                selectedModel={selectedModel}
                                onModelChange={setSelectedModel}
                            />
                        </ErrorBoundary>
                        <div className="flex flex-1 overflow-hidden">
                            <ErrorBoundary>
                                <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <ChatOptions isOpen={true} onToggle={null} />
                            </ErrorBoundary>

                            <div className="flex-1 flex flex-col">
                                <ErrorBoundary>
                                    <ChatInterface />
                                </ErrorBoundary>
                                <ErrorBoundary>
                                    <InputSection
                                        onSendMessage={sendMessage}
                                        onToggleCanvas={toggleCanvas}
                                        onToggleRecording={toggleRecording}
                                    />
                                </ErrorBoundary>
                            </div>
                        </div>

                    </div>
                    <ErrorBoundary>
                        <Canvas isOpen={isCanvasOpen} onToggle={toggleCanvas} />
                    </ErrorBoundary>

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
                </div>
                <ErrorBoundary>
                    <Recording isOpen={isRecordingOn} onToggle={toggleRecording} />
                </ErrorBoundary>

                <ErrorBoundary>
                    <NotificationFlyer isOpen={true} onToggle={null} />
                </ErrorBoundary>
            </MainLayout>
        </ErrorBoundary>
    );
};

export default App;
