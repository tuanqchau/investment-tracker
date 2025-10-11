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
import { BiSolidWallet } from "react-icons/bi";
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
import MarketCard from "../components/MarketCard";
import { fetchQuote, fetchCompanyProfile } from "../repositories/finnhub";
import PortfolioRating from "../components/PortfolioRating";

const marketData = [
  {
    name: "Dow Jones",
    value: 46601.78,
    changeAmount: "(-1.20)",
    changePercent: "-0.00%",
  },
  {
    name: "S&P 500",
    value: 6753.72,
    changeAmount: "(+39.13)",
    changePercent: "+0.58%",
  },
  {
    name: "Nasdaq",
    value: 23043.38,
    changeAmount: "(+255.01)",
    changePercent: "+1.12%",
  },
  {
    name: "Russell",
    value: 2483.99,
    changeAmount: "(+25.57)",
    changePercent: "+1.04%",
  },
  {
    name: "VIX",
    value: 16.3,
    changeAmount: "(-0.94)",
    changePercent: "-5.45%",
  },
];

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
  const [transactionType, setTransactionType] = useState("Buy"); // 👈 added
  const [date, setDate] = useState<Dayjs | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transactions[]>([]);

  interface PortfolioHolding {
    id: number;
    symbol: string;
    shares: number;
    price: number;
    date_purchase: string;
  }

  interface Transactions {
    id: number;
    symbol: string;
    type: string;
    shares: number;
    price: number;
    date: string;
  }
  const processHoldingsData = (holdings: PortfolioHolding[]) => {
    const groupedHoldings = holdings.reduce((acc, holding) => {
      const { symbol, shares, price } = holding;
      if (!acc[symbol]) acc[symbol] = { totalShares: 0, totalCost: 0 };
      acc[symbol].totalShares += shares;
      acc[symbol].totalCost += shares * price;
      return acc;
    }, {} as Record<string, { totalShares: number; totalCost: number }>);

    return Object.entries(groupedHoldings).map(([symbol, data], index) => {
      const avgCost = data.totalCost / data.totalShares;
      const currentPrice = avgCost * 1.1; // temporary 10% increase
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

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      if (data) {
        console.log("Fetched transactions:", data);
        setTransactions(data as Transactions[]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }
  const fetchHoldings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      if (data) setPortfolio(data as PortfolioHolding[]);
    } catch (error) {
      console.error("Error fetching holdings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
    fetchTransactions();
    getStockQuote();
  }, [user.id]);
  async function getStockQuote(){
    try {
        const quoteData = await fetchQuote("AAPL");
        const profileData = await fetchCompanyProfile("AAPL");
        console.log("Quote Data:", quoteData);
        console.log("Profile Data:", profileData);
    } catch (error) {
      console.error("Error fetching stock quote:", error);
    }
  }
  const calculateCardValues = (holdings: ReturnType<typeof processHoldingsData>) => {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
    const totalGainLoss = holdings.reduce(
      (sum, h) => sum + (h.marketValue - h.avgCost * h.quantity),
      0
    );
    const gainLossPercentage = Number(
      ((totalGainLoss / (totalValue - totalGainLoss)) * 100).toFixed(2)
    );
    const totalAssets = holdings.length;

    return {
      totalValueCard: {
        name: "Total Value",
        amount: totalValue,
        lastChange: gainLossPercentage,
        logo: <LuCircleDollarSign />,
      },
      totalGainLossCard: {
        name: "Total Gain/Loss",
        amount: totalGainLoss,
        lastChange: gainLossPercentage,
        logo: <FaArrowTrendUp />,
      },
      todaysChangeCard: {
        name: "Today's Change",
        amount: totalGainLoss,
        lastChange: gainLossPercentage,
        logo: <PiPulseBold />,
      },
      totalAssetsCard: {
        name: "Total Assets",
        amount: totalAssets,
        showDollarSign: false,
        logo: <BiSolidWallet />,
      },
    };
  };

  // 🟢 BUY FUNCTION (existing logic, just renamed)
  const handleBuy = async () => {
    if (!date) return;
    if (!user?.id) {
      alert("User not logged in");
      return;
    }

    const symbolMatch = search.match(/\(([^)]+)\)/);
    const symbol = symbolMatch ? symbolMatch[1] : search;

    const newHolding = {
      user_id: user.id,
      symbol,
      price: parseFloat(price),
      shares: parseInt(shares),
      date: date.format("YYYY-MM-DD"),
    };

    try {
      const { error } = await supabase.from("portfolio").insert([newHolding]);
      if (error) throw error;
      await fetchHoldings();


      resetForm();
    } catch (error) {
      console.error("Error saving holding:", error);
      alert("Error saving holding. Please try again.");
    }

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          symbol: symbol,
          type: "BUY",
          shares: parseFloat(shares),
          price: parseFloat(price),
          date: date.format("YYYY-MM-DD"),
          total: parseFloat(price) * parseFloat(shares),
        },
      ]);

    if (transactionError) throw transactionError;
  };

  const handleSell = async () => {
  if (!user?.id) return alert("User not logged in");
  if (!search || !shares || !price || !date) return alert("All fields are required");

  // Extract symbol (e.g., "Apple (AAPL)" → "AAPL")
  const symbolMatch = search.match(/\(([^)]+)\)/);
  const symbol = symbolMatch ? symbolMatch[1] : search;

  try {
    const { data, error } = await supabase.rpc("sell_fifo", {
      p_user_id: user.id,
      p_symbol: symbol,
      p_shares: parseFloat(shares),
      p_price: parseFloat(price),
      p_date: date.format("YYYY-MM-DD"),
    });

    if (error) throw error;

    alert(data || "Sell completed!");
    await fetchHoldings(); // refresh UI
    resetForm();
    setIsModalOpen(false);
  } catch (err) {
    console.error("Sell error:", err);
    alert("Error processing sell. Please check console for details.");
  }
};

  // 🧹 Helper
  const resetForm = () => {
    setIsModalOpen(false);
    setSearch("");
    setPrice("");
    setShares("");
    setDate(null);
    setTransactionType("Buy");
  };

  const handleSave = async () => {
    if (transactionType === "Buy") {
      await handleBuy();
    } else {
      await handleSell();
    }
    await fetchTransactions(); // Refresh transactions after adding a new one
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
// Dow Jones - Negative trend
const dowJonesData = [
  { value: 46600 },
  { value: 46580 },
  { value: 46550 },
  { value: 46520 },
  { value: 46500 },
  { value: 46480 },
  { value: 46450 },
  { value: 46420 },
  { value: 46400 },
  { value: 46380 },
  { value: 46360 },
  { value: 46340 },
  { value: 46358.42 }
];

// S&P 500 - Negative trend
const sp500Data = [
  { value: 6755 },
  { value: 6752 },
  { value: 6748 },
  { value: 6745 },
  { value: 6742 },
  { value: 6740 },
  { value: 6738 },
  { value: 6736 },
  { value: 6735 },
  { value: 6735.11 }
];

// Nasdaq - Negative trend
const nasdaqData = [
  { value: 23045 },
  { value: 23040 },
  { value: 23035 },
  { value: 23030 },
  { value: 23028 },
  { value: 23025 },
  { value: 23024.62 }
];

// Russell - Negative trend
const russellData = [
  { value: 2485 },
  { value: 2483 },
  { value: 2480 },
  { value: 2478 },
  { value: 2476 },
  { value: 2474 },
  { value: 2472 },
  { value: 2470 },
  { value: 2468.85 }
];

// VIX - Positive trend
const vixData = [
  { value: 16.30 },
  { value: 16.28 },
  { value: 16.25 },
  { value: 16.27 },
  { value: 16.30 },
  { value: 16.32 },
  { value: 16.35 },
  { value: 16.38 },
  { value: 16.40 },
  { value: 16.43 }
];

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        maxWidth: "1200px",
        paddingTop: "60px",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* <Button
        onClick={handleLogout}
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
          bgcolor: "transparent",
          color: "var(--primary-text)",
          fontWeight: "bold",
          "&:hover": {
            background: "var(--tri-background)",
          },
          borderRadius: "10px",
        }}
      >
        Log Out
      </Button> */}

      {/* Market Cards */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <MarketCard
        name="S&P 500"
        value={2468.85}
        changeAmount="(-15.14)"
        changePercent="-0.61%"
        chartData={sp500Data}
      />
      <MarketCard
        name="Nasdaq"
        value={2468.85}
        changeAmount="(-15.14)"
        changePercent="-0.61%"
        chartData={nasdaqData}
      />
      <MarketCard
        name="Dow Jones"
        value={2468.85}
        changeAmount="(-15.14)"
        changePercent="-0.61%"
        chartData={dowJonesData}
      />
        <MarketCard
        name="Russell"
        value={2468.85}
        changeAmount="(-15.14)"
        changePercent="-0.61%"
        chartData={russellData}
      />
        <MarketCard
        name="VIX"
        value={16.43}
        changeAmount="(-0.13)"
        changePercent="+0.80%"
        chartData={vixData}
      />
      
      </div>

      {/* Add Transaction */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 35 }}>
        <AddButton onClick={() => setIsModalOpen(true)} name="Add Transaction" />
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {!isLoading && portfolio.length > 0 && (() => {
          const processed = processHoldingsData(portfolio);
          const cards = calculateCardValues(processed);
          return (
            <>
              <Card {...cards.totalValueCard} />
              <Card {...cards.totalGainLossCard} />
              <Card {...cards.todaysChangeCard} />
              <Card {...cards.totalAssetsCard} />
            </>
          );
        })()}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Transaction Type"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            SelectProps={{ native: true }}
            fullWidth
            margin="dense"
          >
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
          </TextField>

          <Autocomplete
            options={stockList}
            value={search}
            onChange={(_, newValue) => setSearch(newValue || "")}
            renderInput={(params) => (
              <TextField {...params} label="Search stock" margin="dense" fullWidth />
            )}
            freeSolo
          />

          <TextField
            fullWidth
            type="number"
            label={transactionType === "Buy" ? "Price Purchased" : "Price Sold"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            margin="dense"
          />

          <TextField
            fullWidth
            type="number"
            label="Number of Shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            margin="dense"
          />

          <DatePicker
            label={transactionType === "Buy" ? "Purchase Date" : "Sell Date"}
            value={date}
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

      {/* Holdings Table */}
      <div style={{ width: "100%" }}>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : portfolio.length === 0 ? (
          <Typography>No holdings found. Add your first transaction!</Typography>
        ) : (
          <HoldingsTable holdings={processHoldingsData(portfolio)} />
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', width: '100%' }}>
        <div style={{ flex: '1 1 480px', minWidth: 320 }}>
          <AllocationPie data={processHoldingsData(portfolio)} />
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 320, paddingTop: 30 }}>
          <RecentTransactions transactions={transactions} />
        </div>
      </div>

      <div>
        <PortfolioRating holdings={portfolio} supabaseUrl={import.meta.env.VITE_SUPABASE_URL} supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY} />
      </div>
    </div>
  );
};

export default Dashboard;
