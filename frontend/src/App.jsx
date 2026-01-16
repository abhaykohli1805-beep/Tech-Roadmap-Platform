import { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/roadmap/1")
      .then((res) => res.json())
      .then((data) => {
        // Create nodes
        const flowNodes = data.map((skill, index) => ({
          id: skill.skill_id.toString(),
          position: { x: index * 200, y: 100 },
          data: { label: skill.name },
          style: {
            background:
              skill.skill_state === "COMPLETED"
                ? "#2e7d32"
                : skill.skill_state === "AVAILABLE"
                ? "#f9a825"
                : "#c62828",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            fontWeight: "bold",
          },
        }));

        // Create edges (Python → NumPy)
        const flowEdges = data.slice(1).map((skill, index) => ({
          id: `e${data[index].skill_id}-${skill.skill_id}`,
          source: data[index].skill_id.toString(),
          target: skill.skill_id.toString(),
          animated: true,
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;

