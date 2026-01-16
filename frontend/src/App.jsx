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
    rankdir: "TB", // Top → Bottom
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

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/roadmap/1")
      .then((res) => res.json())
      .then((data) => {
        const rawNodes = data.map((skill) => ({
          id: String(skill.skill_id),
          data: { label: skill.name },
          style: {
            background:
              skill.skill_state === "COMPLETED"
                ? "#2e7d32"
                : skill.skill_state === "AVAILABLE"
                ? "#f9a825"
                : "#c62828",
            color: "#fff",
            borderRadius: 8,
            fontWeight: "bold",
            padding: 10,
          },
        }));

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
