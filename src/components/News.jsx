import React, { useEffect, useState } from "react";
import "../styles/news.css";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const apiKey = process.env.REACT_APP_GNEWS_KEY;
  const proxy = "https://corsproxy.io/?";
  const keyword = "world";

  useEffect(() => {
    const fetchNews = async () => {
      if (!apiKey) return;

      try {
        setLoading(true);
        setError(null);

        const baseUrl = `https://gnews.io/api/v4`;

        // Pakistani news on page 1 only
        let pakistaniArticle = null;
        if (page === 1) {
          const pkUrl =
            proxy +
            encodeURIComponent(
              `${baseUrl}/top-headlines?lang=en&country=pk&max=1&token=${apiKey}`
            );
          const pkRes = await fetch(pkUrl);
          if (pkRes.ok) {
            const pkData = await pkRes.json();
            pakistaniArticle = pkData.articles?.[0] || null;
          }
        }

        // Global news
        const globalUrl =
          proxy +
          encodeURIComponent(
            `${baseUrl}/search?q=${keyword}&lang=en&token=${apiKey}&max=5&page=${page}`
          );
        const globalRes = await fetch(globalUrl);
        if (!globalRes.ok) throw new Error("Failed to fetch global news");

        const globalData = await globalRes.json();

        const filteredGlobal = globalData.articles.filter(
          (article) => article.title !== pakistaniArticle?.title
        );

        const combinedArticles =
          page === 1 && pakistaniArticle
            ? [pakistaniArticle, ...filteredGlobal]
            : filteredGlobal;

        if (combinedArticles.length === 0) {
          throw new Error("No news available.");
        }

        setArticles(combinedArticles);
      } catch (err) {
        console.error("❌ Error:", err.message);
        setError("⚠️ Failed to load news.");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [apiKey, page]);

  return (
    <div className="news-card">
      <div className="news-header">
        <h2 className="news-title">
          <span className="news-icon">📰</span> News
        </h2>
      </div>

      {loading ? (
        <div className="news-loading">
          <div className="loading-spinner"></div>
          Loading news...
        </div>
      ) : error && articles.length === 0 ? (
        <div className="news-error">{error}</div>
      ) : (
        <>
          <div className="news-list">
            {articles.map((article, index) => (
              <div className="news-item" key={index}>
                <a
                  href={article.url}
                  className="news-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title}
                  {article.source?.name && (
                    <span className="news-source">{article.source.name}</span>
                  )}
                  {article.publishedAt && (
                    <span className="news-date">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </a>
              </div>
            ))}
          </div>

          <div className="news-pagination">
            <button
              className="pagination-btn"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ⬅ Back
            </button>
            <span className="page-number">Page {page}</span>
            <button
              className="pagination-btn"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === 2}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default News;
