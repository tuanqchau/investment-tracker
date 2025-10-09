import React from "react";
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import '../styles/MarketCard.css';
import TrendAreaChart from "./AreaChart";
import type { DataPoint } from "./AreaChart";
export interface MarketCardProps {
  name: string;
  value: number;
  changeAmount: string;
  changePercent: string;
  chartData: DataPoint[];
}

const MarketCard: React.FC<MarketCardProps> = ({
  name,
  value,
  changeAmount,
  changePercent,
  chartData
}) => {
  const isPositive = changePercent.trim().startsWith("+");

  return (
    <div className="market-card">
      <div className="market-card-header">
        <h3 className="market-title">{name}</h3>
        <p className="market-value">{value.toLocaleString()}</p>
        <p className="market-subtext">{changeAmount}</p>
        <div
          className={`market-change ${
            isPositive ? "market-up" : "market-down"
          }`}
        >
          <span>{changePercent}</span>
          {isPositive ? (
            <FaArrowCircleUp size={16} style={{ marginLeft: 4 }} />
          ) : (
            <FaArrowCircleDown size={16} style={{ marginLeft: 4 }} />
          )}
        </div>
      </div>

      {/* Mini chart placeholder */}
      <div
        className={`market-chart ${
          isPositive ? "chart-up" : "chart-down"
        }`}
      >
        <TrendAreaChart data={chartData} />
      </div>
    </div>
  );
};


export default MarketCard;
