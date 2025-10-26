import React, { useState } from 'react';
import { MainLayout } from '@components/Layout/MainLayout';
import { Header } from '@components/Header/Header';
import { ChatInterface } from '@components/Chat/ChatInterface';
import { InputSection } from '@components/InputSection/InputSection';
import { Sidebar } from '@components/Sidebar/Sidebar';
import { Canvas } from '@components/Canvas/Canvas';
import { ModelSelector } from '@components/ModelSelector/ModelSelector';
import { useElectron } from '@hooks/useElectron';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import '@js/katex/katex.min.js';
import '@js/katex/contrib/auto-render.min.js';
//import '@components/theme.js';
//import '@components/G_ModalMan.js';
//import '@js/managers/packed_HF_Audio.js';
//import '@js/script.js';
//import '@js/Utils/packed_chatUtils.js';
import '@js/managers/packed_HF_Chat.js';
//import '@js/router.js';
import '@js/managers/packed_MistralChatsAdmin.js';
//import '@js/Utils/apiUtils.js';
import '@css/styles.css';
import  { Recording } from '@components/RecordingUI/Recording';
import '@js/Timer/timer.js'

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
                </div>
                <ErrorBoundary>
                    <Recording  isOpen={isRecordingOn} onToggle={toggleRecording}/>
                </ErrorBoundary>
            </MainLayout>
        </ErrorBoundary>
    );
};

export default App;
