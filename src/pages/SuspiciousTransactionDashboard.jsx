import React, {useState} from 'react';
import DashboardContent from './DashboardContent.jsx'; 
import './DashboardContent.css'; 
import { useAppContext } from "../context/AppContext";
import Upload from '../assets/Upload.png'; 
import ConfirmationModal from './ConfirmationModal.jsx';


const SuspiciousTransactionDashboard = () => {
    const { dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
      const handleNewUploadTrigger = () => {
        setIsModalOpen(true); 
};

const performReset = () => {
    dispatch({ type: "RESET" });
    setIsModalOpen(false);
    // console.log("Perform Reset - Application state reset for new upload.");
};

    return (
        <div className="sar-results-container ">
            <div className="page-header-dashboard">
                <div>
                <p className='dashbaord-heading'>Suspicious Transaction Dashboard</p>
                <p className='s-dashbaord-subheading'>Suspicious Transaction are flagged to Generate SAR</p>
                </div>
                <div>
                     {/* 2. NEW UPLOAD BUTTON */}
                                <button 
                                    onClick={handleNewUploadTrigger} 
                                    className="new-upload-button"
                                >
                                     <img src={Upload} alt="Upload" className="upload" />
                                    New Upload
                                </button>
                </div>
            </div>
            
            <DashboardContent /> 
            <ConfirmationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={performReset} 
            />
        </div>
    );
};

export default SuspiciousTransactionDashboard;