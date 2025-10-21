import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import '../styles/PortfolioRating.css';
import { supabase } from '../supabaseClient';

interface PortfolioHolding {
  id: number;
  symbol: string;
  shares: number;
  price: number;
  date_purchase: string;
}

interface PortfolioRating {
  id: number;
  rating: number;
  summary: string;
  user_id: string;
  created_at?: string;
}

interface PortfolioRatingProps {
  holdings: PortfolioHolding[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  userId: string;

}

export default function PortfolioRating({ 
  holdings, 
  supabaseUrl, 
  supabaseAnonKey,
  userId
}: PortfolioRatingProps) {
  const [rating, setRating] = useState<PortfolioRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing analysis on component mount
  useEffect(() => {
    fetchExistingAnalysis();
  }, [userId]);

  const fetchExistingAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned", which is fine
        throw fetchError;
      }

      if (data) {
        setRating(data as PortfolioRating);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      // Don't set error for "no rows" case
      if (err instanceof Error && !err.message.includes('no rows')) {
        setError('Failed to load existing analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzePortfolio = async () => {
    setAnalyzing(true);
    setError(null);

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

      // Call edge function to generate analysis
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

      const analysisData = await response.json();

      // Save analysis to Supabase
      const { data: savedData, error: saveError } = await supabase
        .from('analysis')
        .upsert({
          user_id: userId,
          rating: analysisData.rating,
          summary: analysisData.summary,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setRating(savedData as PortfolioRating);
    } catch (err) {
      console.error('Error analyzing portfolio:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-rating-container">
        <div className="portfolio-rating-card">
          <div className="portfolio-rating-header">
            <h2 className="portfolio-rating-title">
              <TrendingUp className="icon" />
              Portfolio Analysis
            </h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="icon icon-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-rating-container">
      <div className="portfolio-rating-card">
        <div className="portfolio-rating-header">
          <h2 className="portfolio-rating-title">
            <TrendingUp className="icon" />
            Portfolio Analysis
          </h2>

          <button
            onClick={analyzePortfolio}
            disabled={analyzing || holdings.length === 0}
            className="analyze-button"
          >
            {analyzing ? (
              <>
                <Loader2 className="icon icon-spin" />
                Analyzing...
              </>
            ) : (
              rating ? 'Re-analyze Portfolio' : 'Analyze Portfolio'
            )}
          </button>
        </div>
        
        {holdings.length === 0 && (
          <p className="no-holdings-text">
            No holdings to analyze
          </p>
        )}

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
    </div>
  );
}