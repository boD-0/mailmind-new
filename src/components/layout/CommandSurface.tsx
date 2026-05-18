"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";
import { AureliusHelper } from "@/components/aurelius/AureliusHelper";

export function CommandSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-obsidian">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          {children}
        </motion.main>
        <AureliusHelper />
      </div>
    </div>
  );
}
