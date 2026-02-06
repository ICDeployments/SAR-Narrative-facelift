import React from "react";
// Import the external CSS file
import "./Dashboard.css";
import { PreprocessorLogs } from "../components/preprocessorLogs";
import { useAppContext } from "../context/AppContext";

const AgentActivityCard = () => {
  const { state, dispatch, isProcessing } = useAppContext();

  return (
    <div className="card-container activity-card">
      <h2 className="card-title">Agent Activity</h2>
      <p className="card-subtitle">
        View real-time processing details for uploaded files
      </p>

      <div className="activity-content-area">
        {/* {(state.isProcessing && !state.success) ? <PreprocessorLogs /> :<p className="activity-placeholder-text">
                    Upload to view real-time processing details for uploaded files
                </p>}  */}
        {!state.isProcessing && !state.success ? (
          <>
            <p className="activity-placeholder-text">
              Upload to view real-time processing details for uploaded files
            </p>
          </>
        ) : (
          /* The original display logic for processing logs */
          <PreprocessorLogs />
        )}
      </div>
    </div>
  );
};

export default AgentActivityCard;
