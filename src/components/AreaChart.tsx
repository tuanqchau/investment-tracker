import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

export interface DataPoint {
  value: number;
}

interface TrendAreaChartProps {
  data: DataPoint[];
}

const TrendAreaChart: React.FC<TrendAreaChartProps> = ({ data }) => {
 const isPositive = data && data.length > 0 && 
    data[data.length - 1].value >= data[0].value;
  
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `gradient-${isPositive ? 'positive' : 'negative'}`;

  // Calculate min and max for better scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1 || maxValue * 0.01; // 10% padding or 1% if flat

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.5} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <YAxis domain={[minValue - padding, maxValue + padding]} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendAreaChart;