
import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import "./useLiveAgentLogs.css";

const WEBSOCKET_ENDPOINT =
  "wss://m2rhyan9ta.execute-api.us-west-2.amazonaws.com/production";

const formatLogMessage = (logString) => {
    const regex = /Agent: \*\*([^\n]*)\n/g; 
    // const regex = /Agent: \*\*([^\*]+)\*\*\s*\nDescription: ([^\n]+)\n/g;
    // An array to hold all the rendered elements (strings, <strong>, <br />)
    const parts = [];
    let lastIndex = 0;
    
    // Use the regex's exec method to iterate through all matches
    let match;
    while ((match = regex.exec(logString)) !== null) {
        const fullMatch = match[0]; // e.g., 'Agent: **Tool Agent**\n'
        const agentName = match[1]; // e.g., 'Tool Agent'
        const matchIndex = match.index;

        // 1. Add the text *before* the match (if any)
        if (matchIndex > lastIndex) {
            parts.push(logString.substring(lastIndex, matchIndex));
        }

       parts.push(
  <div // Block element takes full width and holds the background color
    key={`agent-section-${matchIndex}`}
    style={{
      backgroundColor: '#DFFFDC', // Applies the full-width green background
      // Optional: Add some padding to match the visual spacing in the screenshot
      padding: '5px 0', 
    }}
  >
    <span // Agent Name - now inside the full-width background container
      key={`agent-name-${matchIndex}`}
      style={{
        fontSize: '16px',
        color: '#000048',
        fontWeight: '600',
        // Removed backgroundColor here, as it's on the parent <div>
      }}
    >
      {agentName}
    </span>
  </div>
);

        // 5. Update the index to start searching after the full match
        lastIndex = matchIndex + fullMatch.length;
    }

    // 6. Add any remaining text *after* the last match
    if (lastIndex < logString.length) {
        parts.push(logString.substring(lastIndex));
    }

    // Replace any remaining literal \n with <br /> for multi-line descriptions
    return parts.flatMap((part, index) => {
        if (typeof part === 'string' && part.includes('\n')) {
            const lines = part.split('\n');
            return lines.flatMap((line, i) => [
                line, 
                i < lines.length - 1 ? <br key={`line-break-${index}-${i}`} /> : null
            ]).filter(Boolean); // Remove nulls
        }
        return part;
    });
};

// const formatLogMessage = (logString) => {
//   // Regex to capture the Agent Name and Description, followed by an optional newline/content.
//   // This regex assumes the structure: Agent: **AgentName**\nDescription: [Description]\n
//   // We use non-greedy matching .*?
//   const regex = /Agent: \*\*([^\*]+)\*\*\s*\nDescription: ([^\n]+)\n/g;

//   const parts = [];
//   let lastIndex = 0;
//   let match;

//   // --- 1. Process Agent Headers and Descriptions ---
//   while ((match = regex.exec(logString)) !== null) {
//     const fullMatch = match[0]; // e.g., 'Agent: **Name**\nDescription: ...\n'
//     const agentName = match[1].trim(); // e.g., 'Preprocessor & Flagging Agent'
//     const description = match[2].trim(); // e.g., 'Prepares and flags data for SAR report generation.'
//     const matchIndex = match.index;

//     // 1a. Add the text (logs/separators) *before* the match (if any)
//     if (matchIndex > lastIndex) {
//       parts.push(logString.substring(lastIndex, matchIndex));
//     }

//     // 1b. Add the styled Agent Header/Description block
//     parts.push(
//       <div
//         key={`agent-section-${matchIndex}`}
//         style={{
//           backgroundColor: '#DFFFDC', // Light Green background
//           padding: '10px 15px', // Top/Bottom padding for visual separation
//           marginBottom: '10px', // Space after the green block
//           borderRadius: '5px', // Optional: slight rounding for modern feel
//         }}
//       >
//         <div // Agent Name (Bold, Navy)
//           style={{
//             fontSize: '18px', // Slightly larger
//             color: '#000048', // Navy color
//             fontWeight: '700', // Extra bold
//             marginBottom: '5px', // Space between name and description
//           }}
//         >
//           {agentName}
//         </div>
//         <div // Description (Regular text)
//           style={{
//             fontSize: '14px',
//             color: '#333', // Darker text for readability
//           }}
//         >
//           {description}
//         </div>
//       </div>
//     );

//     // 1c. Update the index to start searching after the full match
//     lastIndex = matchIndex + fullMatch.length;
//   }

