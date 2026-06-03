import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
import { Button } from './button';

export default {}
const meta = { title: 'UI/Tooltip', component: Tooltip };

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>This is a tooltip</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const WithIcon = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
          <span className="text-sm">ℹ️</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>More information</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const SideTop = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Top</Button>
      </TooltipTrigger>
      <TooltipContent side="top">Tooltip on top</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const SideRight = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Right</Button>
      </TooltipTrigger>
      <TooltipContent side="right">Tooltip on the right</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const SideBottom = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Bottom</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Tooltip on the bottom</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const SideLeft = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Left</Button>
      </TooltipTrigger>
      <TooltipContent side="left">Tooltip on the left</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const AllSides = () => (
  <TooltipProvider>
    <div className="flex items-center gap-6 p-12">
      <Tooltip>
        <TooltipTrigger asChild><Button variant="secondary">Top</Button></TooltipTrigger>
        <TooltipContent side="top">Top tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="secondary">Right</Button></TooltipTrigger>
        <TooltipContent side="right">Right tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="secondary">Bottom</Button></TooltipTrigger>
        <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="secondary">Left</Button></TooltipTrigger>
        <TooltipContent side="left">Left tooltip</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);

export const LongContent = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover for details</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px]">
        This is a longer tooltip with more detailed information about the feature or action.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[100px] flex items-center justify-center">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Dark mode tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const CustomStyled = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Styled tooltip</Button>
      </TooltipTrigger>
      <TooltipContent className="bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20">
        ✨ Custom styled tooltip
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
