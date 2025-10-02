import React from 'react';

import Card from '../components/DisplayCard';
import type { CardProps } from '../types/card-component';


const Dashboard = () => {
  const totalValueCard: CardProps = {
    name: "Total Value",
    amount: 12500,
    lastChange: 5.2,
    logo: ""
  }

  const totalGainLossCard: CardProps = {
    name: "Total Gain/Loss",
    amount: 3200,
    lastChange: -2.3,
    logo: ""
  }

  const todaysChangeCard: CardProps = {
    name: "Today's Change",
    amount: 150,
    lastChange: 1.1,
    logo: ""
  }



  return (
    <div className="dashboard-container" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <Card {...totalValueCard} />
      <Card {...totalGainLossCard} />
      <Card {...todaysChangeCard} />
    </div>
  );
}

export default Dashboard;