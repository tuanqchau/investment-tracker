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
      {/* Logo */}
      <div className="image-container">
        <img src={logo} alt={`${name} logo`} className="card-image" />
      </div>

      {/* Content */}
      <div className="content-container">
        <h2 className="card-name">{name}</h2>
        <p className="card-value">${amount.toLocaleString()}</p>
      </div>

      {/* Last Change */}
      <div className="last-change-container" style={{ color: isPositive ? 'green' : 'red' }}>
        {isPositive ? "▲" : "▼"} {lastChange}%
      </div>
    </div>
  );
};

export default Card;
