'use client'
import React, { useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode } from "./AgentNode";
import { AgentName } from "@/types/swarm";
import { useSwarmStore } from "@/stores/swarmStore";

const nodeTypes = {
  agent: AgentNode,
};

const initialNodes: Node[] = [
  { id: 'researcher', type: 'agent', position: { x: 250, y: 0 }, data: { agent: 'researcher', status: 'idle' } },
  { id: 'psychologist', type: 'agent', position: { x: 250, y: 100 }, data: { agent: 'psychologist', status: 'idle' } },
  { id: 'strategist', type: 'agent', position: { x: 250, y: 200 }, data: { agent: 'strategist', status: 'idle' } },
  { id: 'copywriter', type: 'agent', position: { x: 250, y: 300 }, data: { agent: 'copywriter', status: 'idle' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'researcher', target: 'psychologist', animated: true, style: { stroke: '#ff5f5f', opacity: 0.4 } },
  { id: 'e2-3', source: 'psychologist', target: 'strategist', animated: true, style: { stroke: '#ff5f5f', opacity: 0.4 } },
  { id: 'e3-4', source: 'strategist', target: 'copywriter', animated: true, style: { stroke: '#ff5f5f', opacity: 0.4 } },
];

export function SwarmCanvas() {
  const { activeAgent, status } = useSwarmStore();
  const [edges] = React.useState(initialEdges);

  // Derive nodes from store state
  const nodes: Node[] = React.useMemo(() => 
    initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        status: activeAgent === node.id ? 'working' : (status === 'consensus_reached' ? 'done' : 'idle'),
        agent: node.id as AgentName
      },
    })),
    [activeAgent, status]
  );

  const onNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => {
      // In a more complex app, we'd update state here. 
      // For this Command Surface, we can keep them fixed or use a local state for dragging if needed.
},
    []
  );
  const onEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => {
      // Edges are currently static in this view
},
    []
  );

  return (
    <div className="w-full h-[400px] bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background color="#d4d4d4" gap={20} size={1} style={{ opacity: 0.3 }} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
