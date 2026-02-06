import React, { useEffect, useState, useCallback, useRef } from "react";
import './ReportGen.css';
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { AiActivityPanel } from "../components/useLiveAgentLogs"; 
import { processSarReport } from './sarProcessor'; 
import { FaEdit, FaTimes, FaArrowLeft } from 'react-icons/fa'; 
import SaveIcon from '../assets/Save.png'; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Upload from '../assets/Upload.png'; 
import Download from '../assets/Download.png'; 
import ConfirmationModal from './ConfirmationModal.jsx';
import "pdfmake/build/vfs_fonts";

const SAR_URL =
  "https://b8brstn7hh.execute-api.us-west-2.amazonaws.com/development/generate_sar_narrative";
const Evaluator_URL =
  "https://5y1669gjwa.execute-api.us-west-2.amazonaws.com/developer/generate_sar_evaluator";
const Formatter_URL =
  "https://n9z82rwepa.execute-api.us-west-2.amazonaws.com/Formatter/Sar_Formatter";


const initialReports = [
  {
    partyId: "53660",
    accountHolder: "John Martinez",
    amount: "$ 70,122",
    reason: "Unusually large transaction amount",
    status: "Pending", // Must be Pending for generation to start
    sarReport: null,
  },
  {
    partyId: "53661",
    accountHolder: "Michael Brown",
    amount: "$ 18,600",
    reason: "Canceling transactions to evade report...",
    status: "Pending",
    sarReport: null,
  },
];

const TransactionCard = ({ partyId, accountHolder, amount, reason, status, isActive, isViewed, onClick }) => (
  <div 
    className={`transaction-card ${isActive ? 'active' : ''} ${status === 'Completed' && isViewed ? 'completed-viewed' : ''}`}
    onClick={onClick}
  >

<div className="transaction-header">
    {/* New group container for left-aligned items */}
    <div className="party-info-group"> 
        {/* 1. New placement for the Green Checkmark */}
        {status === 'Completed' && isViewed && (
            <div className="status-tick-icon" title="Report Reviewed">
                <span className="tick-box">✓</span>
            </div>
        )}
        <span className="party-id">Party ID:
            <span className="party-id-no"> {partyId} </span>
        </span>
    </div> {/* End of party-info-group */}
    
    {status === 'Completed' && isViewed ? (
        <a href="#" className="view-report-link" onClick={(e) => { e.stopPropagation(); onClick(partyId); }}>View Report</a>
    ) : (
        <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
        </span>
    )}
</div>
        <hr
            style={{
                margin: "5px 0 -5px 0",
                borderTop: "2px solid #D9EBFF",
            }}
        />
    <div className="transaction-details">
      <p className="flex-details">
        <strong>Account Holder:</strong> 
<span className="detail-value">{accountHolder}</span>
      </p>
      <p className="flex-details">
        <strong>Amount:</strong> 
<span className="detail-value amount">{amount}</span>
      </p>
    </div>
  <div className="reason-section">
    Reason:
      <div className="reason-text">{reason}</div>
</div>
    
  </div>
);

const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
        chunked.push(arr.slice(i, i + size));
    }
    return chunked;
};

const ReportEditor = ({ content, onContentChange }) => {
    return (
        <div className="report-editor-container">
            <textarea
                className="report-editor-textarea"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={40} 
            />
        </div>
    );
};

