import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Mock Data (Adjusted colors and values to roughly match the visual)
const data = [
  { name: 'Wire Transfers', value: 300, color: '#2E308E' }, 
  { name: 'Unusual Account Activity', value: 100, color: '#C8D5FF' }, 
  { name: 'Third-Party Transactions', value: 80, color: '#9AB2FF' },
  { name: 'Rapid Movement of Funds', value: 100, color: '#6085FF' }, 
  { name: 'Dormant Account Reactivation', value: 120, color: '#7494FF' }, 
];

// --- Custom Label Component (REFINED FOR UNDERLINE LOOK) ---
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
    cx, cy, midAngle, outerRadius, name
}) => {
    const lineStartRadius = outerRadius + 2; 
    const lineElbowRadius = outerRadius + 18; // Point where the line turns horizontal
    
    // Set a fixed horizontal length that is longer than the longest label ('Dormant Account Reactivation' is longest)
    const lineHorizontalLength = 100; 
    
    // The text will start just after the elbow, and the line will continue under it.
    const textInitialOffset = 3; 

    // 1. Calculate the starting point (P1) on the outer edge of the pie
    const sx = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
    const sy = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);

    // 2. Calculate the elbow point (P2) - where the line turns horizontal
    const mx = cx + lineElbowRadius * Math.cos(-midAngle * RADIAN);
    const my = cy + lineElbowRadius * Math.sin(-midAngle * RADIAN);

    // 3. Determine alignment (left or right)
    const isRightSide = mx > cx;

    // 4. Calculate the horizontal endpoint (P3) of the path (long end)
    // P3 is located a fixed length away from P2
    const ex = isRightSide ? mx + lineHorizontalLength : mx - lineHorizontalLength;
    const ey = my; // Y position of the final horizontal line (this will be the "underline" Y)

    // 5. Calculate the text position (T)
    // The text should start/end near the elbow (P2) and run over the line.
    // Shift the text up by 8 units from the line's Y position (ey) so the line is below it.
    const textX = isRightSide ? mx + textInitialOffset : mx - textInitialOffset;
    const textY = ey - 8; // <-- Shift text up 8px from the line's Y position

    return (
        <g>
            {/* Draw the line path (P1 -> P2 -> P3) */}
            <path 
                // Path from start (P1) to elbow (P2) to horizontal end (P3)
                d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
                stroke="#C4C4C4" // Line color
                fill="none" 
                strokeWidth={1}
            />
            {/* Draw the text label */}
            <text 
                x={textX}
                y={textY} 
                dy={3} // Vertical alignment correction (SVG baseline adjustments)
                textAnchor={isRightSide ? 'start' : 'end'} 
                fill="#000048" 
                style={{ fontSize: '12px', fontWeight: '500' }}
            >
                {name}
            </text>
        </g>
    );
};


const TransactionTypesChart = () => {
    // These radii control the size of the donut in the center of the container
    const chartOuterRadius = 70; 
    const chartInnerRadius = 40; 
    
    return (
        // Ensure the container is large enough for the labels (height: 220px should be sufficient)
        <div style={{ width: '100%', height: '220px', padding: '0 10px' }}> 
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" 
                        cy="50%" 
                        innerRadius={chartInnerRadius} 
                        outerRadius={chartOuterRadius} 
                        fill="#8884d8"
                        paddingAngle={1}
                        
                        // Use the custom label renderer
                        label={renderCustomLabel}
                        labelLine={false} // Disable default line
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value, name, props) => [value, props.payload.name]}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TransactionTypesChart;