import { useEffect, useState } from "react";

function App() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/roadmap/1")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch roadmap");
        }
        return res.json();
      })
      .then((data) => {
        setRoadmap(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading roadmap...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Data Scientist Roadmap</h1>

      <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
        {roadmap.map((skill) => (
          <div
            key={skill.skill_id}
            style={{
              padding: "16px",
              minWidth: "120px",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              backgroundColor:
                skill.skill_state === "COMPLETED"
                  ? "#2e7d32"
                  : skill.skill_state === "AVAILABLE"
                  ? "#f9a825"
                  : "#c62828",
              color: "#fff",
            }}
          >
            {skill.name}
            <div style={{ fontSize: "12px", marginTop: "6px" }}>
              {skill.skill_state}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
