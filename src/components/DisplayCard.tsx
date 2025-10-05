import React from "react";
import type { CardProps } from "../types/card-component";
import '../styles/DisplayCard.css';

const Card: React.FC<CardProps> = ({ 
    name, 
    amount = 0, 
    lastChange = 0, 
    logo }) => {
  const isPositive = lastChange >= 0;

  return (
    <div className="card-container">
  <div className="card-header">
    <div className="text-container">
      <h2 className="card-name">{name}</h2>
      <p className="card-value">${amount.toLocaleString()}</p>
      <p
        className="card-change"
        style={{ color: isPositive ? "green" : "red" }}
      >
        {isPositive ? "▲" : "▼"} {lastChange}%
      </p>
    </div>
    <div className="logo-container">
      <img src={logo} alt={`${name} logo`} className="card-logo" />
    </div>
  </div>
</div>

  );
};

export default Card;
