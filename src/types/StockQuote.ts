export interface StockQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high price
  l: number; // low price
  o: number; // open price
  pc: number; // previous close
}