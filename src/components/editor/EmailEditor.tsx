"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Sparkles, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link, Heading, Quote, History, Eye, EyeOff, Undo2, Redo2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VersionEntry } from "@/types/editor";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type { VersionEntry };

interface EmailEditorProps {
  content: string | null;
  versions?: VersionEntry[];
  onVersionSelect?: (version: VersionEntry) => void;
  onVersionRestore?: (version: VersionEntry) => void;
}

// ─── TOOLBAR BUTTON ─────────────────────────────────────────────────────────────

function ToolBtn({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
        isActive
          ? "bg-copper/15 text-copper"
          : "text-muted-foreground hover:text-foreground/80 hover:bg-muted"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon size={14} />
    </button>
  );
}

// ─── FORMATTING HELPERS ────────────────────────────────────────────────────────

function execFormat(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function isFormatActive(command: string): boolean {
  return document.queryCommandState(command);
}

function promptLink(editorRef: React.RefObject<HTMLDivElement | null>) {
  const url = window.prompt("Enter URL (https://...):");
  if (url) {
    // Restore selection if lost
    editorRef.current?.focus();
    execFormat("createLink", url);
  }
}

// ─── EMAIL EDITOR ──────────────────────────────────────────────────────────────

export function EmailEditor({ content, versions = [], onVersionSelect, onVersionRestore }: EmailEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorContent, setEditorContent] = useState(content || "");
  const [showToolbar, setShowToolbar] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<VersionEntry | null>(null);
  const [isHeading, setIsHeading] = useState(false);
  const [isBlockquote, setIsBlockquote] = useState(false);

  // Sync external content changes
  useEffect(() => {
    if (content !== undefined && content !== null && !editorRef.current?.textContent?.trim()) {
      setEditorContent(content);
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  const updateActiveFormats = useCallback(() => {
    const cmds = ["bold", "italic", "underline", "strikethrough", "insertUnorderedList", "insertOrderedList"];
    const active = new Set<string>();
    cmds.forEach((cmd) => {
      if (isFormatActive(cmd)) active.add(cmd);
    });
    setActiveFormats(active);
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  }, [updateActiveFormats]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab inserts 2 spaces instead of moving focus
    if (e.key === "Tab") {
      e.preventDefault();
      execFormat("insertHTML", "&emsp;");
    }
  }, []);

  const handleSelect = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  // Insert list helper
  const insertList = (type: "ul" | "ol") => {
    editorRef.current?.focus();
    execFormat(type === "ul" ? "insertUnorderedList" : "insertOrderedList");
    updateActiveFormats();
  };

  // Heading toggle
  const toggleHeading = () => {
    editorRef.current?.focus();
    const headingActive = !isHeading;
    execFormat("formatBlock", headingActive ? "<h3>" : "<p>");
    setIsHeading(headingActive);
    updateActiveFormats();
  };

  // Blockquote toggle
  const toggleBlockquote = () => {
    editorRef.current?.focus();
    const quoteActive = !isBlockquote;
    execFormat("formatBlock", quoteActive ? "<blockquote>" : "<p>");
    setIsBlockquote(quoteActive);
    updateActiveFormats();
  };

  const handleVersionClick = (version: VersionEntry) => {
    setSelectedVersion(version.id);
    setPreviewVersion(version);
    onVersionSelect?.(version);
  };

  const handleVersionRestore = (version: VersionEntry) => {
    setPreviewVersion(null);
    setSelectedVersion(null);
    onVersionRestore?.(version);
  };

  // ── Export helpers
  const getPlainText = () => editorRef.current?.innerText || "";

  return (
    <div className="mt-4 bg-white/90 backdrop-blur-md rounded-xl border border-border overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Email Draft (Rich Edit)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className={`p-1.5 rounded-lg transition-all ${
              showToolbar
                ? "bg-copper/10 text-copper"
                : "text-muted-foreground hover:text-foreground/80 hover:bg-muted"
            }`}
            aria-label="Toggle formatting toolbar"
          >
            <Sparkles size={14} />
          </button>
          <button
            onClick={() => setShowVersions(!showVersions)}
            className={`p-1.5 rounded-lg transition-all ${
              showVersions
                ? "bg-copper/10 text-copper"
                : "text-muted-foreground hover:text-foreground/80 hover:bg-muted"
            }`}
            aria-label="Toggle version history"
          >
            <History size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar (collapsible) */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-0.5 flex-wrap">
              {/* History actions */}
              <ToolBtn icon={Undo2} label="Undo" isActive={false} onClick={() => { editorRef.current?.focus(); execFormat("undo"); }} />
              <ToolBtn icon={Redo2} label="Redo" isActive={false} onClick={() => { editorRef.current?.focus(); execFormat("redo"); }} />
              <div className="w-px h-5 bg-border mx-1" />

              {/* Text formatting */}
              <ToolBtn icon={Bold} label="Bold" isActive={activeFormats.has("bold")} onClick={() => { editorRef.current?.focus(); execFormat("bold"); updateActiveFormats(); }} />
              <ToolBtn icon={Italic} label="Italic" isActive={activeFormats.has("italic")} onClick={() => { editorRef.current?.focus(); execFormat("italic"); updateActiveFormats(); }} />
              <ToolBtn icon={Underline} label="Underline" isActive={activeFormats.has("underline")} onClick={() => { editorRef.current?.focus(); execFormat("underline"); updateActiveFormats(); }} />
              <ToolBtn icon={Strikethrough} label="Strikethrough" isActive={activeFormats.has("strikethrough")} onClick={() => { editorRef.current?.focus(); execFormat("strikethrough"); updateActiveFormats(); }} />
              <div className="w-px h-5 bg-border mx-1" />

              {/* Structure */}
              <ToolBtn icon={Heading} label="Heading" isActive={isHeading} onClick={toggleHeading} />
              <ToolBtn icon={List} label="Bullet List" isActive={activeFormats.has("insertUnorderedList")} onClick={() => insertList("ul")} />
              <ToolBtn icon={ListOrdered} label="Numbered List" isActive={activeFormats.has("insertOrderedList")} onClick={() => insertList("ol")} />
              <ToolBtn icon={Quote} label="Quote" isActive={isBlockquote} onClick={toggleBlockquote} />
              <div className="w-px h-5 bg-border mx-1" />

              {/* Link */}
              <ToolBtn icon={Link} label="Insert Link" isActive={false} onClick={() => promptLink(editorRef)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version preview banner */}
      <AnimatePresence>
        {previewVersion && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Previewing: {previewVersion.shortHash} — {previewVersion.description}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVersionRestore(previewVersion)}
                  className="px-3 py-1 rounded-lg bg-copper text-white text-[9px] font-bold uppercase tracking-wider hover:bg-copper/80 transition-all"
                >
                  Restore This Version
                </button>
                <button
                  onClick={() => { setPreviewVersion(null); setSelectedVersion(null); }}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                >
                  <EyeOff size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area: Editor + Version sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onBlur={handleSelect}
            onFocus={handleSelect}
            dangerouslySetInnerHTML={{ __html: previewVersion ? previewVersion.content : editorContent }}
            className="flex-1 p-6 text-sm text-foreground min-h-[200px] outline-none resize-none custom-scrollbar leading-relaxed
              [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1
              [&_blockquote]:border-l-2 [&_blockquote]:border-copper/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
              [&_li]:mb-0.5
              [&_a]:text-copper [&_a]:underline [&_a]:decoration-copper/30
              [&_b]:font-bold [&_strong]:font-bold
              [&_i]:italic [&_em]:italic
              [&_u]:underline
              [&_s]:line-through
              empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50
            "
            data-placeholder="Waiting for Copywriter to generate draft..."
            role="textbox"
            aria-multiline="true"
            aria-label="Email draft editor"
          />
        </div>

        {/* Version sidebar */}
        <AnimatePresence>
          {showVersions && versions.length > 0 && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-muted/30 overflow-hidden shrink-0"
            >
              <div className="w-[220px] h-full flex flex-col">
                <div className="px-3 py-2 border-b border-border bg-muted/50">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Version History
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                  {/* AI branch label */}
                  <div className="px-3 mb-1">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-copper/60">AI Branch</span>
                  </div>
                  {versions
                    .filter((v) => v.branch === "ai")
                    .map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => handleVersionClick(v)}
                        className={`w-full text-left px-3 py-2 border-l-2 transition-all ${
                          selectedVersion === v.id
                            ? "border-copper bg-copper/5"
                            : "border-transparent hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-copper">{v.shortHash}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedVersion === v.id ? "bg-copper animate-pulse" : "bg-border"
                          }`} />
                        </div>
                        <p className="text-[10px] text-foreground/80 mt-0.5 leading-tight truncate">{v.description}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">
                          {v.author} · {new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </button>
                    ))}

                  {/* User branch label */}
                  {versions.some((v) => v.branch === "user") && (
                    <div className="px-3 mt-3 mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-blue-500/60">User Branch</span>
                    </div>
                  )}
                  {versions
                    .filter((v) => v.branch === "user")
                    .map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleVersionClick(v)}
                        className={`w-full text-left px-3 py-2 border-l-2 transition-all ${
                          selectedVersion === v.id
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-transparent hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-blue-500">{v.shortHash}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedVersion === v.id ? "bg-blue-500 animate-pulse" : "bg-border"
                          }`} />
                        </div>
                        <p className="text-[10px] text-foreground/80 mt-0.5 leading-tight truncate">{v.description}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">
                          {v.author} · {new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="p-3 bg-muted border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          {editorContent && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {getPlainText().length} chars · {getPlainText().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>
        <button
          disabled={!getPlainText().trim()}
          className="flex items-center gap-2 px-5 py-2 bg-copper text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-copper/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-md"
        >
          <span>Send Email</span>
          <Send size={13} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
