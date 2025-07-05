import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiSun, FiMoon } from "react-icons/fi";
import newsData from "./news.json";
import "../styles/news.css";

const News = () => {
  // State declarations
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [error, setError] = useState(null);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [category, setCategory] = useState("top");
  const [country, setCountry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark mode class to body on mount and when darkMode changes
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Constants
  const itemsPerPage = 5;
  const categories = useMemo(
    () => [
      { value: "top", label: "Top Stories" },
      // ... other categories
    ],
    []
  );

  const countries = useMemo(
    () => [
      { value: "all", label: "All Countries" },
      // ... other countries
    ],
    []
  );

  // Memoized helper functions
  const isPakistaniSource = useCallback((sourceId) => {
    const pakistaniSources = ["geo", "aaj_tv", "pakobserver"];
    if (!sourceId) return false;
    return pakistaniSources.some((source) =>
      sourceId.toLowerCase().includes(source.toLowerCase())
    );
  }, []);

  const isPakistaniCountry = useCallback((countries) => {
    return countries?.includes("pakistan");
  }, []);

  // Filter and process news data
  useEffect(() => {
    const processNewsData = () => {
      try {
        let categoryFiltered = newsData.filter(
          (article) =>
            category === "top" || article.category?.includes(category)
        );

        if (country !== "all") {
          categoryFiltered = categoryFiltered.filter((article) =>
            article.country?.some((c) =>
              c.toLowerCase().includes(country.toLowerCase())
            )
          );
        }

        const sortedByDate = [...categoryFiltered].sort((a, b) => {
          return new Date(b.pubDate) - new Date(a.pubDate);
        });

        const pkArticles = sortedByDate.filter(
          (article) =>
            isPakistaniSource(article.source_id) ||
            isPakistaniCountry(article.country)
        );

        const otherArticles = sortedByDate.filter(
          (article) =>
            !isPakistaniSource(article.source_id) &&
            !isPakistaniCountry(article.country)
        );

        setFilteredArticles([...pkArticles, ...otherArticles]);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error processing news data:", err);
        setError("Failed to load news data");
      }
    };

    processNewsData();
  }, [category, country, isPakistaniSource, isPakistaniCountry]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const toggleExpandArticle = useCallback(
    (index) => {
      setExpandedArticle(expandedArticle === index ? null : index);
    },
    [expandedArticle]
  );

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  return (
    <motion.div
      className={`news-card ${darkMode ? "dark" : ""}`}
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
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`filter-select ${darkMode ? "dark" : ""}`}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="country-filter">Country:</label>
            <select
              id="country-filter"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`filter-select ${darkMode ? "dark" : ""}`}
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* <button
            onClick={toggleDarkMode}
            className={`dark-mode-toggle ${darkMode ? "dark" : ""}`}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button> */}
        </div>
      </div>

      {error ? (
        <motion.div
          className="news-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      ) : (
        <>
          <div className="news-list">
            {currentArticles.length > 0 ? (
              currentArticles.map((article, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const isPakistani =
                  isPakistaniSource(article.source_id) ||
                  isPakistaniCountry(article.country);

                return (
                  <motion.div
                    className={`news-item ${
                      expandedArticle === globalIndex ? "expanded" : ""
                    } ${isPakistani ? "pakistani-news" : ""} ${
                      darkMode ? "dark" : ""
                    }`}
                    key={`${globalIndex}-${article.article_id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="news-link"
                      onClick={() => toggleExpandArticle(globalIndex)}
                    >
                      {isPakistani && (
                        <div className="pakistani-label">Pakistan</div>
                      )}
                      <div className="article-header">
                        <h3 className="article-title">{article.title}</h3>
                        <FiExternalLink className="external-icon" />
                      </div>

                      <div className="article-meta">
                        <span className="news-source">
                          {article.source_name || article.source_id}
                        </span>
                        <span className="news-date">
                          {formatDate(article.pubDate)}
                        </span>
                        {article.country && (
                          <span className="news-country">
                            {article.country.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedArticle === globalIndex && (
                        <motion.div
                          className="article-expanded"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {article.image_url && (
                            <div className="article-image-container">
                              <img
                                src={article.image_url}
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
                          {article.keywords && (
                            <div className="article-keywords">
                              <strong>Keywords:</strong>{" "}
                              {article.keywords.join(", ")}
                            </div>
                          )}
                          <div className="article-actions">
                            <a
                              href={article.link}
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
                );
              })
            ) : (
              <div className={`no-articles ${darkMode ? "dark" : ""}`}>
                No articles found for these filters.
              </div>
            )}
          </div>

          {filteredArticles.length > itemsPerPage && (
            <div className={`pagination-controls ${darkMode ? "dark" : ""}`}>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`pagination-button ${darkMode ? "dark" : ""}`}
              >
                Previous
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`pagination-button ${darkMode ? "dark" : ""}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default News;