//   // --- 2. Add any remaining text/logs *after* the last match ---
//   if (lastIndex < logString.length) {
//     parts.push(logString.substring(lastIndex));
//   }
//   
//   // --- 3. Format Logs and Text ---
//   // Now, parts contains a mix of React elements (the headers) and strings (the logs/separators).
//   // We process the strings to handle new lines, the dotted list, and the separator.
//   return parts.flatMap((part, index) => {
//     if (typeof part === 'string') {
//       // Split the string by new lines
//       const lines = part.split('\n');

//       return lines.flatMap((line, i) => {
//         // Trim whitespace for consistent logic
//         const trimmedLine = line.trim();

//         if (!trimmedLine) {
//           // Handle empty lines with a small space instead of a full <br>
//           return i < lines.length - 1 ? <div key={`empty-${index}-${i}`} style={{ height: '5px' }} /> : null;
//         }

//         // Check for the list item pattern: starts with '-' or '*'
//         if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
//           // The logs are dotted (bulleted) and indented
//           const logContent = trimmedLine.substring(2); // Remove '- ' or '* '
//           return (
//             <div 
//               key={`log-item-${index}-${i}`}
//               style={{
//                 display: 'flex',
//                 alignItems: 'flex-start',
//                 color: '#333', // Dark text color
//                 fontSize: '14px',
//                 lineHeight: '1.5',
//                 paddingLeft: '15px', // Indentation for logs
//               }}
//             >
//               <span style={{ marginRight: '8px', fontSize: '18px', marginTop: '-4px' }}>•</span> 
//               <span>{logContent}</span>
//             </div>
//           );
//         } else if (trimmedLine.startsWith('---') || trimmedLine.startsWith('=====')) {
//           // Handle the separator lines
//           return (
//             <hr 
//               key={`separator-${index}-${i}`} 
//               style={{ 
//                 border: 'none', 
//                 borderTop: '1px solid #ddd', 
//                 margin: '10px 0' 
//               }} 
//             />
//           );
//         } else {
//           // Simple text line (e.g., Data is ready for SAR analysis.)
//           return (
//             <div key={`text-line-${index}-${i}`} style={{ paddingLeft: '15px', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
//               {trimmedLine}
//             </div>
//           );
//         }
//       }).filter(Boolean); // Remove nulls

//     }
//     return part;
//   });
// };

export const AiActivityPanel  = React.memo(() =>{
  // ⭐️ Correctly access state directly from the AppContext
  const { state, dispatch } = useAppContext();
const [progress, setProgress] = useState(0);
  const { fileName, generateSAR } = state;
  // Use fileName as the criteriaKey, as it's the identifier available in state
  const criteriaKey = fileName;
  // State for live commentary logs and WebSocket status
  const [liveLogs, setLiveLogs] = useState([]);
  const [wsStatus, setWsStatus] = useState("");
  const socketRef = useRef(null);

//   const shouldConnect = isProcessing && criteriaKey;
const shouldConnect = generateSAR && criteriaKey;

  // --- Core WebSocket Connection Logic ---
  useEffect(() => {
    // 1. Disconnect/Idle Logic
    if (!shouldConnect) {
      // setWsStatus("Idle");
      // Only close if a socket is open or connecting
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        socketRef.current.close(1000, "Process ended or key missing");
      }
      socketRef.current = null;

      // Clear logs only when completely idle (not processing, no key)
//       if (!isProcessing && !criteriaKey) {
//         setLiveLogs([]);
//       }
      return;
    }

    // 2. Connect Logic
    setWsStatus("Connecting...");
    const socket = new WebSocket(WEBSOCKET_ENDPOINT);
    socketRef.current = socket;

    socket.onopen = () => {
      setWsStatus("Connected");

      const subscriptionMessage = {
        action: "subscribeToLogs",
        // Use criteriaKey (which is fileName) for subscription
        criteriaFileKey: criteriaKey,

      };
      socket.send(JSON.stringify(subscriptionMessage));
      setLiveLogs((prev) => [
        ...prev,
//         `[INIT] Subscribed to logs for file: ${criteriaKey}`,
      ]);
    };

    socket.onmessage = (event) => {
      let logMessage = event.data;
      let finalStatus = null;

      try {
        // Attempt to parse JSON to look for a 'message' and 'status'
        const data = JSON.parse(event.data);
        logMessage = data.message || JSON.stringify(data);

        if (data.status) {
          finalStatus = data.status; // e.g., 'completed', 'error'
        }
//         if (typeof data.progress === "number" && dispatch) {
//           dispatch({ type: "SET_PROGRESS", payload: data.progress });
//         }
if (typeof data.progress === "number") {
                    setProgress(data.progress); 
                }
      } catch (e) {
      }

      // Add the new log to the state
      setLiveLogs((prevLogs) => [...prevLogs, logMessage]);

      // Auto-close on final status messages
      if (finalStatus === "completed") {
        setLiveLogs((prevLogs) => [
          ...prevLogs,
          "[STATUS] Process Completed. Closing stream.",
        ]);
        socketRef.current?.close(1000, "Process Completed");
      } else if (finalStatus === "error") {
        setLiveLogs((prevLogs) => [
          ...prevLogs,
          // "[STATUS] Process Error. Closing stream.",
        ]);
        socketRef.current?.close(1001, "Process Error");
      }
    };

    socket.onerror = (e) => {
      // setWsStatus("Error");
      setLiveLogs((prev) => [
        ...prev,
        // "[ERROR] WebSocket connection error. Check network.",
      ]);
      console.error("WebSocket Error:", e);
    };

    socket.onclose = (event) => {
      // setWsStatus("Disconnected");
//       console.log("WebSocket closed.", event.code);
      if (event.code !== 1000) {
        setLiveLogs((prev) => [
          ...prev,
          // `[ERROR] Stream closed unexpectedly (Code: ${event.code}).`,
        ]);
      }
    };

    // Cleanup: Close the WebSocket connection
    return () => {
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
    // console.log("CLEANUP: Closing socket (dependency changed)");
        socketRef.current.close(1000, "Component Unmount/Cleanup");
      }
      socketRef.current = null;
    };
  }, 
// [shouldConnect, criteriaKey, isProcessing]);
[shouldConnect, criteriaKey, setLiveLogs]);

  // Effect to scroll to the bottom whenever liveLogs updates
