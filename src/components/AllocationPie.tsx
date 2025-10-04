import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

interface Data {
    id: number;
    value: number;
    label: string;
}
interface PortfolioPieChartProps  {
    data: Data[];
}

export default function PortfolioPieChart({data}: PortfolioPieChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <PieChart
        series={[
          {
            data,
            outerRadius: 100,
            paddingAngle: 3,
            cornerRadius: 4,
          },
        ]}
        
      />
    </div>
  );
}
