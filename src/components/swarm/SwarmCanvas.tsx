"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode } from "./AgentNode";
import { AgentName } from "@/types/swarm";

type SwarmNodeId = AgentName | "end";
import { useSwarmStore } from "@/stores/swarmStore";
import { motion } from "framer-motion";

const nodeTypes = {
  agent: AgentNode,
};

// ─── Layout constants ──────────────────────────────────────────────────────────

const NODE_W = 220;
const NODE_H = 110;
const COL_GAP = 300;
const ROW_GAP = 160;

/**
 * Calculate node positions for a vertical pipeline:
 *
 *   [Researcher] ──┐
 *   [Psychologist] ┤  (parallel, left column)
 *   [Strategist]  ─┘
 *                  │
 *   [Consensus]  ←─┘
 *       │
 *   [Approval Gate]
 *       │
 *   [Copywriter]
 *       │
 *   [Sandbox]
 *       │
 *   [End]
 */
function buildLayout(): { nodes: Node[]; edges: Edge[] } {
  const centerX = 400;
  const parallelX = centerX - COL_GAP / 2;

  const nodes: Node[] = [
    // Left column — 3 parallel agents
    {
      id: "researcher",
      type: "agent",
      position: { x: parallelX - NODE_W / 2, y: 20 },
      data: { agent: "researcher" as AgentName, status: "idle" },
    },
    {
      id: "psychologist",
      type: "agent",
      position: { x: parallelX - NODE_W / 2, y: 20 + ROW_GAP },
      data: { agent: "psychologist" as AgentName, status: "idle" },
    },
    {
      id: "strategist",
      type: "agent",
      position: { x: parallelX - NODE_W / 2, y: 20 + ROW_GAP * 2 },
      data: { agent: "strategist" as AgentName, status: "idle" },
    },
    // Consensus — center column
    {
      id: "consensus",
      type: "agent",
      position: { x: centerX - NODE_W / 2, y: 20 + ROW_GAP * 3.5 },
      data: { agent: "consensus" as AgentName, status: "idle" },
    },
    // Approval Gate
    {
      id: "approval_gate",
      type: "agent",
      position: { x: centerX - NODE_W / 2, y: 20 + ROW_GAP * 4.5 },
      data: { agent: "approval_gate" as AgentName, status: "idle" },
    },
    // Copywriter
    {
      id: "copywriter",
      type: "agent",
      position: { x: centerX - NODE_W / 2, y: 20 + ROW_GAP * 5.5 },
      data: { agent: "copywriter" as AgentName, status: "idle" },
    },
    // Sandbox
    {
      id: "sandbox",
      type: "agent",
      position: { x: centerX - NODE_W / 2, y: 20 + ROW_GAP * 6.5 },
      data: { agent: "sandbox" as AgentName, status: "idle" },
    },
    // End marker (styled differently)
    {
      id: "end",
      type: "agent",
      position: { x: centerX - NODE_W / 2, y: 20 + ROW_GAP * 7.5 },
      data: { agent: "copywriter" as AgentName, status: "done" },
    },
  ];

  const copperEdge = {
    stroke: "var(--copper)",
    strokeWidth: 1.5,
    strokeOpacity: 0.5,
  };

  const edges: Edge[] = [
    // Parallel agents → Consensus
    {
      id: "researcher-consensus",
      source: "researcher",
      target: "consensus",
      animated: true,
      style: copperEdge,
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--copper)", width: 12, height: 12 },
    },
    {
      id: "psychologist-consensus",
      source: "psychologist",
      target: "consensus",
      animated: true,
      style: copperEdge,
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--copper)", width: 12, height: 12 },
    },
    {
      id: "strategist-consensus",
      source: "strategist",
      target: "consensus",
      animated: true,
      style: copperEdge,
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--copper)", width: 12, height: 12 },
    },
    // Consensus → Approval Gate
    {
      id: "consensus-approval_gate",
      source: "consensus",
      target: "approval_gate",
      animated: true,
      style: { ...copperEdge, strokeOpacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--copper)", width: 12, height: 12 },
    },
    // Approval Gate → Copywriter
    {
      id: "approval_gate-copywriter",
      source: "approval_gate",
      target: "copywriter",
      animated: true,
      style: { ...copperEdge, strokeOpacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--copper)", width: 12, height: 12 },
    },
    // Copywriter → Sandbox
    {
      id: "copywriter-sandbox",
      source: "copywriter",
      target: "sandbox",
      animated: true,
      style: { ...copperEdge, strokeOpacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--copper)", width: 12, height: 12 },
    },
    // Sandbox → End
    {
      id: "sandbox-end",
      source: "sandbox",
      target: "end",
      animated: true,
      style: { stroke: "#10b981", strokeWidth: 1.5, strokeOpacity: 0.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981", width: 12, height: 12 },
    },
  ];

  return { nodes, edges };
}

const { nodes: initialNodes, edges: initialEdges } = buildLayout();

// ─── Component ────────────────────────────────────────────────────────────────

export function SwarmCanvas() {
  const { activeAgent, status, traceLogs } = useSwarmStore();

  const agentStates = useMemo(() => {
    const states: Record<string, "idle" | "working" | "done" | "conflict"> = {};
    for (const node of initialNodes) {
      states[node.id] = "idle";
    }
    // Mark based on trace logs
    for (const log of traceLogs) {
      if (log.status === "done") states[log.agent] = "done";
      if (log.status === "conflict") states[log.agent] = "conflict";
    }
    // Mark active agent as working
    if (activeAgent) {
      states[activeAgent] = "working";
    }
    return states;
  }, [activeAgent, traceLogs]);    // Mark consensus/approval_gate/sandbox/end based on swarm status
  if (status === "consensus_reached") {
    agentStates["consensus"] = "done";
    agentStates["approval_gate"] = "done";
    agentStates["sandbox"] = "done";
    agentStates["end"] = "done";
  } else if (status === "awaiting_approval") {
    agentStates["consensus"] = "done";
    agentStates["approval_gate"] = "working";
  }

  const nodes: Node[] = useMemo(
    () =>
      initialNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          agent: (node.id === "end" ? "copywriter" : node.id) as AgentName,
          status: agentStates[node.id] || "idle",
          terminalLines:
            traceLogs
              .filter((l) => l.agent === node.id)
              .slice(-5)
              .map((l) => l.message) || [],
          confidenceDelta: traceLogs
            .filter((l) => l.agent === node.id && l.confidence_delta)
            .reduce((sum, l) => sum + (l.confidence_delta || 0), 0),
        },
      })),
    [agentStates, traceLogs]
  );

  const onNodesChange: OnNodesChange<Node> = useCallback(() => {}, []);
  const onEdgesChange: OnEdgesChange<Edge> = useCallback(() => {}, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-card rounded-xl border border-border overflow-hidden relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        className="bg-muted/30"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--muted-foreground)"
          gap={24}
          size={0.5}
          style={{ opacity: 0.15 }}
        />
        <Controls
          className="!rounded-xl !border !border-border !bg-card !shadow-sm"
          style={{ borderRadius: "12px" }}
        />
      </ReactFlow>
    </motion.div>
  );
}
