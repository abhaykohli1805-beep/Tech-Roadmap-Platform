import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/roadmap/1")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const flowNodes = data.map((skill, index) => ({
          id: String(skill.skill_id),
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

        const flowEdges = data.slice(1).map((skill, index) => ({
          id: `e-${data[index].skill_id}-${skill.skill_id}`,
          source: String(data[index].skill_id),
          target: String(skill.skill_id),
          animated: true,
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
