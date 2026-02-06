import React, { useState, useEffect, useRef } from "react";
import "./SArNarrative.css";
import { useAppContext } from "../context/AppContext";
import copyIcon from "../assets/copy.svg";
import downloadIcon from "../assets/download.svg";
// import refreshIcon from "../assets/regenerate.svg";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
 


// pdfMake.vfs = pdfFonts.pdfMake.vfs

const SArNarrative = () => {
  const { state, dispatch } = useAppContext();
  const currentNarrative = state?.narratives?.[state.activeResponseTab] || "";
  const [copied, setCopied] = useState(false);
  const [localText, setLocalText] = useState(currentNarrative);
  const editableRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setLocalText(currentNarrative || "");
  }, [state.activeResponseTab, currentNarrative]);

  // Download as PDF

  const handleDownload = () => {
    const doc = new jsPDF();
    const marginLeft = 14;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.height;

    // --- HEADER ---
    doc.setFontSize(16).setFont("helvetica", "bold");
    doc.text("SUSPICIOUS ACTIVITY REPORT (SAR)", 105, 15, { align: "center" });

    doc.setFontSize(11).setFont("helvetica", "normal");
    doc.text("Generated Date: " + new Date().toLocaleDateString(), 105, 25, {
      align: "center",
    });

    let y = 40;

    // --- SPLIT LINES ---
    const lines = (localText || currentNarrative || "")
      .split("\n")
      .filter((l) => l.trim() !== "");
    const partAIndex = lines.findIndex((l) => l.includes("PART A:"));
    const partBIndex = lines.findIndex((l) => l.includes("PART B:"));
    const partCIndex = lines.findIndex((l) => l.includes("PART C:"));

    // --- PART A HEADING (wrap properly) ---
    const partAHeading = lines[partAIndex].replace(/\*/g, "").trim();
    doc.setFontSize(12).setFont("helvetica", "bold");
    const wrappedHeadingA = doc.splitTextToSize(partAHeading, 180);
    doc.text(wrappedHeadingA, marginLeft, y);
    y += wrappedHeadingA.length * (lineHeight + 1) + 1;

    // --- PART A TABLE ---
    let partAFields = lines.slice(partAIndex + 1, partBIndex).map((line) => {
      const match = line.split(/:(.+)/); // split only on first colon
      return [match[0].replace(/\*/g, "").trim(), (match[1] || "").trim()];
    });

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
    doc.text(wrappedHeadingB, marginLeft, y);
    y += wrappedHeadingB.length * lineHeight + 10;

    doc.setFontSize(11).setFont("helvetica", "normal");
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
    y += wrappedHeadingC.length * lineHeight + 6;  // increased space between Part B & C

    doc.setFontSize(11).setFont("helvetica", "normal");
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

    // --- SAVE PDF ---
    doc.save("SAR_Report.pdf");
  };

  useEffect(() => {
    const headings = {
      0: "Dashboard OVerview",
      1: "Preprocessor Output",
      2: "SAR Narrative Report",
      3: "Evaluator Report",
      4: "Formatter Agent Report",
      5: "Dashboard Overview",
    };

    if (state.completedStep) {
      dispatch({
        type: "SET_ACTIVE_HEADING",
        payload: headings[state.completedStep] || "SAR Narrative Report",
      });
    }
  }, [state.completedStep]);

  const Default_text = "SAR Agent Report would be generated here once processing is complete...";

  return (
    <div className="sar-narrative-container">
      {/* <h3 className="sar-narrative-title"> */}
        {/* SUSPICIOUS ACTIVITY REPORT */}
         {/* SAR Analytics */}
         {/* </h3> */}
      {/* <h3 className="sar-narrative-title">{state.activeHeading}</h3> */}
      <div className="sar-narrative-box">
        {/* <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {currentNarrative}
        </pre> */}

        {/* <textarea disabled={!state.finished}
          value={currentNarrative || ""}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_NARRATIVE",
              payload: { tab: state.activeResponseTab, text: e.target.value },
            })
          }
         className="narrative-textarea"
        /> */}

        <div
          contentEditable={state.finished} // editable only if finished
          suppressContentEditableWarning={true}
          ref={editableRef}
          // onInput={(e) => setLocalText(e.currentTarget.textContent)}
          onInput={(e) => setLocalText(e.currentTarget.innerText)}
          onBlur={() =>
            dispatch({
              type: "UPDATE_NARRATIVE",
              payload: { tab: state.activeResponseTab, text: localText },
            })
          }
          className="narrative-editable"
          // dangerouslySetInnerHTML={{ __html: formatNarrative(localText) }}
        >
          {currentNarrative || Default_text}
        </div>
      </div>
      {
        // state.narrative
        // currentNarrative && (
        //  state.finished &&
        <div className="sar-narrative-actions">
          {/* <button disabled={!state.finished}>
            <img src={refreshIcon} alt="Regenerate" />
          </button> */}
          <button onClick={handleCopy} disabled={!state.finished}>
            <img src={copyIcon} alt="Copy" />
          </button>
          <button
            className="downloadBtn"
            onClick={handleDownload}
            disabled={!state.finished}
          >
            <img src={downloadIcon} alt="Download" />
          </button>
        </div>
        // )
      }
    </div>
  );
};

export default SArNarrative;
