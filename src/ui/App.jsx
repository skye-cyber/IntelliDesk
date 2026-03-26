import { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import './styles/global.css';
import { Header } from './components/Header/Header';
import { ChatInterface } from './components/Chat/ChatInterface';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import '../core/katex/katex.min.js';
import '../core/katex/contrib/auto-render.min.js';
import './styles/code-theme.css'
import { Recording } from './components/RecordingUI/Recording';
import '../core/Timer/timer.js'
import { DiagramUi } from './components/DiagramUI/diagram.jsx'
import { Settings } from './components/Settings/Settings.jsx';
import { StatusUI } from './components/StatusUI/StatusUI.jsx';
//import '../core/StatusUIManager/SuccessModal.js'
import '../core/StatusUIManager/Manager.js'
import { APIKeysManager } from './components/ApiManager/api';
import { DropZone } from './components/DropZone/dropzone.jsx'
import { NotificationFlyer, Notifcation } from './components/Notifications/Notification.jsx'
import '../core/MathBase/MathNormalize.js';
import '../core/MathBase/mathRenderer.js';
import '../core/diagraming/vizcharting.js'
import '../core/diagraming/jscharting.js'
import '../core/Notification/notification';
import '../core/ChatExport/export';
import '../core/Utils/keyshortcuts';
import { StaticPortalContainer } from './StaticPortalContainer';
import { StreamingPortalContainer } from './StreamingPortalContainer';
import '../core/PortalBridge';
import './PortalTargetRegister';

const App = () => {
    //const { electron } = useElectron();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('mistral-small-latest');
    const [isRecordingOn, setIsRecordingOn] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCanvas = () => setIsCanvasOpen(!isCanvasOpen);
    const toggleRecording = () => setIsRecordingOn(!isRecordingOn);

    return (
        <ErrorBoundary>
            <MainLayout>
                <div data-portal-container="mainContainer" id="main-container"  className='flex flex-1 overflow-hidden max-w-full'>
                    <span className='data-portal-root fixed z-[99]'></span>
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
            {/* Portal containers for vanilla JS components */}
            <ErrorBoundary>
                <StaticPortalContainer />
            </ErrorBoundary>
            <ErrorBoundary>
                <StreamingPortalContainer />
            </ErrorBoundary>
        </ErrorBoundary >
    );
};

export default App;
