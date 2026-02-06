
import React, { useState } from 'react';

import { Search } from 'lucide-react'; // For the search icon
import './DashboardContent.css'; // Import the CSS file for styling
import TransactionTypesChart from './TransactionTypesChart'; 
import SuspiciousTransactionsChart from './SuspiciousTransactionsChart';
import { useAppContext } from "../context/AppContext"; 

// Sample data derived directly from the screenshot
const flaggedTransactionsData = [
    { 
        id: '53660', party: 'Martinez Long-Miller', account: '2468005161', tin: '378889038', 
        amount: '$ 70,122', phone: '336-287-2910', reason: 'Unusually large transaction amount', checked: true 
    },
    { 
        id: '53661', party: 'Michele Williams', account: '6353031820', tin: '378889657', 
        amount: '$ 19,800', phone: '945-987-6761', reason: 'Canceling transactions to evade reporting', checked: true 
    },
    // { 
    //     id: '53697', party: 'John Martinez', account: '2468005161', tin: '378889038', 
    //     amount: '$ 70,122', phone: '336-287-2910', reason: 'Unusually large transaction amount', checked: true 
    // },
    // { 
    //     id: '53666', party: 'Sarah Chen', account: '9359180441', tin: '480526335', 
    //     amount: '$ 89,844', phone: '938-929-7913', reason: 'Suspicious exchange of foreign currencies..', checked: true 
    // },
    // { 
    //     id: '39471', party: 'Michael Brown', account: '6353031820', tin: '378889657', 
    //     amount: '$ 19,800', phone: '945-987-6761', reason: 'Canceling transactions to evade reporting..', checked: true 
    // },
    // { 
    //     id: '39473', party: 'Michael Brown', account: '6353031820', tin: '378889657', 
    //     amount: '$ 19,800', phone: '945-987-6761', reason: 'Unusually large transaction amount', checked: false 
    // },
    // { 
    //     id: '53668', party: 'Sarah Chen', account: '9359180441', tin: '480526335', 
    //     amount: '$ 89,844', phone: '938-929-7913', reason: 'Suspicious exchange of foreign currencies..', checked: false 
    // },
    // { 
    //     id: '53663', party: 'John Martinez', account: '2468005161', tin: '378889038', 
    //     amount: '$ 70,122', phone: '336-287-2910', reason: 'Canceling transactions to evade reporting..', checked: false 
    // },
    // { 
    //     id: '39472', party: 'Michael Brown', account: '6353031820', tin: '378889657', 
    //     amount: '$ 19,800', phone: '945-987-6761', reason: 'Unusually large transaction amount', checked: false 
    // },
];

const DashboardContent = () => {

    const { state, dispatch } = useAppContext(); 
    const toggleGenerateSAR = () => {
        dispatch({ type: "GENERATE_SAR_TOGGLE", payload: true });
    }
    const [selectedTransactions, setSelectedTransactions] = useState(
        flaggedTransactionsData.filter(t => t.checked).map(t => t.id)
    );

    const handleCheckboxChange = (transactionId) => {
        setSelectedTransactions(prev => 
            prev.includes(transactionId)
                ? prev.filter(id => id !== transactionId)
                : [...prev, transactionId]
        );
    };

    const isAllSelected = selectedTransactions.length === flaggedTransactionsData.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedTransactions([]);
        } else {
            setSelectedTransactions(flaggedTransactionsData.map(t => t.id));
        }
    };

    return (
        <div className="dashboard-content">
            {/* --- Suspicious Transaction Details --- */}
            <div className="suspicious-transaction-details">
                
                {/* 1. CHART ROW */}
                <div className="charts-row">
                    
                    {/* 1A. Transactions Types (Pie Chart Container) */}
                    <div className="chart-card pie-chart-container">
                        <div className="chart-title">Transactions Types</div>
                        {/* Placeholder for Pie Chart component */}
                        <TransactionTypesChart />
                    </div>

                    {/* 1B. No. of Transactions Vs Suspicious Transactions (Area/Line Chart Container) */}
                    <div className="chart-card line-chart-container">
                        <div className="chart-title">No. of Transactions Vs Suspicious Transactions</div>
                         {/* Placeholder for Area/Line Chart component */}
                         <SuspiciousTransactionsChart />
                    </div>
                </div>

                {/* 2. FLAGGED TRANSACTIONS TABLE */}
                <div className="flagged-transactions-card">
                    <h2 className="flagged-transactions-title">Flagged Transactions</h2>

                    <div className="table-search-bar">
                        <Search size={18} color="#999" />
                        <input 
                            type="text" 
                            placeholder="Search by Party ID or TIN" 
                            className="table-search-input"
                        />
                    </div>

                    <table className="flagged-transactions-table">
                        <thead>
                            <tr>
                                <th>
                                    <input 
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Party ID</th>
                                <th>Account Holder</th>
                                <th>Account Number</th>
                                <th>TIN</th>
                                <th>Amount</th>
                                <th>Phone Number</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flaggedTransactionsData.map((tx) => (
                                <tr key={tx.id}>
                                    <td>
                                        <input 
                                            type="checkbox"
                                            checked={selectedTransactions.includes(tx.id)}
                                            onChange={() => handleCheckboxChange(tx.id)}
                                        />
                                    </td>
                                    <td>{tx.id}</td>
                                    <td>{tx.party}</td>
                                    <td>{tx.account}</td>
                                    <td>{tx.tin}</td>
                                    <td>{tx.amount}</td>
                                    <td>{tx.phone}</td>
                                    <td className="reason-column">{tx.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="table-footer">
                        <button 
                            className="generate-sar-button"
                            disabled={selectedTransactions.length === 0}
                            onClick={toggleGenerateSAR}

                        >
                            Generate SAR
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardContent;