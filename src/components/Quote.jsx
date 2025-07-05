import React, { useEffect, useState } from "react";
import "../styles/quote.css";

const Quote = () => {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const proxy = "https://corsproxy.io/?";
        const url =
          proxy + encodeURIComponent("https://zenquotes.io/api/today");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch quote");

        const data = await response.json();
        setQuote(data[0]);
      } catch (err) {
        console.error("Quote fetch error:", err);
        setError("Failed to load quote. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="quote-card">
      <div className="quote-header">
        <h2 className="quote-title">
          <span className="quote-icon">🌟</span> Quote of the Day
        </h2>
      </div>

      {error && <div className="quote-error">⚠️ {error}</div>}

      {loading ? (
        <div className="quote-loading">
          <div className="loading-spinner"></div>
          Loading quote...
        </div>
      ) : quote ? (
        <>
          <div className="quote-content">{quote.q}</div>
          <div className="quote-author">— {quote.a}</div>
        </>
      ) : null}
    </div>
  );
};

export default Quote;
