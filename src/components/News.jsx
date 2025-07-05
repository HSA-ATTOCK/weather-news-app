import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import "../styles/news.css";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("pk");

  const apiKey = process.env.REACT_APP_NEWSAPI_KEY;

  const categories = [
    { value: "general", label: "General" },
    { value: "business", label: "Business" },
    { value: "technology", label: "Tech" },
    { value: "science", label: "Science" },
    { value: "health", label: "Health" },
    { value: "sports", label: "Sports" },
    { value: "entertainment", label: "Entertainment" },
  ];

  const countries = [
    { value: "us", label: "USA" },
    // { value: "pk", label: "Pakistan" },

    // { value: "gb", label: "UK" },
    // { value: "ca", label: "Canada" },
    // { value: "au", label: "Australia" },
    // { value: "in", label: "India" },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      if (!apiKey) {
        setError("API key is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setExpandedArticle(null);

        // NewsAPI.org endpoint
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=10&page=${page}&apiKey=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            response.status === 401 ? "Invalid API key" : "Failed to fetch news"
          );
        }

        const data = await response.json();

        if (data.articles.length === 0) {
          throw new Error("No news available for this category/country.");
        }

        setArticles(data.articles);
      } catch (err) {
        console.error("Error:", err.message);
        setError(err.message);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchNews();
    }, 500); // Throttle requests

    return () => clearTimeout(timer);
  }, [apiKey, page, category, country]);

  const toggleExpandArticle = (index) => {
    setExpandedArticle(expandedArticle === index ? null : index);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className="news-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="news-header">
        <h2 className="news-title">
          <motion.span
            className="news-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            📰
          </motion.span>
          Latest News
        </h2>

        <div className="news-filters">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <motion.div
          className="news-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner"></div>
          <p>Loading news...</p>
        </motion.div>
      ) : error ? (
        <motion.div
          className="news-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
          <button
            className="retry-button"
            onClick={() => {
              setPage(1);
              setError(null);
            }}
          >
            Try Again
          </button>
        </motion.div>
      ) : (
        <>
          <div className="news-list">
            {articles.map((article, index) => (
              <motion.div
                className={`news-item ${
                  expandedArticle === index ? "expanded" : ""
                }`}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="news-link"
                  onClick={() => toggleExpandArticle(index)}
                >
                  <div className="article-header">
                    <h3 className="article-title">{article.title}</h3>
                    <FiExternalLink className="external-icon" />
                  </div>

                  <div className="article-meta">
                    <span className="news-source">{article.source?.name}</span>
                    <span className="news-date">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedArticle === index && (
                    <motion.div
                      className="article-expanded"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {article.urlToImage && (
                        <div className="article-image-container">
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="article-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <p className="article-description">
                        {article.description || "No description available."}
                      </p>
                      <div className="article-actions">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="read-more-btn"
                        >
                          Read Full Story <FiExternalLink />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="news-pagination">
            <motion.button
              className="pagination-btn"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Previous
            </motion.button>

            <span className="page-number">Page {page}</span>

            <motion.button
              className="pagination-btn"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={articles.length < 10}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default News;
