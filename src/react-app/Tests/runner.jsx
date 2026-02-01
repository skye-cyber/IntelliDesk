import React, { useCallback, useEffect, useRef, useState } from 'react';
import { testSuite } from '../../renderer/js/tests/ToolCallingTestSuite';

export const TestsRunner = () => {
    // State for test results
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [summary, setSummary] = useState({
        passed: 0,
        failed: 0,
        total: 0,
        show: false
    });

    const consoleOutputRef = useRef(null);
    const isRunningRef = useRef(false);

    // Initialize and update summary when tests change
    useEffect(() => {
        const passed = testResults.filter(r => r.status && r.status.toLowerCase().includes('pass')).length;
        const failed = testResults.filter(r => r.status && r.status.toLowerCase().includes('fail')).length;

        setSummary(prev => ({
            ...prev,
            passed,
            failed,
            total: testResults.length,
            show: testResults.length > 0 && !testResults.some(r => r.status === 'running')
        }));
    }, [testResults]);

    // Auto-scroll console output
    useEffect(() => {
        if (consoleOutputRef.current) {
            consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight;
        }
    }, [consoleOutput]);

    // Log to console output
    const logToConsole = useCallback((message, isError = false) => {
        const timestamp = new Date().toISOString().slice(11, 19);
        const newEntry = {
            timestamp,
            message,
            isError,
            id: Date.now() + Math.random()
        };

        setConsoleOutput(prev => [...prev, newEntry]);
    }, []);

    // Update test result in state
    const updateTestResult = useCallback((testName, status, details = '', results = null) => {
        setTestResults(prev => {
            const index = prev.findIndex(t => t.name === testName);

            if (index >= 0) {
                // Update existing test
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    status,
                    details,
                    results: results || updated[index].results
                };
                return updated;
            } else {
                // Add new test result
                return [...prev, {
                    name: testName,
                    status,
                    details,
                    results,
                    timestamp: new Date().toISOString()
                }];
            }
        });
    }, []);

    // Run specific test
    const runSpecificTest = useCallback(async (testName) => {
        if (isRunningRef.current) return;

        setIsRunning(true);
        isRunningRef.current = true;
        logToConsole(`Starting ${testName}...`);

        // Add running state to test results
        updateTestResult(testName, 'running', 'Test in progress...');

        try {
            let result;
            switch (testName) {
                case 'Single Tool Test':
                    result = await testSuite.testSingleToolCall();
                    break;
                case 'Sequential Test':
                    result = await testSuite.testMultipleSequentialTools();
                    break;
                case 'Iterative Test':
                    result = await testSuite.testIterativeToolUsage();
                    break;
                case 'Mixed Tools Test':
                    result = await testSuite.testMixedToolTypes();
                    break;
                case 'Error Handling Test':
                    result = await testSuite.testErrorHandling();
                    break;
                default:
                    throw new Error('Unknown test');
            }

            // Get the latest result from test suite
            const testSuiteResults = testSuite.testResults || [];
            const latestResult = testSuiteResults[testSuiteResults.length - 1];

            if (latestResult) {
                const status = latestResult.status || 'unknown';
                const details = latestResult.details || 'Completed';

                updateTestResult(testName, status, details, result);
                logToConsole(`${testName} completed with status: ${status}`);
            } else {
                updateTestResult(testName, '✅ PASS', 'Completed successfully', result);
                logToConsole(`${testName} completed successfully`);
            }

        } catch (error) {
            console.error(`Error running ${testName}:`, error);
            updateTestResult(testName, '❌ FAIL', error.message || 'Unknown error');
            logToConsole(`Error running ${testName}: ${error.message}`, true);
        } finally {
            setIsRunning(false);
            isRunningRef.current = false;
        }
    }, [logToConsole, updateTestResult]);

    // Run all tests sequentially
    const runAllTests = useCallback(async () => {
        if (isRunningRef.current) return;

        setIsRunning(true);
        isRunningRef.current = true;

        // Clear previous results
        setTestResults([]);
        setConsoleOutput([]);
        setSummary({ passed: 0, failed: 0, total: 0, show: false });
        logToConsole('Initializing test suite...');

        const tests = [
            { name: 'Single Tool Test', method: testSuite.testSingleToolCall.bind(testSuite) },
            { name: 'Sequential Test', method: testSuite.testMultipleSequentialTools.bind(testSuite) },
            { name: 'Iterative Test', method: testSuite.testIterativeToolUsage.bind(testSuite) },
            { name: 'Mixed Tools Test', method: testSuite.testMixedToolTypes.bind(testSuite) },
            { name: 'Error Handling Test', method: testSuite.testErrorHandling.bind(testSuite) }
        ];

        const totalTests = tests.length;

        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            setProgress((i / totalTests) * 100);

            logToConsole(`Running ${test.name}...`);
            updateTestResult(test.name, 'running', 'Test in progress...');

            try {
                const result = await test.method();

                // Get the latest result from test suite
                const testSuiteResults = testSuite.testResults || [];
                const latestResult = testSuiteResults[testSuiteResults.length - 1];

                if (latestResult) {
                    updateTestResult(test.name, latestResult.status || 'unknown', latestResult.details || 'Completed', result);
                    logToConsole(`${test.name} completed`);
                } else {
                    updateTestResult(test.name, '✅ PASS', 'Completed successfully', result);
                    logToConsole(`${test.name} completed successfully`);
                }
            } catch (error) {
                console.error(`Error running ${test.name}:`, error);
                updateTestResult(test.name, '❌ FAIL', error.message || 'Unknown error');
                logToConsole(`${test.name} failed: ${error.message}`, true);
            }
        }

        // Final update
        setProgress(100);
        logToConsole(`All tests completed!`);

        setIsRunning(false);
        isRunningRef.current = false;
    }, [logToConsole, updateTestResult]);

    // Clear test results
    const clearResults = useCallback(() => {
        setTestResults([]);
        setConsoleOutput([]);
        setSummary({ passed: 0, failed: 0, total: 0, show: false });
        setProgress(0);
        logToConsole('Test results cleared');
    }, [logToConsole]);

    return (
        <section className='fixed z-50 flex justify-center items-center w-full h-full leading-loose text-[#333] m-auto p-4 backdrop-brightness-50'>
            <div className='bg-white w-full max-w-6xl border-4 rounded-lg p-6 h-[95vh] overflow-y-auto scrollbar-custom'>
                <div className="header bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg mb-6 p-4 text-center">
                    <h1 className='text-2xl font-bold mb-2'>🚀 Intellidesk Tool Calling Test Suite</h1>
                    <p className='text-blue-100'>Comprehensive testing for AI tool integration</p>
                </div>

                <div className="test-container bg-white rounded-lg p-6 shadow-lg mb-6">
                    <h2 className='text-xl font-bold text-gray-800 mb-4'>🧪 Test Suite Controls</h2>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={runAllTests}
                            disabled={isRunning}
                            className='bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium'
                        >
                            {isRunning ? 'Running...' : 'Run All Tests'}
                        </button>

                        {['Single Tool Test', 'Sequential Test', 'Iterative Test', 'Mixed Tools Test', 'Error Handling Test']
                            .map(testName => (
                                <button
                                    key={testName}
                                    onClick={() => runSpecificTest(testName)}
                                    disabled={isRunning}
                                    className='bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium'
                                >
                                    {testName}
                                </button>
                            ))}

                        <button
                            onClick={clearResults}
                            className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium'
                        >
                            Clear Results
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {summary.show && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex gap-2 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-600">{summary.passed}</div>
                                <div className="text-green-800 font-medium">Passed</div>
                            </div>
                            <div className="flex gap-2  bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-red-600">{summary.failed}</div>
                                <div className="text-red-800 font-medium">Failed</div>
                            </div>
                            <div className="flex gap-2  bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
                                <div className="text-blue-800 font-medium">Total</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="test-container mb-6">
                    <h2 className='text-xl font-bold text-gray-800 mb-4'>📊 Test Results</h2>
                    <div className="space-y-3">
                        {testResults.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No test results yet. Run some tests to see results here.
                            </div>
                        ) : (
                            testResults.map((test, index) => (
                                <ResultCard key={`${test.name}-${index}-${test.timestamp || ''}`} test={test} />
                            ))
                        )}
                    </div>
                </div>

                <div className="test-container">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className='text-xl font-bold text-gray-800'>💻 Console Output</h2>
                        <button
                            onClick={() => setConsoleOutput([])}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear Console
                        </button>
                    </div>
                    <div
                        ref={consoleOutputRef}
                        className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono h-64 overflow-y-auto whitespace-pre-wrap text-sm"
                    >
                        {consoleOutput.length === 0 ? (
                            <div className="text-gray-500 italic">Console output will appear here...</div>
                        ) : (
                            consoleOutput.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`mb-1 ${entry.isError ? 'text-red-400' : 'text-green-400'}`}
                                >
                                    <span className="text-gray-500">[{entry.timestamp}]</span>{' '}
                                    {entry.isError ? '❌' : '✅'} {entry.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const ResultCard = ({ test }) => {
    const status = test.status?.toLowerCase() || '';

    const getStatusStyles = () => {
        if (status.includes('running')) {
            return {
                bg: 'bg-yellow-50',
                border: 'border-yellow-300',
                text: 'text-yellow-800'
            };
        } else if (status.includes('pass')) {
            return {
                bg: 'bg-green-50',
                border: 'border-green-300',
                text: 'text-green-800'
            };
        } else if (status.includes('fail')) {
            return {
                bg: 'bg-red-50',
                border: 'border-red-300',
                text: 'text-red-800'
            };
        }
        return {
            bg: 'bg-gray-50',
            border: 'border-gray-300',
            text: 'text-gray-800'
        };
    };

    const styles = getStatusStyles();

    return (
        <div className={`p-4 rounded-lg border-l-4 ${styles.bg} ${styles.border} ${styles.text}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-bold text-lg mb-1">{test.name}</div>
                    <div className="text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`font-bold ${status.includes('pass') ? 'text-green-600' :
                                status.includes('fail') ? 'text-red-600' :
                                    status.includes('running') ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                            {test.status}
                        </span>
                    </div>
                    {test.details && (
                        <div className="text-sm mt-1">
                            <span className="font-medium">Details:</span> {test.details}
                        </div>
                    )}
                    {test.timestamp && (
                        <div className="text-xs text-gray-500 mt-2">
                            {new Date(test.timestamp).toLocaleTimeString()}
                        </div>
                    )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.includes('pass') ? 'bg-green-100 text-green-800' :
                        status.includes('fail') ? 'bg-red-100 text-red-800' :
                            status.includes('running') ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {status.includes('running') ? 'RUNNING' :
                        status.includes('pass') ? 'PASS' :
                            status.includes('fail') ? 'FAIL' : 'UNKNOWN'}
                </div>
            </div>

            {test.results && typeof test.results === 'object' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <details>
                        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                            View Test Results
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(test.results, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};
