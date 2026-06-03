import React from 'react';
import { Switch } from './switch';

export default {}
const meta = { title: 'UI/Switch', component: Switch };

/* ── Basic Variants ───────────────────────────────────── */

export const Unchecked = () => <Switch />;

export const Checked = () => <Switch defaultChecked />;

export const Disabled = () => <Switch disabled />;

export const DisabledChecked = () => <Switch disabled defaultChecked />;

export const WithLabel = () => (
  <label className="flex items-center gap-3 cursor-pointer">
    <Switch />
    <span className="text-sm font-medium text-foreground">Enable notifications</span>
  </label>
);

export const CheckedWithLabel = () => (
  <label className="flex items-center gap-3 cursor-pointer">
    <Switch defaultChecked />
    <span className="text-sm font-medium text-foreground">Dark mode</span>
  </label>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkModeUnchecked = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg flex items-center gap-3">
    <Switch />
    <span className="text-sm font-medium text-foreground">Airplane mode</span>
  </div>
);

export const DarkModeChecked = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg flex items-center gap-3">
    <Switch defaultChecked />
    <span className="text-sm font-medium text-foreground">Wi-Fi</span>
  </div>
);

export const DarkModeDisabled = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg flex items-center gap-3">
    <Switch disabled />
    <span className="text-sm font-medium text-foreground/50">Bluetooth (unavailable)</span>
  </div>
);

export const DarkModeAll = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg flex flex-col gap-4">
    <label className="flex items-center gap-3 cursor-pointer">
      <Switch defaultChecked />
      <span className="text-sm font-medium text-foreground">Notifications</span>
    </label>
    <label className="flex items-center gap-3 cursor-pointer">
      <Switch />
      <span className="text-sm font-medium text-foreground">Sounds</span>
    </label>
    <label className="flex items-center gap-3 cursor-pointer">
      <Switch disabled />
      <span className="text-sm font-medium text-foreground/50">Vibration (unavailable)</span>
    </label>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const WithShadow = () => (
  <Switch className="shadow-lg shadow-primary/25" defaultChecked />
);

export const ColoredChecked = () => (
  <Switch
    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-200"
    defaultChecked
  />
);

export const LargerHitArea = () => (
  <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
    <Switch defaultChecked />
    <div className="flex flex-col">
      <span className="text-sm font-medium text-foreground">Email digests</span>
      <span className="text-xs text-muted-foreground">Receive weekly summary</span>
    </div>
  </label>
);

export const SettingsRow = () => (
  <div className="w-full max-w-sm flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-foreground">Marketing emails</span>
      <Switch defaultChecked />
    </label>
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-foreground">Product updates</span>
      <Switch defaultChecked />
    </label>
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-foreground">Security alerts</span>
      <Switch />
    </label>
  </div>
);
