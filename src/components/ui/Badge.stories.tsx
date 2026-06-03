import React from 'react';
import { Badge } from './badge';

export default { title: 'UI/Badge', component: Badge };

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => <Badge>Default</Badge>;

export const Secondary = () => <Badge variant="secondary">Secondary</Badge>;

export const Destructive = () => <Badge variant="destructive">Destructive</Badge>;

export const Outline = () => <Badge variant="outline">Outline</Badge>;

export const AllVariants = () => (
  <div className="flex items-center gap-3">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
);

export const AsStatus = () => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <Badge variant="secondary">Operational</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-500" />
      <Badge variant="secondary">Degraded</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <Badge variant="destructive">Outage</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-blue-500" />
      <Badge variant="outline">Maintenance</Badge>
    </div>
  </div>
);

export const Sizes = () => (
  <div className="flex items-center gap-2">
    <Badge className="text-[10px] px-1.5 py-0">xs</Badge>
    <Badge>sm (default)</Badge>
    <Badge className="text-sm px-3 py-1">md</Badge>
  </div>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg flex flex-col gap-3">
    <p className="text-xs text-muted-foreground mb-1">Status badges in dark mode</p>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <Badge variant="secondary">Operational</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-500" />
      <Badge variant="secondary">Degraded</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <Badge variant="destructive">Outage</Badge>
    </div>
  </div>
);

export const DarkModeAllVariants = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg flex flex-wrap gap-3">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const WithDot = () => (
  <Badge className="flex items-center gap-1.5 pl-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    Live
  </Badge>
);

export const RoundedPill = () => (
  <Badge className="rounded-full px-3">
    NEW
  </Badge>
);

export const CopperBadge = () => (
  <Badge className="bg-copper/10 text-copper border-copper/20 hover:bg-copper/20">
    Premium
  </Badge>
);

export const AmberBadge = () => (
  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
    Most Popular
  </Badge>
);

export const CountBadge = () => (
  <Badge className="min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full text-[10px] font-bold">
    42
  </Badge>
);
