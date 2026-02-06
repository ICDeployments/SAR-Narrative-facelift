import React, { useContext, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import FileUpload from '../components/FileUpload';
import NarrativeBox from '../components/NarrativeBox';
import DescriptionBox from '../components/DescriptionBox';
import './Dashboard.css';
import CognizantLogo from '../assets/cognizant-logo.svg'; 
import CognizantTitle from '../assets/cognizant-title.svg';
 
 
const Dashboard = () => {
  const {state, dispatch} = useAppContext();
  
  useEffect(() => {
    //it shifts sidebar navs
    const stepToAgent = {
      // 0: 'upload',
      0: 'dashboard',
      1: 'preprocessor',
      2: 'sar',
      3: 'evaluator',
      4: 'report',
      5: 'dashboard', // Final Destination
    };
 

   if (typeof state.currentStep === "number") {
      dispatch({
        type: "SET_SELECTED_AGENT",
        payload: stepToAgent[state.currentStep] ,
      })
    }
  }, [state.currentStep, dispatch]);

  

  return (
    <div className="dashboard-container">
 
      <main className="main-content">
        <div className="left-pane">
          <FileUpload setSelectedAgent={state.setSelectedAgent} />
          <DescriptionBox selectedAgent={state.selectedAgent} />
        </div>
 
        <div className="right-pane">
          <NarrativeBox selectedAgent={state.selectedAgent} />
        </div>
      </main>
    </div>
  );
};
 
export default Dashboard;
 