//   useEffect(() => {
//     scrollToBottom();
//   }, [liveLogs]);

  // --- RENDER LOGIC ---

  // Check for idle state based on global state
//   const isIdle = !fileName && !isProcessing && liveLogs.length === 0;
const isIdle = !state.generateSAR;

//   const overallStatus = isProcessing
//     ? "Processing"
//     : error
//     ? "Error"
//     : liveLogs.some((log) => String(log).includes("Completed"))
//     ? "Completed"
//     : "Completed";
const overallStatus = "Processing";

  const emoji =
    overallStatus === "Completed"
      ? ""
      : overallStatus === "Error"
      ? "❌"
      : overallStatus === "Processing"
      ? ""
      : "⚪";

  const progressText =
    overallStatus === "Completed"
      ? "100%"
      : overallStatus === "Error"
      ? "100%"
      : overallStatus === "Processing"
      ? `${progress}%`
// ? "20%"
      : "0%";

  const progressBarWidth =
    overallStatus === "Processing"
      ? progress// Use the 'progress' from the global state
      : overallStatus === "Completed" || overallStatus === "Error"
      ? 100
      : 0;

  // ... (Rest of the return structure is the same)
  return (
    <div className="ai-activity-panel">
      <div className="ai-header">
      </div>

      {isIdle ? (
        // 1. IDLE STATE: Placeholder
        <div className="activity-feed">
          <div
            className="activity-item placeholder"
            style={{
              textAlign: "center",
              padding: "20px",
              border: "1px dashed #ccc",
              color: "#666",
            }}
          >
{/*             <div className="activity-desc">
              The **live log stream** will appear here once an upload process
              starts.
            </div> */}
          </div>
        </div>
      ) : (
        // 2. ACTIVE/COMPLETED/ERROR STATE: Single Log View
        <>
          <div className="ai-fixed-header">
            {/* Overall Status Box */}
            <div className={`activity-item ${overallStatus.toLowerCase()}`}>
              <div className="activity-title">
                <span className="process-stream-container">
                </span>
              </div>
              <div className="activity-time">
                 {overallStatus} • {progressText}
              </div>
              <div className="progress-bar-sidebar">
                <div
                  className="progress-fill-sidebar"
                  style={{ width: `${progressBarWidth}%` }}
                ></div>
              </div>
            </div>
            <hr
              style={{
                margin: "10px 0 10px 0",
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </div>

          {/* Live Log Stream Container */}
          <div className="activity-feed live-log-stream live-log-stream-scroll">

{liveLogs.map((log, index) => (
  <li
    key={index}
    style={{
      margin: "5px 0",
      fontSize: "14px", // 14px
      fontWeight: 400, // weight 400
      color: "#000048", // color #000048
      whiteSpace: "pre-wrap",}}
  >
   • {formatLogMessage(String(log))}
  </li>
))}
{/*             <div ref={logsEndRef} /> */}
          </div>
        </>
      )}
    </div>
  );
});






