"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Settings, Users, Database, Zap } from "lucide-react";
import { useFounderStore } from "@/stores/founderStore";

export default function AdminPage() {
  const { systemStats, maintenanceMode, setMaintenanceMode, swarmParams, updateSwarmParams } = useFounderStore();

  return (
    <div className="p-10 space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <Shield size={20} />
          </div>
          <h2 className="text-4xl font-black tracking-tight">Founder Mode</h2>
        </div>
        <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Advanced Swarm Orchestration Panel</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Swarms', value: systemStats.totalSwarms.toLocaleString(), icon: Zap, color: 'text-copper' },
          { label: 'Active Users', value: systemStats.activeUsers.toLocaleString(), icon: Users, color: 'text-blue-500' },
          { label: 'Data Ingested', value: systemStats.dataIngested, icon: Database, color: 'text-emerald-500' },
          { label: 'System Health', value: systemStats.systemHealth, icon: Settings, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl border border-white/5"
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-1">{stat.label}</p>
            <p className="text-2xl font-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <section className="glass-card p-10 rounded-3xl border border-white/5">
        <h3 className="text-lg font-bold mb-6">System Override</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-bold">Maintenance Mode</p>
              <p className="text-xs text-white/20">Restrict access to the platform</p>
            </div>
            <button 
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
            >
              <motion.div 
                animate={{ x: maintenanceMode ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-bold text-white/40">Global Tone Aggressiveness</label>
              <input 
                type="range" min="1" max="10" 
                value={swarmParams.tone_aggressiveness}
                onChange={(e) => updateSwarmParams({ tone_aggressiveness: parseInt(e.target.value) })}
                className="w-full accent-copper"
              />
              <div className="flex justify-between text-[10px] text-white/20">
                <span>CONSERVATIVE</span>
                <span>AGGRESSIVE ({swarmParams.tone_aggressiveness}/10)</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-bold text-white/40">Persona Strictness</label>
              <input 
                type="range" min="1" max="10" 
                value={swarmParams.persona_strictness}
                onChange={(e) => updateSwarmParams({ persona_strictness: parseInt(e.target.value) })}
                className="w-full accent-copper"
              />
              <div className="flex justify-between text-[10px] text-white/20">
                <span>CREATIVE</span>
                <span>STRICT ({swarmParams.persona_strictness}/10)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
