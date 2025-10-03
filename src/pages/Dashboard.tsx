import React, { useState } from "react";
import Card from "../components/DisplayCard";
import type { CardProps } from "../types/card-component";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
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

  const handleSave = () => {
    if (!date) return; // prevent saving without a date

    const newTransaction = {
      stock: search,
      price: parseFloat(price),
      shares: parseInt(shares),
      date: date.format("YYYY-MM-DD"), // ✅ convert to string
    };

    setPortfolio([...portfolio, newTransaction]);
    setIsModalOpen(false);
    
    setSearch("");
    setPrice("");
    setShares("");
    setDate(null);
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

      {/* Debug portfolio */}
      <div style={{ width: "100%", marginTop: "20px" }}>
        <Typography variant="h6">Portfolio (debug view)</Typography>
        <pre>{JSON.stringify(portfolio, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Dashboard;
