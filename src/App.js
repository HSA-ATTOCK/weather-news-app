// App.js
import "./App.css";
import Weather from "./components/Weather.jsx";
import News from "./components/News.jsx";
import Quote from "./components/Quote.jsx";

function App() {
  return (
    <div className="App">
      <h1 className="dashboard-title">🌤 Dashboard</h1>
      <div className="dashboard-grid">
        <Quote />
        <div className="horizontal-cards">
          <Weather />
          <News />
        </div>
      </div>
    </div>
  );
}

export default App;
