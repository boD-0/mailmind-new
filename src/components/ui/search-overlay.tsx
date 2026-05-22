"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  FolderKanban,
  FileText,
  Lightbulb,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchAll, type SearchResult } from "@/app/actions/search";
import { cn } from "@/lib/utils";

const SEARCH_TAGS = [
  { label: "Projects", value: "project" },
  { label: "Documents", value: "document" },
  { label: "Ideas", value: "idea" },
];

function TypeIcon({ type }: { type: SearchResult["type"] }) {
  switch (type) {
    case "project":
      return <FolderKanban size={14} className="text-[#ff5f5f]" />;
    case "document":
      return <FileText size={14} className="text-blue-500" />;
    case "idea":
      return <Lightbulb size={14} className="text-amber-500" />;
  }
}

export function SearchOverlay({
  open,
  onOpenChange,
  initialQuery,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState<string | null>(null);

  // Debounced search
  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAll(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset on open — pre-fill with initialQuery if provided
  React.useEffect(() => {
    if (open) {
      setQuery(initialQuery ?? "");
      setResults([]);
      setFilter(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialQuery]);

  // Keyboard shortcut: ⌘K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    router.push(result.href);
  };

  const filteredResults = filter
    ? results.filter((r) => r.type === filter)
    : results;

  const projectCount = results.filter((r) => r.type === "project").length;
  const docCount = results.filter((r) => r.type === "document").length;
  const ideaCount = results.filter((r) => r.type === "idea").length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-black/10 overflow-hidden">
              <Command
                shouldFilter={false}
                className="bg-transparent"
                label="Search commands"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <Search size={18} className="text-gray-400 shrink-0 group-focus-within:text-[#ff5f5f] transition-colors" />
                  <Command.Input
                    ref={inputRef}
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search projects, documents, ideas..."
                    className="flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  {loading && (
                    <Loader2 size={16} className="text-gray-400 animate-spin" />
                  )}
                  <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
                    ESC
                  </kbd>
                </div>

                {/* Filter tags */}
                {query.trim().length >= 2 && results.length > 0 && (
                  <div className="flex items-center gap-2 px-5 pt-3 pb-1">
                    <button
                      onClick={() => setFilter(null)}
                      className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                        !filter
                          ? "border-[#ff5f5f] text-[#ff5f5f] bg-[#ff5f5f]/10"
                          : "border-gray-200 text-gray-500 hover:text-gray-700",
                      )}
                    >
                      All ({results.length})
                    </button>
                    {SEARCH_TAGS.map((tag) => {
                      const count =
                        tag.value === "project"
                          ? projectCount
                          : tag.value === "document"
                            ? docCount
                            : ideaCount;
                      if (count === 0) return null;
                      return (
                        <button
                          key={tag.value}
                          onClick={() =>
                            setFilter(filter === tag.value ? null : tag.value)
                          }
                          className={cn(
                            "text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                            filter === tag.value
                              ? "border-[#ff5f5f] text-[#ff5f5f] bg-[#ff5f5f]/10"
                              : "border-gray-200 text-gray-500 hover:text-gray-700",
                          )}
                        >
                          {tag.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Results */}
                <Command.List className="max-h-[360px] overflow-y-auto py-2 px-2">
                  {/* Empty state */}
                  {query.trim().length >= 2 && !loading && results.length === 0 && (
                    <Command.Empty>
                      <div className="flex flex-col items-center py-8 text-center">
                        <Search size={24} className="text-gray-300 mb-3" />
                        <p className="text-[13px] text-gray-500">
                          Nimic pentru &quot;{query}&quot;
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Încearcă alt termen
                        </p>
                      </div>
                    </Command.Empty>
                  )}

                  {/* Projects group */}
                  {filteredResults.filter((r) => r.type === "project").length >
                    0 && (
                    <Command.Group
                      heading={
                        <span className="flex items-center gap-2">
                          <FolderKanban size={12} className="text-[#ff5f5f]" />
                          Projects
                        </span>
                      }
                    >
                      {filteredResults
                        .filter((r) => r.type === "project")
                        .map((result) => (
                          <Command.Item
                            key={result.id}
                            value={`project-${result.title}`}
                            onSelect={() => handleSelect(result)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-[#ff5f5f]/10 aria-selected:text-gray-900 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#ff5f5f]/10 grid place-items-center shrink-0">
                              <FolderKanban size={14} className="text-[#ff5f5f]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            {result.tag && (
                              <span className="text-[9px] tracking-widest uppercase text-gray-400 shrink-0">
                                {result.tag}
                              </span>
                            )}
                            <ArrowRight
                              size={13}
                              className="text-gray-300 opacity-0 group-aria-selected:opacity-100 transition-opacity shrink-0"
                            />
                          </Command.Item>
                        ))}
                    </Command.Group>
                  )}

                  {/* Documents group */}
                  {filteredResults.filter((r) => r.type === "document").length >
                    0 && (
                    <Command.Group
                      heading={
                        <span className="flex items-center gap-2">
                          <FileText size={12} className="text-blue-500" />
                          Documents
                        </span>
                      }
                    >
                      {filteredResults
                        .filter((r) => r.type === "document")
                        .map((result) => (
                          <Command.Item
                            key={result.id}
                            value={`doc-${result.title}`}
                            onSelect={() => handleSelect(result)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-blue-50 aria-selected:text-gray-900 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 grid place-items-center shrink-0">
                              <FileText size={14} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            {result.tag && (
                              <span className="text-[9px] tracking-widest uppercase text-gray-400 shrink-0">
                                {result.tag}
                              </span>
                            )}
                            <ArrowRight
                              size={13}
                              className="text-gray-300 opacity-0 group-aria-selected:opacity-100 transition-opacity shrink-0"
                            />
                          </Command.Item>
                        ))}
                    </Command.Group>
                  )}

                  {/* Prompt to start searching */}
                  {query.trim().length < 2 && (
                    <div className="flex flex-col items-center py-10 text-center">
                      <Search size={32} className="text-gray-200 mb-4" />
                      <p className="text-[13px] text-gray-500">
                        Scrie cel puțin 2 caractere
                      </p>
                      <div className="flex items-center gap-3 mt-4 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-mono">
                            ↑↓
                          </kbd>{" "}
                          Navighează
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-mono">
                            ↵
                          </kbd>{" "}
                          Deschide
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-mono">
                            ⌘K
                          </kbd>{" "}
                          Comută
                        </span>
                      </div>
                    </div>
                  )}
                </Command.List>

                {/* Footer */}
                <div className="border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {results.length > 0
                      ? `${results.length} rezultat${results.length !== 1 ? "e" : ""}`
                      : "Caută în toate datele"}
                  </span>
                  <span className="text-[9px] text-gray-400">
                    Apasă{" "}
                    <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[9px] font-mono">
                      ESC
                    </kbd>{" "}
                    pentru a închide
                  </span>
                </div>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
