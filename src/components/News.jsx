import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../styles/news.css";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("pk");

  const apiKey = process.env.REACT_APP_GNEWS_KEY;
  const proxy = "https://corsproxy.io/?";

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
    { value: "pk", label: "Pakistan" },
    { value: "us", label: "USA" },
    { value: "gb", label: "UK" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "in", label: "India" },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      if (!apiKey) {
        console.warn("API key is missing");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setExpandedArticle(null);

        const baseUrl = `https://gnews.io/api/v4`;

        const localUrl =
          proxy +
          encodeURIComponent(
            `${baseUrl}/top-headlines?category=${category}&country=${country}&max=1&token=${apiKey}`
          );

        const globalUrl =
          proxy +
          encodeURIComponent(
            `${baseUrl}/top-headlines?category=${category}&lang=en&token=${apiKey}&max=5&page=${page}`
          );

        const [localRes, globalRes] = await Promise.all([
          fetch(localUrl),
          fetch(globalUrl),
        ]);

        if (!localRes.ok || !globalRes.ok) {
          throw new Error("Failed to fetch news");
        }

        const localData = await localRes.json();
        const globalData = await globalRes.json();

        const localArticles = localData.articles || [];
        const globalArticles = globalData.articles || [];

        const combinedArticles = [
          ...localArticles,
          ...globalArticles
            .filter(
              (article) =>
                !localArticles.some((local) => local.title === article.title)
            )
            .slice(0, 6),
        ];

        if (combinedArticles.length === 0) {
          throw new Error("No news available for this category.");
        }

        setArticles(combinedArticles);
      } catch (err) {
        console.error("❌ Error:", err.message);
        setError(err.message);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchNews();
    }, 800); // Delay to avoid hitting rate limit on fast reloads

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
          <p>Gathering the latest news...</p>
        </motion.div>
      ) : error && articles.length === 0 ? (
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
                    {article.source?.name && (
                      <span className="news-source">{article.source.name}</span>
                    )}
                    {article.publishedAt && (
                      <span className="news-date">
                        {formatDate(article.publishedAt)}
                      </span>
                    )}
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
                      {article.image && (
                        <div className="article-image-container">
                          <img
                            src={article.image}
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

          {/* <div className="news-pagination">
            <motion.button
              className="pagination-btn"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiChevronLeft /> Previous
            </motion.button>

            <span className="page-number">Page {page}</span>

            <motion.button
              className="pagination-btn"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={articles.length < 5}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next <FiChevronRight />
            </motion.button>
          </div> */}
        </>
      )}
    </motion.div>
  );
};

export default News;
