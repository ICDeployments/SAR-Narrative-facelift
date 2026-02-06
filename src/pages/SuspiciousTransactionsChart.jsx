import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'AUG', 'No. of Transaction': 500, 'Suspicious Transaction': 350 },
  { name: 'AUG', 'No. of Transaction': 700, 'Suspicious Transaction': 250 },
  { name: 'AUG', 'No. of Transaction': 500, 'Suspicious Transaction': 220 },
  { name: 'SEP', 'No. of Transaction': 650, 'Suspicious Transaction': 150 },
  { name: 'SEP', 'No. of Transaction': 1400, 'Suspicious Transaction': 200 },
  { name: 'SEP', 'No. of Transaction': 1200, 'Suspicious Transaction': 280 },
  { name: 'SEP', 'No. of Transaction': 1600, 'Suspicious Transaction': 350 },
  { name: 'OCT', 'No. of Transaction': 2200, 'Suspicious Transaction': 250 },
  { name: 'OCT', 'No. of Transaction': 1200, 'Suspicious Transaction': 400 },
  { name: 'OCT', 'No. of Transaction': 1300, 'Suspicious Transaction': 320 },
  { name: 'OCT', 'No. of Transaction': 1350, 'Suspicious Transaction': 500 },
];

const Y_AXIS_LABELS = [100, 500, 1000, 2000];

const AXIS_MIN = 100;
const AXIS_MAX = 2200; // Chosen to be just above the max data point (2200)
const RANGE = AXIS_MAX - AXIS_MIN; // 2100
const SEGMENT_SIZE = RANGE / (Y_AXIS_LABELS.length - 1); // 2100 / 3 = 700

const VISUAL_TICKS = [
  AXIS_MIN,                           // 100
  AXIS_MIN + SEGMENT_SIZE,            // 800
  AXIS_MIN + 2 * SEGMENT_SIZE,        // 1500
  AXIS_MAX                            // 2200
];

const SuspiciousTransactionsChart = () => {
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
        >
          {/* Define Custom Gradients */}
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#413ea0" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#413ea0" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" /> 
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value, index) => {
                if (index === 0) return 'AUG';
                if (index === 4) return 'SEP';
                if (index === 8) return 'OCT';
                return '';
            }}
          />
          
          {/* Y-Axis: Uses a linear scale but displays custom labels at equal intervals */}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            
            // 1. Set the domain to cover the visual range
            domain={[AXIS_MIN, AXIS_MAX]} 
            
            // 2. Use the calculated linear positions for the visual ticks
            ticks={VISUAL_TICKS} 
            
            // 3. Use a formatter to replace the linear tick values (100, 800, 1500, 2200) 
            //    with the desired labels (100, 500, 1000, 2000)
            tickFormatter={(value, index) => {
              // Ensure we don't go out of bounds of the label array
              return Y_AXIS_LABELS[index] || value; 
            }}
            
            label={{ value: 'No. of Transactions', angle: -90, position: 'insideLeft', offset: -12, dy: 18, style: { textAnchor: 'middle' } }}
          /> 
          
          <Tooltip />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px', gap: '20px', justifyContent: 'center' }} 
            iconType="square"
            layout="horizontal"
          />

          <Area
            type="monotone"
            dataKey="No. of Transaction"
            stroke="#7494FF"
            fill="url(#colorTotal)"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="Suspicious Transaction"
            stroke="#413ea0"
            fill="url(#colorSuspicious)"
            strokeWidth={2}
          />
          
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuspiciousTransactionsChart;



