import React from "react";

type CardProps = {
  name: string;
  amount: number;
  lastChange: number; // percentage or numeric change
  logo: string;
};

const Card: React.FC<CardProps> = ({ name, amount, lastChange, logo }) => {
  const isPositive = lastChange >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 w-72">
      {/* Logo */}
      <div className="w-12 h-12 flex-shrink-0">
        <img src={logo} alt={`${name} logo`} className="w-full h-full object-contain rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        <p className="text-gray-600 text-sm">Value: ${amount.toLocaleString()}</p>
      </div>

      {/* Last Change */}
      <div className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "▲" : "▼"} {lastChange}%
      </div>
    </div>
  );
};

export default Card;
