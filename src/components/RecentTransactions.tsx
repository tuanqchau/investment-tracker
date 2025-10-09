import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export type Transaction = {
  id: number | string;
  type: string; // 'BUY' | 'SELL'
  symbol: string;
  shares: number;
  price: number; // per-share price
  date: string | number | Date;
  cost_basis?: number; // optional, total cost basis
  gain_loss?: number; // optional, total gain/loss
};

interface RecentTransactionsProps {
  transactions: Transaction[];
  maxItems?: number;
}

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const shortDate = (t: string | number | Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(t)
  );

export default function RecentTransactions({ transactions, maxItems = 6 }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return <Typography variant="body2" color="text.secondary">No recent transactions</Typography>;
  }



  return (
    <List sx={{ width: '100%', bgcolor: 'transparent', color: '#fff', padding: 0 }}>
      {transactions.slice(0, maxItems).map((tx, idx) => {
        const total = tx.shares * tx.price;
        const qtyFormatted =
          Math.abs(tx.shares) < 1 && !Number.isInteger(tx.shares)
            ? tx.shares.toFixed(4)
            : tx.shares.toString();

        return (
          <React.Fragment key={tx.id}>
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Chip
                  label={tx.type}
                  size="small"
                  sx={{
                    minWidth: 48,
                    fontWeight: 700,
                    bgcolor: tx.type === 'BUY' ? '#1fc0e0ff' : '#E91E63',
                    color: '#fff',
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {tx.symbol}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.3}}>
                    {qtyFormatted} @ {currency(tx.price)}
                  </Typography>
                </Box>
                <Box>
                  {tx.gain_loss != null && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          tx.gain_loss > 0
                            ? 'var(--green-yellow)'
                            : tx.gain_loss < 0
                            ? 'var(--primary-red)'
                            : 'text.secondary',
                        fontWeight: 700,
                      }}
                    >
                      {tx.gain_loss > 0 ? '+' : ''}
                      {currency(tx.gain_loss)}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {currency(total)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.3 }}>
                    {shortDate(tx.date)}
                  </Typography>      
                </Box>
              </Box>
            </ListItem>
            {idx !== Math.min(transactions.length, maxItems) - 1 && <Divider component="li" sx={{ borderColor: '#2b2b2b' }} />}
          </React.Fragment>
        );
      })}
    </List>
  );
}