// Assuming SarReportDisplay is correctly defined based on previous response
const SarReportDisplay = ({ activeReport }) => {
    if (!activeReport || !activeReport.sarReport) {
        return <div>No SAR report data available.</div>;
    }
    const structuredData = processSarReport(activeReport.sarReport);
    // const partAHeading = 'Profile details of the account holder related to flagged transactions :';
    const partAHeading = 'PART A: PARTICULARS OF PERSON BEING REPORTED AS A PARTY TO ACTIVITY/ATTEMPTED TRANSACTION';

    return (
        <div className="sar-report-container">
            {structuredData.map((part, index) => {
                const isPartA = part.heading === partAHeading;
                const isPartC = part.partKey === 'PART C';
                const partCStyle = isPartC ? { backgroundColor: '#F0F7FF', padding: '10px' } : {};
                const dataItems = part.data.filter(item => item.key);
                const nonDataItems = part.data.filter(item => !item.key);
                const chunkedData = isPartA ? chunkArray(dataItems, 2) : dataItems.map(item => [item]);
                
                return (
                    <div key={index} className="sar-report-section" style={partCStyle}>
                        <h2 className="sar-heading">{part.heading}</h2>
                        <table className="sar-content-table">
                            <tbody>
                                {chunkedData.map((rowItems, rowIndex) => (
                                    <tr key={rowIndex} className="sar-data-row">
                                        {rowItems.map((item, itemIndex) => (
                                            <React.Fragment key={itemIndex}>
                                                <td className={`sar-key-cell ${isPartA ? 'sar-key-cell-part-a' : ''}`}>
                                                    {item.key}
                                                </td>
                                                <td className="sar-separator-cell">:</td>
                                                <td className={`sar-value-cell ${isPartA ? 'sar-value-cell-part-a' : ''}`}>
                                                    {item.value}
                                                </td>
                                            </React.Fragment>
                                        ))}
                                        {isPartA && rowItems.length === 1 && (
                                            <>
                                                <td className="sar-key-cell-empty"></td>
                                                <td className="sar-separator-cell-empty"></td>
                                                <td className="sar-value-cell-empty"></td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {nonDataItems.map((item, itemIndex) => (
                                    <tr key={`non-data-${itemIndex}`}>
                                        <td colSpan={isPartA ? "6" : "3"} className="sar-full-content-cell">
                                            {item.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {index < structuredData.length - 1 && <hr className="section-divider" />}
                    </div>
                );
            })}
        </div>
    );
};
// ... (End of shared components) ...


// **REVISED ReportGen Component**
const ReportGen = () => {
  const { state, dispatch } = useAppContext();
  const { error, generateSAR } = state;
  const toggleSAR = generateSAR;
const [isModalOpen, setIsModalOpen] = useState(false);
// Add this with your other useState hooks
const [modalMode, setModalMode] = useState(null); // 'BACK_TO_DASHBOARD' or 'NEW_UPLOAD'
const [confirmButtonLabel, setConfirmButtonLabel] = useState("Upload File");

  // 1. STATE FOR REPORTS
  const [reports, setReports] = useState(initialReports);
  const [activePartyId, setActivePartyId] = useState(initialReports[0].partyId);
  
  // This ref tracks if the API generation process is currently active.
  const isGeneratingRef = useRef(false);

  const handleModalConfirm = () => {
    if (modalMode === "BACK_TO_DASHBOARD") {
        // Only toggle the SAR view off, do not reset data
        dispatch({ type: "GENERATE_SAR_TOGGLE", payload: false });
    } 
    else if (modalMode === "NEW_UPLOAD") {
        // Perform a full application reset
        dispatch({ type: "RESET" });
    }
    // Cleanup
    setIsModalOpen(false);
    setModalMode(null); 
};

 // --- NEW BACK BUTTON HANDLER ---
const handleBackToDashboard = () => {
    setModalMode("BACK_TO_DASHBOARD");
    setConfirmButtonLabel("Back To Dashboard");
    setIsModalOpen(true);
};

// --- NEW UPLOAD TRIGGER ---
const handleNewUploadTrigger = () => {
    setModalMode("NEW_UPLOAD");
    setConfirmButtonLabel("Upload File");
    setIsModalOpen(true);
};

  const [isEditing, setIsEditing] = useState(false);
  const [editedReportContent, setEditedReportContent] = useState('');
  const [editingPartyId, setEditingPartyId] = useState(null); 
  
  // --- NEW SCROLL/VIEW STATE ---
  const [viewedReports, setViewedReports] = useState({});
  const reportDisplayRef = useRef(null); 
  // ---------------------------

  // Helper function to update a specific report's state
  const updateReport = useCallback((partyId, updates) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.partyId === partyId ? { ...report, ...updates } : report
      )
    );
  }, []);

    // Helper function to mark report as viewed
    const markReportAsViewed = useCallback((partyId) => {
        setViewedReports(prev => ({ ...prev, [partyId]: true }));
    }, []);


  // Scroll Handler to detect bottom scroll
  const handleScroll = () => {
      const element = reportDisplayRef.current;
      if (element) {
          if (element.scrollHeight - element.scrollTop <= element.clientHeight + 1) {
              if (activeReport && activeReport.status === 'Completed' && !viewedReports[activePartyId]) {
                  markReportAsViewed(activePartyId);
              }
          }
      }
  };


const runSarGeneration = useCallback(async () => {
    
    if (isGeneratingRef.current) {
        return;
    }
    
    // 1. Find the next PENDING report
    const nextPendingReport = reports.find(r => r.status === 'Pending');

    if (!toggleSAR || !nextPendingReport) {
        return; // Nothing to do
    }

    isGeneratingRef.current = true; // Set the flag to block re-entry
    const partyKey = nextPendingReport.partyId;

    // 2. IMMEDIATE STATUS UPDATE: Pending -> Processing
    // This is crucial to give immediate feedback and satisfy the useEffect logic.
    updateReport(partyKey, { status: "Processing" });

    try {
        let sarRes = "";
        let narrativeKey = "";

        // 3. SAR Narrative Agent
        sarRes = await axios.post(SAR_URL, {
            actionGroup: "SARNarrativeGenerationAction",
            function: "generateSarNarrative",
            parameters: [
                {
                    name: "party_key",
                    value: partyKey,
                },
            ],
        });
        narrativeKey = sarRes?.data?.response?.functionResponse?.responseBody?.TEXT?.filename;

        // 4. Evaluator Agent
        // Ensure narrativeKey is valid before proceeding
        if (!narrativeKey) {
            throw new Error("SAR Narrative generation failed: narrativeKey is missing.");
        }
        
        
        await axios.post(Evaluator_URL, {
                 Records: [
          {
            eventVersion: "2.1",
            eventSource: "aws:s3",
            awsRegion: "us-west-2",
            eventTime: "2025-07-23T06:27:51.667Z",
            eventName: "ObjectCreated:Put",
            userIdentity: {
              principalId:
                "AWS:AROAZKEI2MQEEUHRLYKN4:sar-narrative-generator-lambda",
            },
            requestParameters: {
              sourceIPAddress: "35.87.148.22",
            },
            responseElements: {
              "x-amz-request-id": "TS3P1C2FE1EPWF4R",
              "x-amz-id-2":
                "Mn6b8bQYoD03bZzXYS5mLSMwvDpB80o/kxY2KcS49BOf2U1fh0WqSX/uKZ+XAYnxJg3AhhOo6/8hAl9huAFVEDEciPbjyrwT",
            },
            s3: {
              s3SchemaVersion: "1.0",
              configurationId: "3f8bff3a-1b5d-4d71-b968-19aee36daa87",
              bucket: {
                name: "sar-mdus",
                ownerIdentity: {
                  principalId: "A3HHKXE1Z6KWY8",
                },
                arn: "arn:aws:s3:::sar-mdus",
              },
              object: {
                key: "sar-narrative/"+narrativeKey,
                // key: "sar-narrative/12345_sar_narrative_1753009250.txt",
                // key: "53660",
                size: 2889,
                eTag: "f7c0f2fcac0dddcbb5ee54f153b1bd7c",
                sequencer: "00688080E79DBB077A",
              },
            },
          },
        ],
        });

        // 5. Report Formatter Agent
        const formatterRes = await axios.post(Formatter_URL, {
            Records: [
          {
            eventVersion: "2.1",
            eventSource: "aws:s3",
            awsRegion: "us-west-2",
            eventTime: "2025-07-23T06:27:51.667Z",
            eventName: "ObjectCreated:Put",
            userIdentity: {
              principalId:
                "AWS:AROAZKEI2MQEEUHRLYKN4:sar-narrative-generator-lambda",
            },
            requestParameters: {
              sourceIPAddress: "35.87.148.22",
            },
            responseElements: {
              "x-amz-request-id": "TS3P1C2FE1EPWF4R",
              "x-amz-id-2":
                "Mn6b8bQYoD03bZzXYS5mLSMwvDpB80o/kxY2KcS49BOf2U1fh0WqSX/uKZ+XAYnxJg3AhhOo6/8hAl9huAFVEDEciPbjyrwT",
            },
            s3: {
              s3SchemaVersion: "1.0",
              configurationId: "3f8bff3a-1b5d-4d71-b968-19aee36daa87",
              bucket: {
                name: "sar-mdus",
                ownerIdentity: {
                  principalId: "A3HHKXE1Z6KWY8",
                },
                arn: "arn:aws:s3:::sar-mdus",
              },
              object: {
                key: "sar-narrative/"+narrativeKey,
                // key: "sar-narrative/12345_sar_narrative_1753009250.txt",
                // key: "53660",
                size: 2889,
                eTag: "f7c0f2fcac0dddcbb5ee54f153b1bd7c",
                sequencer: "00688080E79DBB077A",
              },
            },
          },
        ],
        });
        
        const data = formatterRes.data;
        let formatterText =
            data?.response?.functionResponse?.responseBody?.TEXT?.body ||
            `SAR Report for Party ID ${partyKey} successfully generated. (Formatter body was empty)`;
            // console.log("Full API Data:", formatterRes.data);
// console.log("Extracted Text:", formatterText);

        // 6. Final Status Update: Processing -> Completed
        updateReport(partyKey, { status: "Completed", sarReport: formatterText });
      
    } catch (err) {
        // 7. Error Handling: Processing -> Failed
        console.error(`SAR Generation Failed for ${partyKey}:`, err);
        // Log the full error response if available for debugging API issues
        if (axios.isAxiosError(err) && err.response) {
            console.error("Axios Response Data:", err.response.data);
        }
        updateReport(partyKey, { 
            status: "Failed", 
            sarReport: `Generation failed: ${err.message || 'Unknown error'}` 
        });
    } finally {
        isGeneratingRef.current = false; 
    }
}, [reports, toggleSAR, updateReport]);

// The useEffect hook now relies on the `reports` array changing 
// (which happens when a report moves from Pending -> Processing -> Completed)
// to trigger the check for the *next* Pending report.
  useEffect(() => {
    // Check if toggle is active AND if there is any report that is PENDING.
    // The internal logic of runSarGeneration handles the 'Processing' state.
    const hasPendingWork = reports.some(r => r.status === "Pending");
    
    if (toggleSAR && hasPendingWork) { 
        // console.log("Effect triggered. Checking for pending work...");
        runSarGeneration();
    }
  }, [toggleSAR, reports, runSarGeneration]); // Dependencies are now optimized


// --- PDF GENERATION CORE FUNCTION (Replicated from user's request) ---
const generatePdf = (reportContent, partyId) => {
    // Note: The original function assumes 'autoTable' is available globally/imported.
    const doc = new jsPDF();
    const marginLeft = 14;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.height;
    
    // Use the specific partyId in case of single download, or a generic name for multiple
    const filename = `SAR_Report_${partyId}.pdf`; 
    const localText = reportContent;
    // const currentNarrative is not available here, using localText as it is the content

    // --- HEADER ---
    doc.setFontSize(16).setFont("helvetica", "bold");
    doc.text("SUSPICIOUS ACTIVITY REPORT (SAR)", 105, 15, { align: "center" });

    doc.setFontSize(11).setFont("helvetica", "normal");
    doc.text("Generated Date: " + new Date().toLocaleDateString(), 105, 25, {
        align: "center",
    });

    let y = 40;

    // --- SPLIT LINES ---
    const lines = (localText || "") // Removed 'currentNarrative' as it's not defined here
        .split("\n")
        .filter((l) => l.trim() !== "");
    const partAIndex = lines.findIndex((l) => l.includes("PART A:"));
    const partBIndex = lines.findIndex((l) => l.includes("PART B:"));
    const partCIndex = lines.findIndex((l) => l.includes("PART C:"));

    // Guard clause if report structure is invalid
    if (partAIndex === -1 || partBIndex === -1 || partCIndex === -1) {
        console.error(`Invalid SAR Report structure for Party ID ${partyId}. Cannot generate PDF.`);
        alert(`Could not generate PDF for Party ID ${partyId}. Report structure is incomplete.`);
        return null;
    }

    // --- PART A HEADING (wrap properly) ---
    const partAHeading = lines[partAIndex].replace(/\*/g, "").trim();
    doc.setFontSize(12).setFont("helvetica", "bold");
    // Ensure doc.splitTextToSize is available (it is in standard jspdf)
    const wrappedHeadingA = doc.splitTextToSize(partAHeading, 180);
    doc.text(wrappedHeadingA, marginLeft, y);
    y += wrappedHeadingA.length * (lineHeight + 1) + 1;

    // --- PART A TABLE ---
    // Ensure we slice correctly: partAIndex + 1 up to but not including partBIndex
    let partAFields = lines.slice(partAIndex + 1, partBIndex).map((line) => {
        const match = line.split(/:(.+)/); // split only on first colon
        return [match[0].replace(/\*/g, "").trim(), (match[1] || "").trim()];
    });

    // Assume autoTable is accessible (globally or via import)
    autoTable(doc, {
        startY: y,
        head: [["Field", "Value"]],
        body: partAFields,
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    y = doc.lastAutoTable.finalY + 22;

    // --- PART B ---
    const partBHeading = lines[partBIndex].replace(/\*/g, "").trim();
    doc.setFontSize(12).setFont("helvetica", "bold");
    const wrappedHeadingB = doc.splitTextToSize(partBHeading, 180);
    // Check for page overflow before Part B heading
    if (y + wrappedHeadingB.length * lineHeight + 10 > pageHeight - 20) {
        doc.addPage();
        y = 20;
    }
    doc.text(wrappedHeadingB, marginLeft, y);
    y += wrappedHeadingB.length * lineHeight + 10;

    doc.setFontSize(11).setFont("helvetica", "normal");
    // Ensure we slice correctly: partBIndex + 1 up to but not including partCIndex
    const partBLines = lines.slice(partBIndex + 1, partCIndex);

    partBLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 180);

        if (y + wrapped.length * lineHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }

        doc.text(wrapped, marginLeft, y);
        y += wrapped.length * lineHeight + 2; // add spacing between items a,b,c,d
    });

    // --- PART C ---
    const partCHeading = lines[partCIndex].replace(/\*/g, "").trim();
    if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
    }
    else{
        y+=14; // increased space between Part B & C
    }
    doc.setFontSize(12).setFont("helvetica", "bold");
    const wrappedHeadingC = doc.splitTextToSize(partCHeading, 180);
    doc.text(wrappedHeadingC, marginLeft, y);
    y += wrappedHeadingC.length * lineHeight + 6; // increased space between Part B & C

    doc.setFontSize(11).setFont("helvetica", "normal");
    // Ensure we slice correctly: partCIndex + 1 until the end
    const partCLines = lines.slice(partCIndex + 1);

    partCLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 180);

        if (y + wrapped.length * lineHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }

        doc.text(wrapped, marginLeft, y);
        y += wrapped.length * lineHeight + 5;
    });

    // --- RETURN PDF DOC ---
    return { doc, filename };
};

// --- NEW DOWNLOAD HANDLER ---
const handleDownloadReport = () => {
    // 1. Identify which reports to download: only those completed and viewed
    const reportsToDownload = reports.filter(
        r => r.status === "Completed" && viewedReports[r.partyId] && r.sarReport
    );

    if (reportsToDownload.length === 0) {
        alert("No completed and viewed reports are available for download.");
        return;
    }

    if (reportsToDownload.length === 1) {
        // Single report download
        const report = reportsToDownload[0];
        const pdfData = generatePdf(report.sarReport, report.partyId);
        if (pdfData) {
            pdfData.doc.save(pdfData.filename);
        }
    } else {
        // Multiple reports download: Create a zip or download them sequentially
        // For simplicity and matching the spirit of the original single-file function,
        // we will download them sequentially (one after the other).
        
        reportsToDownload.forEach((report, index) => {
            const pdfData = generatePdf(report.sarReport, report.partyId);
            if (pdfData) {
                // Introduce a small delay to prevent browser issues with rapid sequential downloads
                setTimeout(() => {
                    pdfData.doc.save(pdfData.filename);
                }, 500 * index); 
            }
        });
        // alert(`Initiating download for ${reportsToDownload.length} reports.`);
    }
};


// --- EDITING HANDLERS (Kept as is) ---
const handleEditReport = () => {
    if (activeReport && activeReport.sarReport) {
        setIsEditing(true);
        setEditedReportContent(activeReport.sarReport);
        setEditingPartyId(activeReport.partyId);
    }
};

const handleSaveReport = () => {
    if (editingPartyId) {
        updateReport(editingPartyId, { sarReport: editedReportContent });
    }
    setIsEditing(false);
    setEditedReportContent('');
    setEditingPartyId(null);
};

const handleCancelEdit = () => {
    if (window.confirm("You have unsaved changes. Do you want to cancel and lose them?")) {
        setIsEditing(false);
        setEditedReportContent('');
        setEditingPartyId(null);
    }
};

const handleCardClick = (partyId) => {
    if (isEditing && partyId !== activePartyId) {
        if (window.confirm(`You are currently editing Report ${activePartyId}. Do you want to discard changes and switch to Report ${partyId}?`)) {
            setIsEditing(false);
            setEditedReportContent('');
            setEditingPartyId(null);
            setActivePartyId(partyId);
        }
    } else {
        setActivePartyId(partyId);
        if (partyId !== activePartyId) {
            setIsEditing(false);
            setEditedReportContent('');
            setEditingPartyId(null);
        }
    }
};
// -----------------------------


const today = new Date();
const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
const styledDate = `<span style="color: #000048;">${formattedDate}</span>`;

const activeReport = reports.find(r => r.partyId === activePartyId);
const showCommentary = !activeReport || activeReport.status !== "Completed";

const viewedAndCompletedReportsCount = reports.filter(
    r => r.status === "Completed" && viewedReports[r.partyId]
).length;

const reportHeader = (
    <div className="report-display-header">
        <p className="activity-subtitle">
            <span dangerouslySetInnerHTML={{ __html: `Date Generated: ${styledDate}` }} />
        </p>
        {activeReport?.status === "Completed" && !isEditing && (
            <button 
                onClick={handleEditReport} 
                className="edit-report-button"
                title="Edit Report"
            >
                <FaEdit /> Edit Report
            </button>
        )}
    </div>
);

const ReportActionsBar = ({ isEditing, onSave, onCancel }) => {
    if (!isEditing) return null;
    
    return (
        <div className="report-actions-bar-bottom">
             <button onClick={onCancel} className="cancel-button" title="Cancel Editing">
                <FaTimes /> Cancel
            </button>
            <button onClick={onSave} className="save-button" title="Save Changes">
                <span className="icon-wrapper">
                    <img src={SaveIcon} alt="Save" className="save-icon-image" />
                </span> Save Changes
            </button>
            
        </div>
    );
};

const DownloadBar = ({ onDownload, selectedCount }) => {
    return (
        <div className="download-actions-bar-bottom">
            <span className="selection-info">
                {selectedCount} Selected
            </span>
            <button onClick={onDownload} className="download-report-button" title="Download Report">
                    <img src={Download} alt="Download" className="download-image" />
               Download Report
            </button>
        </div>
    );
};


  return (
    <div className="report-generator-container">
        <div className="top-bar">
               <div className="back-link-container">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault(); 
            handleBackToDashboard(); // Calls the function to dispatch GENERATE_SAR_TOGGLE: false
          }}
          className="back-to-dashboard-link"
          aria-label="Back To Transactions Dashboard"
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          
          Back To Transactions Dashboard
        </a>
      </div>
      {/* 2. NEW UPLOAD BUTTON */}
            <button 
                onClick={handleNewUploadTrigger} 
                className="new-upload-button"
            >
                {/* <FaUpload style={{ marginRight: '8px' }} /> */}
                 <img src={Upload} alt="Upload" className="upload" />
                New Upload
            </button>
        </div>
      <header className="report-header">
     
      {activeReport?.status === "Completed" ? (
    <>
      <h1 className="report-title">SAR Narrative</h1>
      <p className="report-subtitle">
        Suspicious activity report is ready for download
      </p>
    </>
  ) : (
    <>
      <h1 className="report-title">Report Generating system</h1>
      <p className="report-subtitle">
        Your transaction data file is being analysed to generate SAR
      </p>
    </>
  )}
      </header>

      <div className="report-grid">
        {/* --- Left Column: Transaction Log --- */}
        <div className="transaction-log-panel">
          <h2 className="panel-title">
            Transaction log <span className="transaction-count">{reports.length} Transactions</span>
          </h2>
          {/* Map over state-managed reports */}
          {reports.map((tx) => (
            <TransactionCard 
              key={tx.partyId} 
              {...tx}
              status={tx.status} 
              isActive={tx.partyId === activePartyId} 
              isViewed={viewedReports[tx.partyId] || false} 
              onClick={() => handleCardClick(tx.partyId)} 
            />
          ))}
           {/* Download Bar - Show only if completed, fully viewed, and NOT editing */}
          {/* {activeReport?.status === "Completed" && viewedReports[activePartyId] && !isEditing && ( */}
          {viewedAndCompletedReportsCount > 0 && !isEditing && (
              <DownloadBar
                  onDownload={handleDownloadReport}
                  selectedCount={viewedAndCompletedReportsCount}
              />
          )}
        </div>

        {/* --- Right Column: Agent Activity / SAR Report --- */}
        <div className="agent-activity-panel">
          <h2 className="panel-title">
            {activeReport?.status === "Completed" ? "Final SAR Report" : "Agent Activity"}
          </h2>
          {/* Conditional Header Rendering */}
          {activeReport?.status === "Completed" 
            ? reportHeader
            : (
                <p className="activity-subtitle">
                    View real-time processing details for uploaded files
                </p>
            )}
          <hr
            style={{
              margin: "10px 0 0 0",
              borderTop: "1px solid rgba(73, 237, 249, 0.1)",
            }}
          />

          {/* Agent Activity Panel - Hide if report is completed OR editing is active */}
          {toggleSAR && !isEditing && (
            <div className={!showCommentary ? 'hidden' : ''}>
              <AiActivityPanel />
            </div>
          )}
          
          {/* Report Display - Only render when completed AND NOT editing */}
          {activeReport?.status === "Completed" && activeReport.sarReport && (
              <div 
                ref={reportDisplayRef} 
                onScroll={handleScroll} 
                className={isEditing ? 'hidden' : 'sar-report-display scrollable-content'} 
              >
                  <SarReportDisplay activeReport={activeReport} />
              </div>
          )}

          {/* Report Editor - Only render when editing is true */}
          {isEditing && (
              <ReportEditor
                  content={editedReportContent}
                  onContentChange={setEditedReportContent}
              />
          )}

          {/* Edit/Save/Cancel Actions Bar */}
          {activeReport?.status === "Completed" && ( 
              <ReportActionsBar
                  isEditing={isEditing}
                  onCancel={handleCancelEdit}
                  onSave={handleSaveReport}
              />
            )}
        </div>
      </div>
       <ConfirmationModal 
     isOpen={isModalOpen} 
    onClose={() => {
        setIsModalOpen(false);
        setModalMode(null);
    }} 
    onConfirm={handleModalConfirm} 
    mode={modalMode}
    confirmLabel={confirmButtonLabel}
    />
    </div>
  );
};

export default React.memo(ReportGen);