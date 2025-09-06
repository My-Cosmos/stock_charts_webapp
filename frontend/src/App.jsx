import { useEffect, useState } from "react";

function App() {
  const [charts, setCharts] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/charts/nifty")
      .then(res => res.json())
      .then(data => setCharts(data))
      .catch(err => console.error("Error fetching charts:", err));
  }, []);

  // Sort dates newest first
  const sortedDates = Object.keys(charts).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Nifty Chart Timeline</h1>

      {sortedDates.length === 0 && (
        <p className="text-gray-500 text-center">No charts found</p>
      )}

      <div className="space-y-6">
        {sortedDates.map((date) => {
          const data = charts[date];
          if (!data) return null;

          const overview = data.overview || null;
          const detailed = data.detailed || [];
          const tags = data.tags || [];
          const descriptions = data.descriptions || [];
          const summaries = data.summaries || [];

          return (
            <div key={date} className="bg-white shadow-md rounded-2xl p-4 border border-gray-200">
              <h2 className="text-xl font-semibold mb-2">{date}</h2>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Descriptions */}
              {descriptions.length > 0 && (
                <ul className="list-disc list-inside text-gray-600 mb-3">
                  {descriptions.map((desc, idx) => (
                    <li key={idx}>{desc}</li>
                  ))}
                </ul>
              )}

              {/* Overview */}
              {overview && (
                <div className="mb-3">
                  <p className="text-gray-600 mb-1 font-medium">Overview</p>
                  <img
                    src={`http://127.0.0.1:8000${overview}`}
                    alt={`Overview ${date}`}
                    className="rounded-xl shadow-sm max-h-64 w-full object-contain"
                  />
                </div>
              )}

              {/* Detailed */}
              {detailed.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 hover:underline font-medium">
                    Show Detailed Charts ({detailed.length})
                  </summary>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {detailed.map((chart, idx) => (
                      <img
                        key={idx}
                        src={`http://127.0.0.1:8000${chart}`}
                        alt={`Detailed ${date}-${idx}`}
                        className="rounded-xl shadow-sm max-h-64 w-full object-contain"
                      />
                    ))}
                  </div>
                </details>
              )}

              {/* Summaries */}
              {summaries.length > 0 && (
                <div className="mt-2 text-gray-700 text-sm">
                  <strong>Summary:</strong> {summaries.join("; ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
