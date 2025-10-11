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
  gainLoss: number; // in %
}

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const columnHelper = createColumnHelper<Holding>();

  // ---- Compute Totals ----
  const totals = useMemo(() => {
    const totalQuantity = holdings.reduce((acc, h) => acc + h.quantity, 0);
    const totalCost = holdings.reduce(
      (acc, h) => acc + h.avgCost * h.quantity,
      0
    );
    const totalMarketValue = holdings.reduce(
      (acc, h) => acc + h.marketValue,
      0
    );
    const totalGainLossDollar = holdings.reduce(
      (acc, h) => acc + (h.currentPrice - h.avgCost) * h.quantity,
      0
    );

    const totalGainLossPct =
      totalCost > 0 ? ((totalMarketValue - totalCost) / totalCost) * 100 : 0;

    return {
      totalQuantity,
      totalMarketValue,
      totalGainLossDollar,
      totalGainLossPct,
    };
  }, [holdings]);

  // ---- Define Columns ----
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
      // new Gain/Loss $ column
      columnHelper.display({
        id: "gainLossDollar",
        header: "Gain/Loss ($)",
        cell: (info) => {
          const row = info.row.original;
          const gainLossDollar =
            (row.currentPrice - row.avgCost) * row.quantity;
          const isPositive = gainLossDollar >= 0;
          return (
            <span className={isPositive ? "gain" : "loss"}>
              {isPositive ? "+" : ""}
              ${gainLossDollar.toFixed(2)}
            </span>
          );
        },
      }),
      columnHelper.accessor("gainLoss", {
        header: "Gain/Loss (%)",
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

  // ---- Render ----
  return (
    <div className="holdings-table-container">
      <table className="holdings-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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

          {/* Total Row */}
          <tr className="total-row">
            <td><strong>Total</strong></td>
            <td>{totals.totalQuantity}</td>
            <td>--</td>
            <td>--</td>
            <td>${totals.totalMarketValue.toFixed(2)}</td>
            <td className={totals.totalGainLossDollar >= 0 ? "gain" : "loss"}>
              {totals.totalGainLossDollar >= 0 ? "+" : ""}
              ${totals.totalGainLossDollar.toFixed(2)}
            </td>
            <td className={totals.totalGainLossPct >= 0 ? "gain" : "loss"}>
              {totals.totalGainLossPct.toFixed(2)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
