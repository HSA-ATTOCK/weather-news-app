import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/quote.css";

const Quote = () => {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeTrigger, setFadeTrigger] = useState(false);

  const quoteIcons = ["🌟", "💬", "📜", "✨", "🔮", "🎯", "🧠", "💡"];
  const [currentIcon, setCurrentIcon] = useState("🌟");

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentIcon(quoteIcons[Math.floor(Math.random() * quoteIcons.length)]);

      const proxy = "https://corsproxy.io/?";
      const url = proxy + encodeURIComponent("https://zenquotes.io/api/random");

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch quote");

      const data = await response.json();

      setFadeTrigger(true);
      setTimeout(() => {
        setQuote(data[0]); // { q: "...", a: "..." }
        setFadeTrigger(false);
      }, 300);
    } catch (err) {
      console.error("Quote fetch error:", err);
      setError("Failed to load quote. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const quoteIcons = ["🌟", "💬", "📜", "✨", "🔮", "🎯", "🧠", "💡"];

    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentIcon(
          quoteIcons[Math.floor(Math.random() * quoteIcons.length)]
        );

        const proxy = "https://corsproxy.io/?";
        const url =
          proxy + encodeURIComponent("https://zenquotes.io/api/random");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch quote");

        const data = await response.json();

        setFadeTrigger(true);
        setTimeout(() => {
          setQuote(data[0]);
          setFadeTrigger(false);
        }, 300);
      } catch (err) {
        console.error("Quote fetch error:", err);
        setError("Failed to load quote. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setFadeTrigger(true);
    setTimeout(() => {
      setQuote(null);
      fetchQuote();
    }, 300);
  };

  return (
    <motion.div
      className="quote-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="quote-header">
        <h2 className="quote-title">
          <motion.span
            className="quote-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {currentIcon}
          </motion.span>
          Quote of the Day
        </h2>
        <motion.button
          className="refresh-button"
          onClick={handleRefresh}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Get new quote"
        >
          🔄
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="quote-error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div
          className="quote-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner"></div>
          Loading inspiration...
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {quote && !fadeTrigger && (
            <motion.div
              key={quote.q}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="quote-content"
                whileHover={{ scale: 1.01 }}
              >
                "{quote.q}"
              </motion.div>
              <motion.div
                className="quote-author"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                — {quote.a}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="quote-footer">
        <small>Words have power. Reflect on this daily.</small>
      </div>
    </motion.div>
  );
};

export default Quote;
