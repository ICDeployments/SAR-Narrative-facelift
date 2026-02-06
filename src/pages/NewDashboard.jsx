import React from "react";
import "./NewDashboard.css";
import UploadTransactionCard from "./UploadTransactionCard";
import AgentActivityCard from "./AgentActivityCard";
import Navbar from "./Navbar";
import SuspiciousTransactionDashboard from "./SuspiciousTransactionDashboard.jsx";
import { useAppContext } from "../context/AppContext";
import ReportGen from "./ReportGen.jsx";
import {} from "lucide-react";

const NewDashboard = () => {
  const { state } = useAppContext(); // Access the application state

  // Determine which content to display
  const isContentReady = state.firstPageSuccess; // Use the success flag from the context
  const isGenerateSAR = state.generateSAR; // New flag for SAR generation button click

  const MainContent = () => {
    if (!isContentReady) {
      // Initial state: Upload needed
      return (
        <>
          <div className="page-header">
            <p className="dashbaord-heading">SAR Generation</p>
            <p className="dashbaord-sub-heading">
              Upload your transaction data file to begin the automated
              suspicious activity process
            </p>
          </div>
          <div className="dashboard-container">
            <div className="content-row">
              <UploadTransactionCard />
              <AgentActivityCard />
            </div>
          </div>
        </>
      );
    } else if (isGenerateSAR) {
      return <ReportGen />;
    } else {
      // Content ready BUT SAR button not yet clicked
      return <SuspiciousTransactionDashboard />;
    }
  };

  return (
    <div className="sar-container">
      {/* 1. Navbar remains always visible */}
      <Navbar />

      {/* 2. Main Content is conditionally rendered */}
      <div className="main-content-area">
        <MainContent />
      </div>
    </div>
  );
};

export default NewDashboard;













