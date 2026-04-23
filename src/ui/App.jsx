import { useEffect, useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import './styles/global.css';
import { Header } from './components/Header/Header';
import { ChatInterface } from './components/Chat/ChatInterface';
import { LeftPanel } from './components/Panels/LeftPanel.jsx';
import { Canvas } from './components/Canvas/Canvas';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
// import { Recording } from './components/RecordingUI/Recording';
import '../core/Timer/timer.js'
import { DiagramUi } from './components/DiagramUI/diagram.jsx'
import { Settings } from './pages/Settings.jsx';
import { StatusUI } from './components/StatusUI/StatusUI.jsx';
import '../core/StatusUIManager/Manager.js'
import { APIKeysManager } from './components/ApiManager/manager.tsx';
import { DropZone } from './components/DropZone/DropZone.tsx'
import { NotificationFlyer, Notifcation } from './components/Notifications/Notification.jsx'
import '../core/MathBase/katex/katex.min.js';
import '../core/MathBase/katex/contrib/auto-render.min.js';
import './styles/code-theme.css'
import '../core/MathBase/MathNormalize.js';
import '../core/MathBase/mathRenderer.js';
import '../core/diagraming/vizcharting.js'
import '../core/diagraming/jscharting.js'
import '../core/Notification/notification';
import '../core/Utils/keyshortcuts';
import { StaticPortalContainer } from './StaticPortalContainer';
import { StreamingPortalContainer } from './StreamingPortalContainer';
import '../core/PortalBridge.ts';
import './PortalTargetRegister';
import ConfigEditor from './pages/ConfigEditor.jsx';
import { CopyFeedback } from './components/StatusUI/copy.jsx';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { globalEventBus } from '../core/Globals/eventBus.ts';
import { LoadingDisplay } from './components/StatusUI/loader.jsx';

const App = () => {
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('mistral-large-latest');
    const [isRecordingOn, setIsRecordingOn] = useState(false);
    const [leftPanelOpen, setLeftPanelOpen] = useState(false)

    const toggleSidebar = () => setLeftPanelOpen(!leftPanelOpen);
    const toggleCanvas = () => setIsCanvasOpen(!isCanvasOpen);
    const toggleRecording = () => setIsRecordingOn(!isRecordingOn);
    useEffect(() => {
        const panelChangeListener = globalEventBus.on('panel:chats:change', (state) => setLeftPanelOpen(state))
        return () => {
            panelChangeListener.unsubscribe()
        };
    }, [leftPanelOpen, isCanvasOpen]);

    return (
        <ErrorBoundary>
            <Provider store={store}>
                <MainLayout>
                    <span className='data-portal-root fixed z-[99]'></span>
                    <div
                        data-portal-container="mainContainer"
                        id="main-container"
                        className="flex overflow-hidden max-w-full">
                        <div className={`flex flex-shrink max-w-full ${isCanvasOpen ? 'w-[55vw]' : 'w-full'} transition-transform duration-500`}>
                            <ErrorBoundary>
                                <LeftPanel isOpen={leftPanelOpen} onToggle={toggleSidebar} isCanvasOn={isCanvasOpen} />
                            </ErrorBoundary>
                            <div id="main-container-center" className='block h-[90vh] w-[calc(100vw-40px)] md:w-[96vw]'>
                                <ErrorBoundary>
                                    <Header onToggleSidebar={toggleSidebar} selectedModel={selectedModel} onModelChange={setSelectedModel}
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
                        <ConfigEditor />
                        {/* Copy Feedback Modal*/}
                        <CopyFeedback />
                        <DiagramUi isOpen={true} onToggle={null} />
                        <Settings isOpen={true} onToggle={null} />
                        <StatusUI isOpen={true} onToggle={null} />
                        <APIKeysManager isOpen={true} onToggle={null} />
                        <DropZone isOpen={true} onToggle={null} />
                        {/*<Recording isOpen={isRecordingOn} onToggle={toggleRecording} />*/}
                        <NotificationFlyer isOpen={true} onToggle={null} />
                        <Notifcation isOpen={true} onToggle={null} />
                        <LoadingDisplay />
                    </ErrorBoundary>
                </MainLayout>
                {/* Portal containers for vanilla JS components */}
                <ErrorBoundary>
                    <StaticPortalContainer />
                    <StreamingPortalContainer />
                </ErrorBoundary>
            </Provider>
        </ErrorBoundary >
    );
};

export default App;
