import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import successIcon from "../assets/success-tick.svg";
import UploadIcon from "../assets/upload.svg";
import "./FileUpload.css";
import * as XLSX from "xlsx";
import axios from "axios";

const MAX_FILE_SIZE_MB = 15;

const UPLOAD_URL =
  "https://zbizd19vgb.execute-api.us-west-2.amazonaws.com/dev/upload";

const PREPROCESS_URL =
  "https://pw1xj4vc6k.execute-api.us-west-2.amazonaws.com/dev/generate_preprocess_report";

const SAR_URL =
  "https://b8brstn7hh.execute-api.us-west-2.amazonaws.com/development/generate_sar_narrative";

const Evaluator_URL =
  "https://5y1669gjwa.execute-api.us-west-2.amazonaws.com/developer/generate_sar_evaluator";

const Formatter_URL =
  "https://n9z82rwepa.execute-api.us-west-2.amazonaws.com/Formatter/Sar_Formatter";

const FileUpload = () => {
  const { state, dispatch } = useAppContext();
  const fileInputRef = useRef(null);
  
  const timersRef = useRef([]);
  const [fileSizeMB, setFileSizeMB] = useState(null);
  const [showSuccessUI, setShowSuccessUI] = useState(false);
  const shouldGenerateSAR = state.generateSAR;
  const startProcessing = (fileName) =>
    dispatch({ type: "START_PROCESSING", payload: { fileName } });
  const addMessage = (text) => dispatch({ type: "ADD_MESSAGE", payload: text });

  const setNarrative = (text) =>
    dispatch({ type: "SET_NARRATIVE", payload: text });

  // const setNarrativeForStep = (step, text) => {
  //   dispatch({ type: "SET_NARRATIVE_FOR_STEP", payload: { step, text } });
  // };

  const setError = (text) => dispatch({ type: "SET_ERROR", payload: text });

  const resetAll = () => dispatch({ type: "RESET" });

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));

      timersRef.current = [];
    };
  }, []);

  const startTimer = (fn, ms) => {
    const id = setTimeout(() => {
      try {
        fn();
      } catch (err) {
        console.warn("timer callback error", err);
      }

      timersRef.current = timersRef.current.filter((t) => t !== id);
    }, ms);

    timersRef.current.push(id);

    return id;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    //resetting states
    clearAllTimers();
    resetAll();
    dispatch({ type: "SET_SELECTED_AGENT", payload: "dashboard" });
    dispatch({ type: "SET_ACTIVE_HEADING", payload: "Preprocessor Output" });
    // dispatch({ type: "SET_PROGRESS", payload: 0 });
    dispatch({ type: "SET_FINISHED", payload: false });
    // dispatch({type: "SET_ACTIVE_TAB", payload: "dashboard"});

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

    clearAllTimers();

    startProcessing(file.name);
    addMessage("🕹️ Agent Kicked off...");
    let uploadTimerId = startTimer(
      () => addMessage("📤 Uploading file..."),
      2000
    );
    // Step 1: Upload

    const formData = new FormData();

    formData.append("file", file);

    formData.append("excel_file", file);

    let responseData = null;

    dispatch({ type: "SET_CURRENT_STEP", payload: 0 }); //Before upload api call

    setTimeout(() => {
    }, 1200);
    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",

        body: formData,
      });

      responseData = await res.json();

      if (!res.ok) throw new Error(responseData.message || "Upload failed");

      // addMessage("✅ File uploaded successfully...");
      // dispatch({ type: "SET_PROGRESS", payload: 20 });
    } catch (err) {
      const msg = err?.message || "Upload failed";
      clearTimeout(uploadTimerId);
      setError(msg);

      addMessage(`❌ ${msg}`);

      return;
    }

    // Step 2: Extract party_key

    let extractedPartyKey = null;

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // extractedPartyKey = jsonData
      //   .map((row) => row["Party Key"])
      //   .filter(Boolean);
      // extractedPartyKey = "53660";

      const firstKey = jsonData.find((row) => row["Party Key"]);
      extractedPartyKey = firstKey ? firstKey["Party Key"] : null;

      if (!extractedPartyKey || extractedPartyKey.length === 0) {
        throw new Error("No party_key found in file.");
      }

      startTimer(() => {
        // addMessage(`📑 Extracted Party Key: ${extractedPartyKey}`);
        addMessage("📑 Extracting Party Keys...");
      }, 1000);
    } catch (err) {
      const msg = err?.message || "Failed to extract Party Key";

      setError(msg);

      addMessage(`❌ ${msg}`);

      return;
    }

    // Step 3: Preprocess
    dispatch({ type: "SET_CURRENT_STEP", payload: 1 });
    try {
      addMessage("🧠 Preprocessing the file...");

      // const preprocessRes =
       await axios.post(PREPROCESS_URL, {
        body: {
          // text: `preprocess party key ${extractedPartyKey}`,
          text: `Preprocess file with party key ${extractedPartyKey}`,
          party_key: extractedPartyKey,
        },
      });
      // dispatch({ type: "SET_PROGRESS", payload: 40 });
      addMessage("✅ Preprocessing complete...");

      dispatch({
        type: "SET_ACTIVE_RESPONSE_TAB",
        payload: "preprocessor",
      });

    } catch (err) {
      setError("Preprocess failed");
      addMessage("❌ Error in preprocess call.");

      return;
    }

    dispatch({ type: "SET_COMPLETED_STEP", payload: 1 });

    // : SAR Narrative
    dispatch({ type: "SET_CURRENT_STEP", payload: 2 });
    try {
      addMessage("📝 Generating SAR Narrative...");
      // const sarRes =
       await axios.post(SAR_URL, {
        actionGroup: "SARNarrativeGenerationAction",
        function: "generateSarNarrative",
        parameters: [
          {
            name: "party_key",
            value: extractedPartyKey,
          },
        ],
      });

      addMessage("✅ SAR Narrative complete...");
      // dispatch({ type: "SET_PROGRESS", payload: 60 });

      let sarText = "";

      try {
        const textBodyStr =
          sarRes.data?.response?.functionResponse?.responseBody?.TEXT?.body;

        if (textBodyStr) {
          const textBody = JSON.parse(textBodyStr);

          sarText = textBody.generated_sar_report
            ? textBody.generated_sar_report
            : JSON.stringify(textBody, null, 2);
        } else {
          sarText = "SAR content not available";
        }
      } catch (err) {
        console.error("Error parsing SAR content:", err);
        sarText = "Unable to parse SAR content";
      }

      // dispatch({
      //   type: "SET_NARRATIVE_FOR_STEP",
      //   payload: { step: "sarNarrative", text: sarText },
      // });

      dispatch({
        type: "SET_ACTIVE_RESPONSE_TAB",
        payload: "sarNarrative",
      });
    } catch (err) {
      const msg = err?.message || "SAR generation failed.";

      setError(msg);

      addMessage(`❌ ${msg}`);

      return;
    }

    dispatch({ type: "SET_COMPLETED_STEP", payload: 2 });

    // Step 5: Evaluator
    dispatch({ type: "SET_CURRENT_STEP", payload: 3 });
    try {
      addMessage("🧪 Running Evaluation...");
      const evalRes = await axios.post(Evaluator_URL, {
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
                key: "sar-narrative/12345_sar_narrative_1753009250.txt",
                // key: `sar-narrative/${extractedPartyKey}_sar_narrative_1755868025.txt`,
                // key: "53660",
                size: 2889,
                eTag: "f7c0f2fcac0dddcbb5ee54f153b1bd7c",
                sequencer: "00688080E79DBB077A",
              },
            },
          },
        ],
      });






      // let totalScore = evalRes.data?.response?.functionResponse?.responseBody?.TEXT?.body?.total_score || 0;

      // totalScore > 80 ? 

      addMessage("✅ Evaluation complete...", "success");
      // dispatch({ type: "SET_PROGRESS", payload: 80 });
      let evaluatorText =
        evalRes.data?.response?.functionResponse?.responseBody?.TEXT?.body ||
        JSON.stringify(evalRes.data, null, 2);

      // dispatch({
      //   type: "SET_NARRATIVE_FOR_STEP",
      //   payload: { step: "evaluator", text: evaluatorText },
      // });

      dispatch({
        type: "SET_ACTIVE_RESPONSE_TAB",
        payload: "evaluator",
      });
    } catch (err) {
      const msg = err?.message || "Evaluation failed.";

      setError(msg);

      addMessage(`❌ ${msg}`);

      return;
    }

    dispatch({ type: "SET_COMPLETED_STEP", payload: 3 });


    // Step 6: Formatter
    dispatch({ type: "SET_CURRENT_STEP", payload: 4 });
    try {
      addMessage("📝 Generating formatted narration...");
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
                //  key: `sar-narrative/${extractedPartyKey}_sar_narrative_1755868025.txt`,
                // key: "sar-narrative/53661_sar_narrative_1755616223.txt",
                // key: extractedPartyKey,
                key: "sar-narrative/12345_sar_narrative_1753009250.txt",
                // key: "53660",
                size: 2889,
                eTag: "f7c0f2fcac0dddcbb5ee54f153b1bd7c",
                sequencer: "00688080E79DBB077A",
              },
            },
          },
        ],
      });

      addMessage("✅ Formatting complete...");
      // dispatch({ type: "SET_PROGRESS", payload: 100 });
      setTimeout(() => {
        dispatch({
            type: "SET_CURRENT_STEP",
            payload: 5,
          });

          dispatch({ type: "SET_COMPLETED_STEP", payload: 5 });
      }, 1400);
      // Final narrative handling

      // let narrativeText = "";
      dispatch({
        type: "SET_ACTIVE_RESPONSE_TAB",
        payload: "formatter",
      });
       setTimeout(() => {
            dispatch({ type: "SET_FINISHED", payload: true });
          }, 500);
      const data = formatterRes.data;

      let formatterText =
        data?.response?.functionResponse?.responseBody?.TEXT?.body ||
        JSON.stringify(data);

      //TypeWriter effect simulation
      let currentText = "";
      let index = 0;
      const speed = 7; //delay per character (ms)
      setNarrative(""); // Clear before typing

      const intervalId = setInterval(() => {
        currentText += formatterText.charAt(index); //adding one character at a time
        setNarrative(currentText); //updating UI with current progress
        dispatch({
          type: "SET_NARRATIVE_FOR_STEP",
          payload: { step: "formatter", text: currentText },
        });

        index++;
        if (index >= formatterText.length) {
          //check if all characters are added
          clearInterval(intervalId); //stop the animation
          // setFinished(true);
  
        }
      }, speed);
    } catch (err) {
      const msg = err?.message || "Formation failed.";

      setError(msg);

      addMessage(`❌ ${msg}`);

      return;
    }

      dispatch({ type: "SET_COMPLETED_STEP", payload: 4 });

    startTimer(() => addMessage("✅ Agent report is ready..."), 500);
    dispatch({ type: "UPLOAD_SUCCESS" });

    startTimer(() => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  const resetUpload = () => {
    clearAllTimers();
    setFinished(false);
    resetAll();
    setShowSuccessUI(false);
    dispatch({ type: "SET_PROGRESS", payload: 0 });
    dispatch({ type: "START_PROCESSING", currentStep: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderUploadContent = () => {
    if (state.success || showSuccessUI) {
      return (
        <div className="upload-content">
          <img src={successIcon} alt="success Icon" className="logo-img" />
          <p className="success-text">File Uploaded Successfully</p>
          <button className="reset-upload" onClick={resetUpload}>
            Upload another file
          </button>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="upload-content">
          <svg
            className="error-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <p className="error-text">{state.error}</p>
          <button onClick={resetUpload} className="reset-button">
            Try again
          </button>
        </div>
      );
    }

    if (state.isProcessing) {
      return (
        <div className="upload-content">
          <div className="spinner" />
          <p className="upload-text">Uploading...</p>

          {state.fileName && <p className="file-name">{state.fileName}</p>}
        </div>
      );
    }

    return (
      <div className="upload-content">
        <img src={UploadIcon} alt="Upload Icon" className="upload-img" />
        <p className="main-text">Drag and Drop or Browse File</p>
      </div>
    );
  };

  return (
    
    <div className="file-upload-container">
      <div className="main-sar-title">SAR Narrative Report</div>

      <div className="upload-wrapper">
        <div className="upload-label">Upload File</div>
        <div className="upload-box">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.json,application/json"
            onChange={handleFileChange}
            className="file-input"
          />

          {renderUploadContent()}
        </div>
        <div className="upload-info-row">
          {state.fileName ? (
            <p className="support-text left-info">File Size: {fileSizeMB} MB</p>
          ) : (
            <p className="support-text left-info">
              Supported Format: XLS, XLSX
            </p>
          )}
          <p className="support-text right-info">Maximum Size: 15 MB</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
