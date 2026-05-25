"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchComponentProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  placeholder?: string;
}

const SearchComponent = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onClick,
  placeholder = "Search...",
}: SearchComponentProps) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full group"
    >
      {/* Glow effect on focus */}
      <div
        className="absolute -inset-0.5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(193,123,63,0.13), rgba(251,191,36,0.13), rgba(193,123,63,0.13))",
          filter: "blur(8px)",
        }}
      />

      <div className="relative flex items-center bg-white/60 backdrop-blur-sm border border-border rounded-xl shadow-sm group-focus-within:border-copper/30 group-focus-within:shadow-md group-focus-within:shadow-copper/10 transition-all duration-300">
        {/* Search icon */}
        <div className="pl-3.5 text-muted-foreground group-focus-within:text-copper transition-colors duration-300">
          <Search size={17} />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none h-[42px] px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onChange) {
                const event = {
                  target: { value: "" },
                  currentTarget: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }
            }}
            className="mr-2 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200/80 hover:bg-gray-300 transition-colors text-muted-foreground hover:text-muted-foreground"
            aria-label="Clear search"
          >
            <X size={11} />
          </button>
        )}

        {/* ⌘K shortcut */}
        <div className="pr-3 flex items-center">
          <kbd className="hidden sm:flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
