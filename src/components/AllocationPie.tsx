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
    const totalValue = data.reduce((sum, d) => sum + d.marketValue, 0);
    const chartData = data.map((item) => ({
    id: item.id,
    value: item.marketValue,
    label: `${item.symbol}  (${((item.marketValue / totalValue) * 100).toFixed(2)}%)`,
    }));


  return (
    <div style={{ width: '50%', height: 300 }}>
      <PieChart
        series={[
          {
            data: chartData,
            
            outerRadius: 100,
            paddingAngle: 0,
            cornerRadius: 1,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            arcLabel: (item) => `${((item.value / totalValue) * 100).toFixed(2)}%`,
            arcLabelMinAngle:35,
            valueFormatter: (value) => `$${value.value.toLocaleString()}`,
          },
        ]}
        sx={{
          "& text": { fontSize: 12, fill: "#ffffffff" }, // label style
          "& .MuiChartsLegend-root": {
                color: "#fff", // ✅ legend text color
            },
            "& .MuiChartsLegend-series text": {
                fill: "#fff", // ✅ legend labels (GOOGL, AMZN, etc.)
            },
            '& .MuiDataGrid-footerContainer': { display: 'none' },
            
        }}

      />
    </div>
  );
}
