import React, { useState, useEffect } from "react";
import Card from "../components/DisplayCard";
import type { CardProps } from "../types/card-component";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { supabase } from "../supabaseClient";
// MUI imports
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
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

  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setPortfolio(data);
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
        setPortfolio(data);
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
    logo: "",
  };

  const totalGainLossCard: CardProps = {
    name: "Total Gain/Loss",
    amount: 3200,
    lastChange: -2.3,
    logo: "",
  };

  const todaysChangeCard: CardProps = {
    name: "Today's Change",
    amount: 150,
    lastChange: 1.1,
    logo: "",
  };

  const handleSave = async () => {
    if (!date) return; // prevent saving without a date

    const newHolding = {
      symbol: search,
      price: parseFloat(price),
      shares: parseInt(shares),
      date_purchase: date.format("YYYY-MM-DD"), // ✅ convert to string
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

      {/* Portfolio List */}
      <div style={{ width: "100%", marginTop: "20px" }}>
        <Typography variant="h6">Portfolio Holdings</Typography>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : portfolio.length === 0 ? (
          <Typography>No holdings found. Add your first transaction!</Typography>
        ) : (
          <List>
            {portfolio.map((holding, index) => (
              <ListItem key={index} divider>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '10px' }}>
                  <Typography variant="body1" style={{ fontWeight: 'bold' }}>{holding.stock}</Typography>
                  <div>
                    <Typography variant="body2">{holding.shares} shares @ ${holding.price}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total: ${(holding.shares * holding.price).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Purchased: {holding.date}
                    </Typography>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
