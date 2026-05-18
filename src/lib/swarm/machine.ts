import { createMachine, assign } from "xstate";
import { AgentName } from "@/types/swarm";

export const swarmMachine = createMachine({
  id: "swarm",
  initial: "idle",
  context: {
    activeAgent: null as AgentName | null,
    confidence: 0,
    error: null as string | null,
  },
  states: {
    idle: {
      on: {
        START: "researching",
      },
    },
    researching: {
      entry: assign({ activeAgent: "researcher" }),
      on: {
        SUCCESS: "profiling",
        ERROR: "failed",
      },
    },
    profiling: {
      entry: assign({ activeAgent: "psychologist" }),
      on: {
        SUCCESS: "strategizing",
        ERROR: "failed",
      },
    },
    strategizing: {
      entry: assign({ activeAgent: "strategist" }),
      on: {
        SUCCESS: "drafting",
        ERROR: "failed",
      },
    },
    drafting: {
      entry: assign({ activeAgent: "copywriter" }),
      on: {
        SUCCESS: "reviewing",
        ERROR: "failed",
      },
    },
    reviewing: {
      entry: assign({ activeAgent: "consensus" }),
      on: {
        SUCCESS: "completed",
        ERROR: "failed",
      },
    },
    completed: {
      type: "final",
    },
    failed: {
      on: {
        RETRY: "researching",
      },
    },
  },
});
