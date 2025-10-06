import React from "react";
import type { CardProps } from "../types/card-component";
import '../styles/DisplayCard.css';
import { FiArrowDownRight } from "react-icons/fi";
import { FiArrowDownLeft } from "react-icons/fi";
import { FiArrowUpRight } from "react-icons/fi";

const Card: React.FC<CardProps> = ({ 
    name, 
    amount = 0, 
    lastChange = 0, 
    showDollarSign = true,
    logo }) => {

  return (
    <div className="card-container">
  <div className="card-header">
    <div className="text-container">
      <h2 className="card-name">{name}</h2>
      <p className="card-value">
            {showDollarSign ? '$' : ''}{amount.toLocaleString()}
          </p>
      {lastChange !== 0 && (
            <p
              className="card-change"
              style={{ 
                color: lastChange > 0 ? 'var(--green-yellow)' : 'var(--primary-red)'
              }}
            >
              {lastChange > 0 ? <FiArrowUpRight /> : <FiArrowDownRight />} {Math.abs(lastChange)}%
            </p>
      )}
    </div>
    <div className="logo-container">
      {typeof logo === "string" ? (
            <img src={logo} alt={`${name} logo`} className="card-logo" />
          ) : (
            logo
          )}
    </div>
  </div>
</div>

  );
};

export default Card;
