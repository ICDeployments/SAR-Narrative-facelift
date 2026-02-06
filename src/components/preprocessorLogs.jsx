import React, { useState, useEffect, useRef } from 'react';
import './PreprocessorLogs.css'; // Keep the external CSS for styling

const MOCKED_LOGS = [
    { delay: 500, message: "Loading data to begin our analysis.", progress: 25 }, // Renamed 'time' to 'delay' for clarity
    { delay: 2500, message: "Scanning transactions for suspicious patterns now.", progress: 50 }, // Corrected time to be a delta (4500 = 5000 - 500)
    { delay: 2000, message: "Now pulling essential transaction data fields.", progress: 75 }, // Corrected time to be a delta (2000 = 7000 - 5000)
    { delay: 3000, message: "Data is ready for analysis now.", progress: 100 }, // Corrected time to be a delta (3000 = 10000 - 7000)
];

const FINAL_LOG_MESSAGE = "Data is ready for analysis now."; // This variable is not used but kept for context

const formatLogMessage = (logString) => {
    // This function looks fine, assumes log strings might contain "Agent: **...**"
    return logString.replace(/Agent: \*\*([^\n]*)\*\*\n/, '').trim();
};

export const PreprocessorLogs = () => {
    const [progress, setProgress] = useState(0);
    const [messages, setMessages] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const logsEndRef = useRef(null);
    const timerRefs = useRef([]);
    // const { state, dispatch } = useAppContext(); // Keep or remove based on your app's needs. Removed for cleaner example.

    const scrollToBottom = () => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const startMockProcess = () => {
        setProgress(0);
        setMessages([]);
        setIsFinished(false);

        let cumulativeDelay = 0;

        // Cleanup previous timers
        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];

        MOCKED_LOGS.forEach((log, index) => {
            // Calculate the total time from the start of the process
            cumulativeDelay += log.delay; // Use log.delay (which is the difference)
            
            // FIX 2: Check for the last log and ensure the message and progress are set.
            const isLastLog = index === MOCKED_LOGS.length - 1;

            const timerId = setTimeout(() => {
                // This state update makes the log appear sequentially
                setMessages(prev => {
                    // FIX 3: Ensure the last message is included. Your original code's issue with 
                    // the 4th log was a side effect of the incorrect cumulative delay calculation.
                    return [...prev, log.message];
                });
                
                // This state update handles the progress bar
                setProgress(log.progress);
                
                if (isLastLog) {
                    setIsFinished(true);
                }
            }, cumulativeDelay); // Use the cumulative delay

            timerRefs.current.push(timerId);
        });
    };

    useEffect(() => {
        startMockProcess();
        // This cleanup function will clear timers if the component unmounts
        return () => timerRefs.current.forEach(clearTimeout);
    }, []); // Empty dependency array ensures it runs only on mount.

    // 2. SCROLL TO BOTTOM ON MESSAGE UPDATE
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const progressText = isFinished ? "100%" : `${progress}%`;
    const progressBarWidth = isFinished ? 100 : progress;
    
    return (
        <div className="preprocessor-panel">
            
            {/* Status and Progress Bar */}
            <div className="status-progress-container">
                <div className="status-header">
                    <span>
                        {isFinished ? 'Completed' : 'Processing'}
                    </span>
                    <span>
                        {progressText}
                    </span>
                </div>
                <div className="progress-track">
                    <div
                        className="progress-filler"
                        style={{ width: `${progressBarWidth}%` }}
                    ></div>
                </div>
            </div>

            {/* Agent Activity Block (Green Box) */}
            <div className="agent-activity-block">
                <h3>
                    Preprocessor & Flagging Agent
                </h3>
                <p>
                    Prepares and flags data for SAR report generation
                </p>
            </div>
            
            {/* Live Commentary/Log Stream (Bulleted list) */}
            <div className="log-stream-container"> 
                <ul className="log-list">
                    {messages.map((log, index) => ( 
                        <li
                            key={index}
                        >
                            {formatLogMessage(String(log))}
                        </li>
                    ))}
                    <div ref={logsEndRef} />
                </ul>
            </div>
            
            {isFinished && (
                <div className="mt-6 text-center">
                    {/* ... (Rerun button placeholder) ... */}
                </div>
            )}
        </div>
    );
};

export default PreprocessorLogs;