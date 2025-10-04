import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/HoldingsTable.css';
import type { GridColDef } from '@mui/x-data-grid';

interface Holding {
  id: number;
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
}

interface HoldingsTableProps {
  holdings: Holding[];
}

const columns: GridColDef[] = [
  { field: 'symbol', headerName: 'Symbol', flex: 1, },
  { field: 'quantity', headerName: 'Quantity', flex: 1, },
  {
    field: 'avgCost',
    headerName: 'Avg Cost',
    flex: 1,
    valueFormatter: ({ value }: { value: number | undefined }) => {
      if (value == null || isNaN(value)) return '';
      return `$${value.toFixed(2)}`;
    },
    
  },
  {
    field: 'currentPrice',
    headerName: 'Current Price',
    flex: 1,
    valueFormatter: ({ value }: { value: number | undefined }) => {
      if (value == null || isNaN(value)) return '';
      return `$${value.toFixed(2)}`;
    },
   
  },
  {
    field: 'marketValue',
    headerName: 'Market Value',
    flex: 1,
    valueFormatter: ({ value }: { value: number | undefined }) => {
      if (value == null || isNaN(value)) return '';
      return `$${value.toFixed(2)}`;
    },

  },
  {
    field: 'gainLoss',
    headerName: 'Gain/Loss',
    flex: 1,

    renderCell: (params: any) => {
      const val = params?.value;
      if (val == null || isNaN(val)) {
        // Log unexpected values for debugging
        // console.debug('HoldingsTable: invalid gainLoss value', val, params);
        return '';
      }
      const isPositive = val >= 0;
      const display = `${isPositive ? '+' : ''}${Number(val).toFixed(2)}%`;
      return (
        <span className={isPositive ? 'gain' : 'loss'}>
          {display}
        </span>
      );
    },
  },
];

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={holdings}
        columns={columns}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          '& .MuiDataGrid-cell': { fontSize: 14 },
          backgroundColor: '#21242C',
          header: { backgroundColor: '#21242C' },
          color: '#fff',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#3a3a3a', // slightly lighter for header
          },
        }}
      />
    </div>
  );
}
