import React, { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import "./Dashboard.css";
import Group from "../assets/Group.png";
import Trash from "../assets/Trash.png";
import * as XLSX from "xlsx";
import axios from "axios";
 
const MAX_FILE_SIZE_MB = 15;
const UPLOAD_URL =
  "https://zbizd19vgb.execute-api.us-west-2.amazonaws.com/dev/upload";
const PREPROCESS_URL =
  "https://pw1xj4vc6k.execute-api.us-west-2.amazonaws.com/dev/generate_preprocess_report";
 
const UploadTransactionCard = () => {
  const fileInputRef = useRef(null);
  const { state, dispatch } = useAppContext();
  const [fileSizeMB, setFileSizeMB] = useState(null);
  const [showSuccessUI, setShowSuccessUI] = useState(false);
 
  const resetAll = () => dispatch({ type: "RESET" });
  const addMessage = (text) => dispatch({ type: "ADD_MESSAGE", payload: text });
  const startProcessing = (fileName) =>
    dispatch({ type: "START_PROCESSING", payload: { fileName } });
  const setError = (text) => dispatch({ type: "SET_ERROR", payload: text });
 
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
 
    if (!file) return;
 
    dispatch({ type: "SET_SELECTED_AGENT", payload: "dashboard" });
    dispatch({ type: "SET_ACTIVE_HEADING", payload: "Preprocessor Output" });
    dispatch({ type: "SET_FINISHED", payload: false });
 
    const lower = file.name.toLowerCase();
 
    const isAccepted =
      lower.endsWith(".xlsx") ||
      lower.endsWith(".xls") ||
      lower.endsWith(".json");
 
    if (!isAccepted) {
      setError("Only XLS, XLSX and JSON files are allowed.");
      fileInputRef.current.value = "";
 
      return;
    }
 
    const sizeMB = file.size / (1024 * 1024);
    setFileSizeMB(sizeMB.toFixed(2));
 
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setError("File too large. Maximum size is 15 MB.");
 
      fileInputRef.current.value = "";
 
      return;
    }
 
    startProcessing(file.name);
 
    const formData = new FormData();
    formData.append("file", file);
    formData.append("excel_file", file);
    let responseData = null;
    console.log("LINE 87 formDATA", formData);
 
    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
 
        body: formData,
      });
     
      responseData = await res.json();
 
      if (!res.ok) throw new Error(responseData.message || "Upload failed");
    } catch (err) {
      const msg = err?.message || "Upload failed";
      setError(msg);
      return;
    }
 
    // Step 2: Extract party_key
 
    let extractedPartyKey = null;
    let keys=[];
 
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
 
      // extractedPartyKey = jsonData
      //   .map((row) => row["Party Key"])
      //   .filter(Boolean);
      // extractedPartyKey = "53660";
 
      // const firstKey = jsonData.find((row) => row["Party Key"]);
      keys=jsonData.map(each=>each["Party Key"])
      // console.log("first",keys)
      // extractedPartyKey = firstKey ? firstKey["Party Key"] : null;
      // console.log("Extracted Party Key:", extractedPartyKey);
      if (!keys || keys.length === 0) {
        throw new Error("No party_key found in file.");
      }
    } catch (err) {
      const msg = err?.message || "Failed to extract Party Key";
      console.log("Error extracting party key:", msg);
      setError(msg);
 
      return;
    }
 
    // Step 3: Preprocess
    dispatch({ type: "SET_CURRENT_STEP", payload: 1 });
    try {
      // addMessage("🧠 Preprocessing the file...");

      await Promise.all(
        keys.map(key => {
          // The map function returns an array of promises
          return axios.post(PREPROCESS_URL, {
            body: {
              text: `Preprocess file with party key ${key}`,
              party_key: key,
            },
          });
        })
      );

      // console.log("PRE CALL SUCCESS: All preprocess requests completed.");

      // ALL preprocess calls have successfully resolved.
      dispatch({ type: "FIRST_PAGE_SUCCESS" });
      dispatch({ type: "UPLOAD_SUCCESS" });
      dispatch({ type: "END_PRE_PROCESSING" }); // Assuming this ends processing for the entire workflow
      
      dispatch({
        type: "SET_ACTIVE_RESPONSE_TAB",
        payload: "preprocessor",
      });

      // --- MODIFIED CODE END ---

    } catch (err) {
      setError("Preprocess failed");
      addMessage("❌ Error in preprocess call.");

      return;
    }

    dispatch({ type: "SET_COMPLETED_STEP", payload: 1 });
  };
 
    
const resetUpload = () => {
  dispatch({type: "RESET"});
    clearAllTimers();
    setFinished(false);
    resetAll();
    setShowSuccessUI(false);
    dispatch({ type: "SET_PROGRESS", payload: 0 });
    dispatch({ type: "START_PROCESSING", currentStep: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
 
  return (
    <div className="card-container upload-card">
      <h2 className="card-title">Upload Transaction File</h2>
      <p className="card-subtitle">
        Upload file to flag suspicious transactions
      </p>
 
      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.json,application/json"
          onChange={handleFileChange}
          className="file-input"
        />
 
        <img src={Group} alt="uploader-icon" />
 
        <p className="drag-drop-text">Drag and drop your file here</p>
        <p className="or-text">or</p>
        <button className="browse-button">Browse Files</button>
        <p className="supported-formats">Supported format: .xlsx, .xls, .csv</p>
      </div>
      <div>
        {state.fileName ? (
          <div className="file-info-display">
            <div>
              <span className="file-name-display"> {state.fileName}</span>
            <span className="file-size-display"> {fileSizeMB} MB</span>
            </div>
          <div>
             <button className="reset-upload" onClick={resetUpload}>
              <img src={Trash} alt="Trash" className="trash" />
            </button>
          </div>
           
          </div>
        ) : null}
 
        {/* <p className="support-text right-info">Maximum Size: 15 MB</p> */}
      </div>
    </div>
  );
};
 
export default UploadTransactionCard;
 
 
 