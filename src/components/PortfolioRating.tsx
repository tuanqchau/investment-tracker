import { useState } from 'react';
import { AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import '../styles/PortfolioRating.css';

interface PortfolioHolding {
  id: number;
  symbol: string;
  shares: number;
  price: number;
  date_purchase: string;
}

interface PortfolioRating {
  rating: number;
  summary: string;
}

interface PortfolioRatingProps {
  holdings: PortfolioHolding[];
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export default function PortfolioRating({ holdings, supabaseUrl, supabaseAnonKey }: PortfolioRatingProps) {
  const [rating, setRating] = useState<PortfolioRating | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePortfolio = async () => {
    setLoading(true);
    setError(null);
    setRating(null);

    try {
      // Transform holdings into a more analyzable format
      const portfolioData = holdings.map(holding => ({
        symbol: holding.symbol,
        shares: holding.shares,
        value: holding.shares * holding.price,
        allocation: 0 // Will calculate below
      }));

      // Calculate total value and allocations
      const totalValue = portfolioData.reduce((sum, h) => sum + h.value, 0);
      portfolioData.forEach(h => {
        h.allocation = Math.round((h.value / totalValue) * 100);
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/portfolio-rating`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio: {
            holdings: portfolioData,
            totalValue,
            holdingCount: holdings.length
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze portfolio');
      }

      const data = await response.json();
      setRating(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-rating-container">
      <div className="portfolio-rating-card">
        <h2 className="portfolio-rating-title">
          <TrendingUp className="icon" />
          Portfolio Analysis
        </h2>

        <button
          onClick={analyzePortfolio}
          disabled={loading || holdings.length === 0}
          className="analyze-button"
        >
          {loading ? (
            <>
              <Loader2 className="icon icon-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Portfolio'
          )}
        </button>

        {holdings.length === 0 && (
          <p className="no-holdings-text">
            No holdings to analyze
          </p>
        )}
      </div>

      {error && (
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <div>
            <h3 className="error-title">Error</h3>
            <p className="error-message">{error}</p>
          </div>
        </div>
      )}

      {rating && (
        <div className="rating-card">
          <div className="rating-header">
            <h3 className="rating-title">Rating</h3>
            <div className="rating-score">
              <span className="rating-number">{rating.rating}</span>
              <span className="rating-max">/10</span>
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${(rating.rating / 10) * 100}%` }}
            />
          </div>

          <div>
            <h4 className="analysis-title">Analysis</h4>
            <p className="analysis-text">
              {rating.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}