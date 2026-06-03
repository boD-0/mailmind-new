import React from 'react';
import { Progress } from './progress';

export default { title: 'UI/Progress', component: Progress };

/* ── Basic Variants ───────────────────────────────────── */

export const Empty = () => <Progress value={0} className="w-full max-w-sm" />;

export const Quarter = () => <Progress value={25} className="w-full max-w-sm" />;

export const Half = () => <Progress value={50} className="w-full max-w-sm" />;

export const ThreeQuarters = () => <Progress value={75} className="w-full max-w-sm" />;

export const Complete = () => <Progress value={100} className="w-full max-w-sm" />;

export const AllStages = () => (
  <div className="flex flex-col gap-4 w-full max-w-sm">
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16">Queued</span>
      <Progress value={0} className="flex-1" />
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16">Processing</span>
      <Progress value={45} className="flex-1" />
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16">Almost done</span>
      <Progress value={82} className="flex-1" />
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16">Complete</span>
      <Progress value={100} className="flex-1" />
    </div>
  </div>
);

export const WithPercentage = () => (
  <div className="flex flex-col gap-2 w-full max-w-sm">
    <div className="flex items-center justify-between text-sm">
      <span className="text-foreground font-medium">Campaign progress</span>
      <span className="text-muted-foreground font-mono text-xs">64%</span>
    </div>
    <Progress value={64} />
  </div>
);

export const Indeterminate = () => (
  <div className="flex flex-col gap-2 w-full max-w-sm">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      <span className="text-xs text-muted-foreground">Processing swarm...</span>
    </div>
    <Progress value={50} className="animate-pulse" />
  </div>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark">
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const CustomColors = () => (
  <div className="flex flex-col gap-3 w-full max-w-sm">
    <Progress value={70} className="h-2 bg-emerald-100 [&>div]:bg-emerald-500" />
    <Progress value={45} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
    <Progress value={90} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
    <Progress value={30} className="h-2 bg-red-100 [&>div]:bg-red-500" />
  </div>
);

export const Thick = () => (
  <Progress value={66} className="h-3 w-full max-w-sm rounded-full" />
);

export const Thin = () => (
  <Progress value={66} className="h-1 w-full max-w-sm" />
);

export const WithLabels = () => (
  <div className="flex flex-col gap-3 w-full max-w-sm">
    {[
      { label: 'Open rate', pct: 24 },
      { label: 'Click rate', pct: 12 },
      { label: 'Reply rate', pct: 8 },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-20">{item.label}</span>
        <Progress value={item.pct} className="flex-1 h-1.5" />
        <span className="text-xs font-mono text-muted-foreground w-8 text-right">{item.pct}%</span>
      </div>
    ))}
  </div>
);
