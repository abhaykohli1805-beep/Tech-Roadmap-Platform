import { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, ReactFlowProvider } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

const nodeWidth = 160;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 40,
    ranksep: 80,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2,
        },
      };
    }),
    edges,
  };
};

function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [skillsMap, setSkillsMap] = useState({});
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/roadmap/1")
      .then((res) => res.json())
      .then((data) => {
        const skillMap = {};
        data.forEach((s) => {
          skillMap[String(s.skill_id)] = s;
        });
        setSkillsMap(skillMap);

        const rawNodes = data.map((skill) => {
          const isLocked = skill.skill_state === "LOCKED";

          return {
            id: String(skill.skill_id),
            data: {
              label: (
                <div
                  title={isLocked ? "Complete prerequisites first" : ""}
                  style={{ pointerEvents: "auto" }}
                >
                  {skill.name}
                </div>
              ),
            },
            style: {
              background:
                skill.skill_state === "COMPLETED"
                  ? "#2e7d32"
                  : skill.skill_state === "AVAILABLE"
                    ? "#f9a825"
                    : "#9e9e9e",
              color: "#fff",
              borderRadius: 8,
              fontWeight: "bold",
              padding: 10,
              cursor: isLocked ? "not-allowed" : "pointer",
              opacity: isLocked ? 0.5 : 1,
              filter: isLocked ? "blur(0.5px)" : "none",
            },
          };
        });

        const rawEdges = data.slice(1).map((skill, index) => ({
          id: `e-${data[index].skill_id}-${skill.skill_id}`,
          source: String(data[index].skill_id),
          target: String(skill.skill_id),
          animated: true,
        }));

        const layouted = getLayoutedElements(rawNodes, rawEdges);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
      });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* FLOWCHART */}
      <div style={{ flex: 1, height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => {
            const skill = skillsMap[node.id];
            if (!skill) return;

            if (skill.skill_state === "LOCKED") {
              return;
            }

            setSelectedSkill(skill);
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* SIDE PANEL */}
      {selectedSkill && (
        <div
          style={{
            width: "320px",
            padding: "20px",
            borderLeft: "1px solid #ddd",
            background: "#fafafa",
          }}
        >
          <button
            onClick={() => setSelectedSkill(null)}
            style={{ float: "right" }}
          >
            ✕
          </button>

          <h2>{selectedSkill.name}</h2>

          <p>
            <strong>Status:</strong> {selectedSkill.skill_state}
          </p>

          <p>
            <strong>Description:</strong>
            <br />
            Detailed explanation, notes, diagrams, and resources will appear
            here.
          </p>

          <p>
            <strong>Next actions:</strong>
          </p>
          <ul>
            <li>📘 Start learning</li>
            <li>✅ Mark as known</li>
            <li>🧪 Take assessment</li>
          </ul>
        </div>
      )}
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
