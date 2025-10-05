export type CardProps = {
  name: string;
  amount?: number;
  lastChange?: number;
  logo?: string | React.ReactNode; // allow image URL or React Icon
};