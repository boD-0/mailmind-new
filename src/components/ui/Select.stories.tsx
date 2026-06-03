import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from './select';

export default { title: 'UI/Select', component: Select };

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => (
  <Select>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="orange">Orange</SelectItem>
      <SelectItem value="grape">Grape</SelectItem>
      <SelectItem value="kiwi">Kiwi</SelectItem>
    </SelectContent>
  </Select>
);

export const WithPreselectedValue = () => (
  <Select defaultValue="banana">
    <SelectTrigger className="w-[200px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="orange">Orange</SelectItem>
      <SelectItem value="grape">Grape</SelectItem>
    </SelectContent>
  </Select>
);

export const WithGroups = () => (
  <Select>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Select a contact" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Favorites</SelectLabel>
        <SelectItem value="alice">Alice Johnson</SelectItem>
        <SelectItem value="bob">Bob Smith</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Team</SelectLabel>
        <SelectItem value="carol">Carol Williams</SelectItem>
        <SelectItem value="dave">Dave Brown</SelectItem>
        <SelectItem value="eve">Eve Davis</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>External</SelectLabel>
        <SelectItem value="frank">Frank Miller</SelectItem>
        <SelectItem value="grace">Grace Wilson</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

export const Disabled = () => (
  <Select disabled>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Feature coming soon" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
);

export const DisabledItem = () => (
  <Select>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Pick a plan" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="free">Free</SelectItem>
      <SelectItem value="starter">Starter</SelectItem>
      <SelectItem value="pro">Professional</SelectItem>
      <SelectItem value="enterprise" disabled>Enterprise (coming soon)</SelectItem>
    </SelectContent>
  </Select>
);

export const ManyOptions = () => (
  <Select>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Select a country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="uk">United Kingdom</SelectItem>
      <SelectItem value="ca">Canada</SelectItem>
      <SelectItem value="de">Germany</SelectItem>
      <SelectItem value="fr">France</SelectItem>
      <SelectItem value="es">Spain</SelectItem>
      <SelectItem value="it">Italy</SelectItem>
      <SelectItem value="nl">Netherlands</SelectItem>
      <SelectItem value="jp">Japan</SelectItem>
      <SelectItem value="au">Australia</SelectItem>
      <SelectItem value="br">Brazil</SelectItem>
      <SelectItem value="in">India</SelectItem>
    </SelectContent>
  </Select>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[200px]">
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Choose option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const DarkModeWithGroups = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[200px]">
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Admin</SelectLabel>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Members</SelectLabel>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="commenter">Commenter</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const FullWidth = () => (
  <Select>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select a category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="design">Design</SelectItem>
      <SelectItem value="development">Development</SelectItem>
      <SelectItem value="marketing">Marketing</SelectItem>
      <SelectItem value="sales">Sales</SelectItem>
    </SelectContent>
  </Select>
);

export const FormRow = () => (
  <div className="w-full max-w-sm flex flex-col gap-2">
    <label className="text-sm font-medium text-foreground">Email frequency</label>
    <Select defaultValue="weekly">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily digest</SelectItem>
        <SelectItem value="weekly">Weekly summary</SelectItem>
        <SelectItem value="monthly">Monthly recap</SelectItem>
        <SelectItem value="never">Never</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const WithLabelAndHint = () => (
  <div className="w-full max-w-sm flex flex-col gap-1.5">
    <label className="text-sm font-medium text-foreground">Industry</label>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select your industry" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="tech">Technology</SelectItem>
        <SelectItem value="finance">Finance</SelectItem>
        <SelectItem value="healthcare">Healthcare</SelectItem>
        <SelectItem value="education">Education</SelectItem>
        <SelectItem value="realestate">Real Estate</SelectItem>
      </SelectContent>
    </Select>
    <p className="text-xs text-muted-foreground">Used to personalize your email campaigns.</p>
  </div>
);

export const CustomStyledTrigger = () => (
  <Select defaultValue="active">
    <SelectTrigger className="w-[160px] border-emerald-500/30 bg-emerald-500/5 data-[state=open]:ring-emerald-500/30">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="active">🟢 Active</SelectItem>
      <SelectItem value="inactive">⚪ Inactive</SelectItem>
      <SelectItem value="draft">🟡 Draft</SelectItem>
      <SelectItem value="archived">🔴 Archived</SelectItem>
    </SelectContent>
  </Select>
);
