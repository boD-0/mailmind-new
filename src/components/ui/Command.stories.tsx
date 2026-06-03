import React from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from './command';

export default { title: 'UI/Command', component: Command };

/* ── Basic Variants ───────────────────────────────────── */

const commonItems = (
  <>
    <CommandInput placeholder="Search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem>
          <span>📅</span>
          <span>Calendar</span>
        </CommandItem>
        <CommandItem>
          <span>🔍</span>
          <span>Search Emails</span>
        </CommandItem>
        <CommandItem>
          <span>⚙️</span>
          <span>Settings</span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Campaigns">
        <CommandItem>
          <span>📧</span>
          <span>Q1 Outreach</span>
          <CommandShortcut>⌘1</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <span>📧</span>
          <span>Product Launch</span>
          <CommandShortcut>⌘2</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </>
);

export const Default = () => (
  <Command className="rounded-lg border border-border shadow-md w-full max-w-sm">
    {commonItems}
  </Command>
);

export const WithIcons = () => (
  <Command className="rounded-lg border border-border shadow-md w-full max-w-sm">
    <CommandInput placeholder="Type a command..." />
    <CommandList>
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandGroup heading="Quick actions">
        <CommandItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New Campaign</span>
        </CommandItem>
        <CommandItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span>Import Prospects</span>
          <CommandShortcut>⌘I</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span>Analytics</span>
          <CommandShortcut>⌘A</CommandShortcut>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Navigate">
        <CommandItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span>Settings</span>
          <CommandShortcut>⌘,</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span>Profile</span>
          <CommandShortcut>⌘P</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);

export const Empty = () => (
  <Command className="rounded-lg border border-border shadow-md w-full max-w-sm">
    <CommandInput placeholder="Search..." />
    <CommandList>
      <CommandEmpty>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">🔍</span>
          <p className="text-sm text-muted-foreground">No results found</p>
          <p className="text-xs text-muted-foreground/70">Try a different search term</p>
        </div>
      </CommandEmpty>
    </CommandList>
  </Command>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark">
    <Command className="rounded-lg border border-border shadow-md w-full max-w-sm">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem>
            <span>📧</span>
            <span>New Campaign</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>👤</span>
            <span>Add Prospect</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem>
            <span>📊</span>
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>⚙️</span>
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const SearchOnly = () => (
  <Command className="rounded-lg border border-border shadow-md w-full max-w-sm">
    <CommandInput placeholder="Type to search..." className="h-12" />
    <CommandList>
      <CommandEmpty>Type to search across campaigns, prospects, and settings.</CommandEmpty>
    </CommandList>
  </Command>
);

export const ManyGroups = () => (
  <Command className="rounded-lg border border-border shadow-md w-full max-w-sm">
    <CommandInput placeholder="Search..." />
    <CommandList>
      <CommandGroup heading="Recent">
        <CommandItem><span>📋</span><span>Q1 Campaign Review</span></CommandItem>
        <CommandItem><span>👤</span><span>Sarah Chen Profile</span></CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Favorites">
        <CommandItem><span>📊</span><span>Analytics Dashboard</span></CommandItem>
        <CommandItem><span>📧</span><span>Email Templates</span></CommandItem>
        <CommandItem><span>🤖</span><span>Swarm Canvas</span></CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Admin">
        <CommandItem><span>👥</span><span>Team Members</span></CommandItem>
        <CommandItem><span>💳</span><span>Billing</span></CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);

export const Compact = () => (
  <Command className="rounded-lg border border-border shadow-md w-full max-w-xs">
    <CommandInput placeholder="Quick search..." className="h-8 text-xs" />
    <CommandList>
      <CommandGroup heading="Navigate">
        <CommandItem className="py-1">
          <span>📊</span>
          <span className="text-xs">Dashboard</span>
        </CommandItem>
        <CommandItem className="py-1">
          <span>📧</span>
          <span className="text-xs">Campaigns</span>
        </CommandItem>
        <CommandItem className="py-1">
          <span>⚙️</span>
          <span className="text-xs">Settings</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);
