import React, { useState, useEffect } from "react";
import Card from "../components/DisplayCard";
import type { CardProps } from "../types/card-component";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { supabase } from "../supabaseClient";
import HoldingsTable from "../components/HoldingsTable";
import AddButton from "../components/AddTransactionButton";
import { FaArrowTrendUp } from "react-icons/fa6";
import { LuCircleDollarSign } from "react-icons/lu";
import { PiPulseBold } from "react-icons/pi";



// MUI imports
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import AllocationPie from "../components/AllocationPie";

import RecentTransactions from "../components/RecentTransactions";
import type { Transaction } from "../components/RecentTransactions";
const stockList = [
  "Apple (AAPL)",
  "Amazon (AMZN)",
  "Microsoft (MSFT)",
  "Tesla (TSLA)",
  "Nvidia (NVDA)",
];
interface Props {
  user: {
    id: string;
    email: string | null;
  };
}
const Dashboard: React.FC<Props> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("");
  const [shares, setShares] = useState("");

  interface PortfolioHolding {
    id: number;
    symbol: string;
    shares: number;
    price: number;
    date_purchase: string;
  }

  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processHoldingsData = (holdings: PortfolioHolding[]) => {
    // Group holdings by symbol
    const groupedHoldings = holdings.reduce((acc, holding) => {
      const { symbol, shares, price } = holding;
      if (!acc[symbol]) {
        acc[symbol] = { totalShares: 0, totalCost: 0 };
      }
      acc[symbol].totalShares += shares;
      acc[symbol].totalCost += shares * price;
      return acc;
    }, {} as Record<string, { totalShares: number; totalCost: number; }>);

    return Object.entries(groupedHoldings).map(([symbol, data], index) => {
      const avgCost = data.totalCost / data.totalShares;
      // TODO: Replace with actual current price from an API
      const currentPrice = avgCost * 1.1; // Temporary: using 10% above avg cost as current price
      const marketValue = currentPrice * data.totalShares;
      const gainLoss = ((currentPrice - avgCost) / avgCost) * 100;

      return {
        id: index + 1,
        symbol,
        quantity: data.totalShares,
        avgCost,
        currentPrice,
        marketValue,
        gainLoss,
      };
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching data from Supabase...');
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .eq('user_id', user?.id);

        console.log('Supabase response:', { data, error });
        if (error) throw error;

        if (data && isMounted) {
          setPortfolio(data as PortfolioHolding[]);
        }
      } catch (error) {
        console.error('Error fetching holdings:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const fetchHoldings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (data) {
        setPortfolio(data as PortfolioHolding[]);
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const totalValueCard: CardProps = {
    name: "Total Value",
    amount: 12500,
    lastChange: 5.2,
    logo: <LuCircleDollarSign/>,
  };

  const totalGainLossCard: CardProps = {
    name: "Total Gain/Loss",
    amount: 3200,
    lastChange: -2.3,
    logo: <FaArrowTrendUp/>,
  };

  const todaysChangeCard: CardProps = {
    name: "Today's Change",
    amount: 150,
    lastChange: 1.1,
    logo: <PiPulseBold/>
  };

  const handleSave = async () => {
    if (!date) return; // prevent saving without a date
    if (!user?.id) {
        alert("User not logged in");
        return;
    }
    // Extract stock symbol from the search string (e.g., "Apple (AAPL)" -> "AAPL")
    const symbolMatch = search.match(/\(([^)]+)\)/);
    const symbol = symbolMatch ? symbolMatch[1] : search;

    const newHolding = {
      user_id: user.id,
      symbol: symbol,
      price: parseFloat(price),
      shares: parseInt(shares),
      date_purchase: date.format("YYYY-MM-DD"),
    };

    console.log('Attempting to save holding:', newHolding);

    try {
      const { data, error } = await supabase
        .from('portfolio')
        .insert([newHolding])
        .select();

      if (error) throw error;

      // Refresh the holdings list
      await fetchHoldings();
      setIsModalOpen(false);
      
      // Reset form
      setSearch("");
      setPrice("");
      setShares("");
      setDate(null);
    } catch (error) {
      console.error('Error saving holding:', error);
      alert('Error saving holding. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <h1>Welcome, {user.email}</h1>
        <button onClick={handleLogout}>Log Out</button>
      </div>
      {/* Row 1: Add Transaction button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <AddButton onClick={() => setIsModalOpen(true)} name="Add Transaction"/>
      </div>

      {/* Row 2: Portfolio summary cards */}
      <div
        className="portfolio-summary-container"
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Card {...totalValueCard}/>
        <Card {...totalGainLossCard} />
        <Card {...todaysChangeCard} />
      </div>

      {/* MUI Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>

        <DialogTitle>Add Transaction</DialogTitle>

        <DialogContent>

          {/* Autocomplete for stock selection */}
          <Autocomplete
            options={stockList}
            value={search}
            onChange={(_, newValue) => setSearch(newValue || "")}
            renderInput={(params) => (
              <TextField {...params} label="Search stock" margin="dense" fullWidth />
            )}
            freeSolo // allows typing custom values if not in list
          />

          {/* Price */}
          <TextField
            fullWidth
            type="number"
            label="Price Purchased"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            margin="dense"
          />

          {/* Shares */}
          <TextField
            fullWidth
            type="number"
            label="Number of Shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            margin="dense"
          />

          <DatePicker
            label="Purchase Date"
            value={date} // Dayjs | null
            onChange={(newDate: Dayjs | null) => setDate(newDate)}
            slotProps={{ textField: { fullWidth: true, margin: "dense" } }}
          />

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setIsModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>

        </DialogActions>

      </Dialog>


      {/* Row 3: Portfolio Holdings Table */}
      <div style={{ width: "100%" }}>
        {(() => {
          if (isLoading) return <Typography>Loading...</Typography>;
          if (portfolio.length === 0)
            return <Typography>No holdings found. Add your first transaction!</Typography>;
          const processedHoldings = processHoldingsData(portfolio);
          return <HoldingsTable holdings={processedHoldings} />;
        })()}
      </div>

      {/* Row 4: Portfolio Allocation Pie Chart */}
      <div style={{ width: "100%" }}>
        <AllocationPie data={processHoldingsData(portfolio)} />
      </div>

  </div>

  );
};

export default Dashboard;
