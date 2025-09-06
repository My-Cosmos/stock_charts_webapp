import { useEffect, useState } from "react";

function App() {
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("nifty"); // default
  const symbols = ["nifty", "sensex", "banknifty", "all"];

  useEffect(() => {
    const fetchCharts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/charts/${symbol}`);
        const data = await res.json();
        setCharts(data);
      } catch (err) {
        console.error("Error fetching charts:", err);
        setCharts({});
      } finally {
        setLoading(false);
      }
    };
    fetchCharts();
  }, [symbol]);

  // helper: render a single-symbol block
  const renderSingleSymbolBlock = (date, data) => (
    <div key={date} className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3">{date}</h2>
      {data.overview && (
        <img
          src={`http://127.0.0.1:8000${data.overview}`}
          alt={`Overview ${date}`}
          className="w-full rounded mb-3"
        />
      )}
      {data.tags?.length > 0 && (
        <p className="text-sm text-gray-600 mb-2">
          <strong>Tags:</strong> {data.tags.join(", ")}
        </p>
      )}
      {data.descriptions?.map((desc, idx) => (
        <p key={idx} className="text-sm">• {desc}</p>
      ))}
    </div>
  );

  if (loading) {
    return <div className="p-6">Loading charts...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Chart Timeline</h1>

      {/* Symbol Selector */}
      <div className="flex gap-4 mb-6">
        {symbols.map((sym) => (
          <button
            key={sym}
            onClick={() => setSymbol(sym)}
            className={`px-4 py-2 rounded-lg ${
              symbol === sym
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {sym.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(charts).map(([date, data]) => {
          if (symbol === "all") {
            // ✅ multiple symbols per date
            return (
              <div key={date} className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-3">{date}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(data).map(([sym, symData]) => (
                    <div key={sym} className="border p-2 rounded">
                      <h3 className="font-bold mb-2">{sym.toUpperCase()}</h3>
                      {symData?.overview && (
                        <img
                          src={`http://127.0.0.1:8000${symData.overview}`}
                          alt={`${sym} ${date}`}
                          className="w-full rounded mb-2"
                        />
                      )}
                      {symData?.tags?.length > 0 && (
                        <p className="text-xs text-gray-600 mb-2">
                          Tags: {symData.tags.join(", ")}
                        </p>
                      )}
                      {symData?.descriptions?.map((d, i) => (
                        <p key={i} className="text-xs">• {d}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          } else {
            // ✅ normal single symbol
            return renderSingleSymbolBlock(date, data);
          }
        })}
      </div>
    </div>
  );
}

export default App;
