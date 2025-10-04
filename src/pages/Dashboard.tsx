import React, { useState, useEffect } from "react";
import Card from "../components/DisplayCard";
import type { CardProps } from "../types/card-component";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { supabase } from "../supabaseClient";
import HoldingsTable from "../components/HoldingsTable";
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

const stockList = [
  "Apple (AAPL)",
  "Amazon (AMZN)",
  "Microsoft (MSFT)",
  "Tesla (TSLA)",
  "Nvidia (NVDA)",
];

const Dashboard = () => {
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
          .select('*');

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
  }, []);

  const fetchHoldings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio')
        .select('*');

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
  };

  const totalGainLossCard: CardProps = {
    name: "Total Gain/Loss",
    amount: 3200,
    lastChange: -2.3,
  };

  const todaysChangeCard: CardProps = {
    name: "Today's Change",
    amount: 150,
    lastChange: 1.1,
  };

  const handleSave = async () => {
    if (!date) return; // prevent saving without a date

    // Extract stock symbol from the search string (e.g., "Apple (AAPL)" -> "AAPL")
    const symbolMatch = search.match(/\(([^)]+)\)/);
    const symbol = symbolMatch ? symbolMatch[1] : search;

    const newHolding = {
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

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", flexWrap: "wrap" }}>
      <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
        Add Transaction
      </Button>

      <Card {...totalValueCard} />
      <Card {...totalGainLossCard} />
      <Card {...todaysChangeCard} />

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

      {/* Portfolio Holdings Table */}
      <div style={{ width: "100%", marginTop: "20px" }}>
        
        {(() => {
          console.log('Current portfolio state:', portfolio);
          console.log('isLoading:', isLoading);
          if (isLoading) {
            return <Typography>Loading...</Typography>;
          }
          if (portfolio.length === 0) {
            return <Typography>No holdings found. Add your first transaction!</Typography>;
          }
          const processedHoldings = processHoldingsData(portfolio);
          console.log('Processed holdings:', processedHoldings);
          return <HoldingsTable holdings={processedHoldings} />;
        })()}
      </div>
    </div>
  );
};

export default Dashboard;
