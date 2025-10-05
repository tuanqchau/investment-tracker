import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import "../styles/HoldingsTable.css";

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

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const columnHelper = createColumnHelper<Holding>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("symbol", { header: "Symbol" }),
      columnHelper.accessor("quantity", { header: "Quantity" }),
      columnHelper.accessor("avgCost", {
        header: "Avg Cost",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("currentPrice", {
        header: "Current Price",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("marketValue", {
        header: "Market Value",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("gainLoss", {
        header: "Gain/Loss",
        cell: (info) => {
          const val = info.getValue();
          const isPositive = val >= 0;
          const display = `${isPositive ? "+" : ""}${val.toFixed(2)}%`;
          return (
            <span className={isPositive ? "gain" : "loss"}>{display}</span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: holdings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="holdings-table-container">
      <table className="holdings-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
