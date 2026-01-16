import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "reactflow";
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
  const [skillDetails, setSkillDetails] = useState(null);

  // Load roadmap
  const loadRoadmap = async () => {
    const res = await fetch("http://localhost:5000/roadmap/1");
    const data = await res.json();

    const map = {};
    data.forEach((s) => (map[String(s.skill_id)] = s));
    setSkillsMap(map);

    const rawNodes = data.map((skill) => {
      const isLocked = skill.skill_state === "LOCKED";

      return {
        id: String(skill.skill_id),
        data: {
          label: (
            <div title={isLocked ? "Complete prerequisites first" : ""}>
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
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  // Fetch skill details
  useEffect(() => {
    if (!selectedSkill) {
      setSkillDetails(null);
      return;
    }

    fetch(`http://localhost:5000/skill/${selectedSkill.skill_id}`)
      .then((res) => res.json())
      .then((data) => setSkillDetails(data))
      .catch(console.error);
  }, [selectedSkill]);

  // Update progress (NO reload)
  const updateProgress = async (status) => {
    try {
      await fetch("http://localhost:5000/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          skillId: selectedSkill.skill_id,
          status,
        }),
      });

      await loadRoadmap();
    } catch (err) {
      console.error("Progress update failed:", err);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* FLOWCHART */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => {
            const skill = skillsMap[node.id];
            if (!skill || skill.skill_state === "LOCKED") return;
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
            color: "#000",
          }}
        >
          <button
            onClick={() => setSelectedSkill(null)}
            style={{
              float: "right",
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>

          {!skillDetails && <p>Loading skill details...</p>}

          {skillDetails && (
            <>
              <h2>{skillDetails.name}</h2>

              <p>
                <strong>Status:</strong> {selectedSkill.skill_state}
              </p>

              <p>
                <strong>Difficulty:</strong>{" "}
                {skillDetails.difficulty_level}
              </p>

              <p>
                <strong>Estimated time:</strong>{" "}
                {skillDetails.estimated_time_hours} hours
              </p>

              <p>{skillDetails.description}</p>

              <p>
                <strong>Prerequisites:</strong>
              </p>

              <ul>
                {skillDetails.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <hr />

              <p>
                <strong>Progress:</strong>
              </p>

              {/* FOGGY COMPLETED BUTTONS */}
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  onClick={() => updateProgress("IN_PROGRESS")}
                  style={{
                    opacity:
                      selectedSkill.skill_state === "COMPLETED" ? 0.6 : 1,
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background:
                      selectedSkill.skill_state === "COMPLETED"
                        ? "#f2f2f2"
                        : "#ffffff",
                  }}
                >
                  ▶ Start
                </button>

                <button
                  onClick={() => updateProgress("COMPLETED")}
                  style={{
                    opacity:
                      selectedSkill.skill_state === "COMPLETED" ? 0.6 : 1,
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #4caf50",
                    background:
                      selectedSkill.skill_state === "COMPLETED"
                        ? "#e8f5e9"
                        : "#4caf50",
                    color:
                      selectedSkill.skill_state === "COMPLETED"
                        ? "#2e7d32"
                        : "#ffffff",
                  }}
                >
                  {selectedSkill.skill_state === "COMPLETED"
                    ? "✔ Completed"
                    : "✅ Mark Completed"}
                </button>
              </div>

              {selectedSkill.skill_state === "COMPLETED" && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#555",
                    background: "#f9f9f9",
                    padding: "6px 8px",
                    borderRadius: "6px",
                  }}
                >
                  You’ve already completed this skill. You can revisit it
                  anytime.
                </p>
              )}
            </>
          )}
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
