import React from 'react';
import { EventScheduler, type ScheduledEvent } from './event-scheduler';

export default {}
const meta = { title: 'UI/EventScheduler', component: EventScheduler };

/* ── Basic Variants ───────────────────────────────────── */

const sampleEvents: ScheduledEvent[] = [
  { id: '1', title: 'Q1 Campaign Review', date: new Date(Date.now() + 86400000 * 3), type: 'meeting' },
  { id: '2', title: 'Email Draft Deadline', date: new Date(Date.now() + 86400000 * 7), type: 'deadline' },
  { id: '3', title: 'Research Prospect List', date: new Date(Date.now() + 86400000 * 14), type: 'task' },
];

const manyEvents: ScheduledEvent[] = [
  { id: '1', title: 'Campaign Review', date: new Date(Date.now() + 86400000 * 2), type: 'meeting' },
  { id: '2', title: 'Draft Deadline', date: new Date(Date.now() + 86400000 * 5), type: 'deadline' },
  { id: '3', title: 'Research Phase', date: new Date(Date.now() + 86400000 * 8), type: 'task' },
  { id: '4', title: 'Team Sync', date: new Date(Date.now() + 86400000 * 10), type: 'meeting' },
  { id: '5', title: 'Review Analytics', date: new Date(Date.now() + 86400000 * 12), type: 'task' },
];

export const Empty = () => (
  <EventScheduler events={[]} onAdd={(e) => console.log('add', e)} onDelete={(id) => console.log('delete', id)} />
);

export const WithEvents = () => (
  <EventScheduler events={sampleEvents} onAdd={(e) => console.log('add', e)} onDelete={(id) => console.log('delete', id)} />
);

export const ManyEvents = () => (
  <EventScheduler events={manyEvents} onAdd={(e) => console.log('add', e)} onDelete={(id) => console.log('delete', id)} />
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkModeEmpty = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg min-h-[300px]">
    <EventScheduler events={[]} onAdd={(e) => console.log('add', e)} onDelete={(id) => console.log('delete', id)} />
  </div>
);

export const DarkModeWithEvents = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg min-h-[300px]">
    <EventScheduler events={sampleEvents} onAdd={(e) => console.log('add', e)} onDelete={(id) => console.log('delete', id)} />
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const Compact = () => (
  <EventScheduler
    events={sampleEvents}
    className="max-w-lg mx-auto"
    onAdd={(e) => console.log('add', e)}
    onDelete={(id) => console.log('delete', id)}
  />
);
