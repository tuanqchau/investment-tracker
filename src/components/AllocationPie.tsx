import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

interface AllocationPieProps {
  data: {
    id: number;
    symbol: string;
    marketValue: number;
  }[];
}

export default function PortfolioPieChart({data}: AllocationPieProps) {
    const chartData = data.map((item) => ({
    id: item.id,
    value: item.marketValue,
    label: item.symbol,
    }));
  const totalValue = data.reduce((sum, d) => sum + d.marketValue, 0);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <PieChart
        series={[
          {
            data: chartData,
            outerRadius: 100,
            paddingAngle: 3,
            cornerRadius: 4,
            arcLabel: (item) => `${((item.value / totalValue) * 100).toFixed(1)}%`,
          },
        ]}
        sx={{
          "& text": { fontSize: 12, fill: "#333" }, // label style
        }}

      />
    </div>
  );
}
