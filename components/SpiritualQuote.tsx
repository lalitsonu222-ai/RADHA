
import React, { useState, useEffect } from 'react';
import { fetchDailySpiritualMessage } from '../services/geminiService';
import { ThemeColors } from '../types';

interface QuoteProps {
  theme: ThemeColors;
}

const SpiritualQuote: React.FC<QuoteProps> = ({ theme }) => {
  const [quote, setQuote] = useState<{ hindi: string; english: string; author: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuote = async () => {
      const data = await fetchDailySpiritualMessage();
      setQuote(data);
      setLoading(false);
    };
    loadQuote();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col items-center gap-2 p-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
        <div className="h-3 w-32 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-2xl shadow-sm text-center transition-all duration-500 w-full"
      style={{ backgroundColor: theme.card, borderLeft: `4px solid ${theme.primary}` }}
    >
      <p className="hindi-script text-xl md:text-2xl font-bold mb-2 leading-relaxed" style={{ color: theme.text }}>
        {quote?.hindi}
      </p>
      <p className="text-xs italic opacity-80 font-medium" style={{ color: theme.text }}>
        "{quote?.english}"
      </p>
      <p className="hindi-script text-sm mt-2 font-bold opacity-60" style={{ color: theme.primary }}>
        — {quote?.author}
      </p>
    </div>
  );
};

export default SpiritualQuote;
