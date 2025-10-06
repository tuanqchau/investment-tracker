export type CardProps = {
  name: string;
  amount?: number;
  lastChange?: number;
  showDollarSign?: boolean;
  logo?: string | React.ReactNode; // allow image URL or React Icon
};