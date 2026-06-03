import React from 'react';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverFooter, PopoverBody } from './popover';
import { Button } from './button';

export default { title: 'UI/Popover', component: Popover };

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="secondary">Open popover</Button>
    </PopoverTrigger>
    <PopoverContent className="w-64">
      <PopoverHeader>
        <PopoverTitle>Notifications</PopoverTitle>
        <PopoverDescription>You have 3 unread messages.</PopoverDescription>
      </PopoverHeader>
      <PopoverBody>
        <div className="space-y-2">
          {['Campaign Q1 is ready for review', 'New prospect matched', 'API usage at 78%'].map((msg) => (
            <div key={msg} className="text-sm text-muted-foreground py-1 px-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
              {msg}
            </div>
          ))}
        </div>
      </PopoverBody>
      <PopoverFooter>
        <Button className="w-full" size="sm">View all</Button>
      </PopoverFooter>
    </PopoverContent>
  </Popover>
);

export const Simple = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost">ℹ️</Button>
    </PopoverTrigger>
    <PopoverContent className="w-56">
      <PopoverBody>
        <p className="text-sm text-muted-foreground">
          This feature uses AI to analyze prospect behavior and suggest optimal send times.
        </p>
      </PopoverBody>
    </PopoverContent>
  </Popover>
);

export const WithForm = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="secondary">Edit details</Button>
    </PopoverTrigger>
    <PopoverContent className="w-72" align="start">
      <PopoverHeader>
        <PopoverTitle>Edit campaign</PopoverTitle>
        <PopoverDescription>Update campaign name and status.</PopoverDescription>
      </PopoverHeader>
      <PopoverBody className="space-y-3">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-foreground">Name</label>
          <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue="Q1 Outreach" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-foreground">Status</label>
          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue="active">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </PopoverBody>
      <PopoverFooter>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="flex-1">Cancel</Button>
          <Button size="sm" className="flex-1">Save</Button>
        </div>
      </PopoverFooter>
    </PopoverContent>
  </Popover>
);

export const AlignEnd = () => (
  <div className="flex justify-end">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Aligned end</Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <PopoverBody>
          <p className="text-sm text-muted-foreground">This popover aligns to the end (right) of the trigger.</p>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </div>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[200px] flex items-center justify-center">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <PopoverHeader>
          <PopoverTitle>Notifications</PopoverTitle>
          <PopoverDescription>3 unread messages.</PopoverDescription>
        </PopoverHeader>
        <PopoverBody>
          <div className="space-y-2">
            {['Campaign ready', 'New prospect', 'Usage alert'].map((msg) => (
              <div key={msg} className="text-sm text-muted-foreground py-1 px-2 rounded-md hover:bg-muted cursor-pointer">
                {msg}
              </div>
            ))}
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const LargePopover = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="secondary">View details</Button>
    </PopoverTrigger>
    <PopoverContent className="w-96">
      <PopoverHeader>
        <PopoverTitle>Campaign Performance</PopoverTitle>
      </PopoverHeader>
      <PopoverBody>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sent', value: '12,847' },
            { label: 'Opened', value: '3,124', color: 'text-emerald-600' },
            { label: 'Replied', value: '1,089', color: 'text-blue-600' },
            { label: 'Bounced', value: '398', color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className={`text-lg font-bold mt-1 ${stat.color || 'text-foreground'}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </PopoverBody>
    </PopoverContent>
  </Popover>
);

export const RichContent = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="secondary">Prospect info</Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <PopoverBody className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">SC</div>
          <div>
            <p className="text-sm font-medium text-foreground">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">CTO · Arcadia Finance</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Openness: 82</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Extraversion: 74</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Best reached with data-driven, direct messaging. Prefers concise emails with clear CTAs.
        </p>
      </PopoverBody>
      <PopoverFooter>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="flex-1">View profile</Button>
          <Button size="sm" className="flex-1">Send email</Button>
        </div>
      </PopoverFooter>
    </PopoverContent>
  </Popover>
);
