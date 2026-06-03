import React from 'react';
import { AureliusAvatar } from './aurelius-avatar';

const meta = { title: 'UI/AureliusAvatar', component: AureliusAvatar };

export default meta;

export const Default = () => <AureliusAvatar />;

export const WithoutName = () => <AureliusAvatar showName={false} />;

export const WithSubtitle = () => (
  <AureliusAvatar subtitle="Your agency strategist" />
);

export const ChatSize = () => <AureliusAvatar size="md" />;

export const ChatSizeWithSubtitle = () => (
  <AureliusAvatar size="md" subtitle="Your agency strategist" />
);

export const AvatarOnly = () => (
  <AureliusAvatar size="md" showName={false} />
);

/* ── Dark Mode Variants ──────────────────────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <AureliusAvatar subtitle="Your agency strategist" />
  </div>
);

export const DarkModeChatSize = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <AureliusAvatar size="md" subtitle="Your agency strategist" />
  </div>
);

export const DarkModeAvatarOnly = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <AureliusAvatar size="md" showName={false} />
  </div>
);

/* ── Custom className Variants ────────────────────────────────────────── */

export const WithShadow = () => (
  <AureliusAvatar
    className="p-3 rounded-lg border border-border bg-card shadow-md"
    subtitle="Your agency strategist"
  />
);

export const WithRing = () => (
  <AureliusAvatar
    className="ring-2 ring-amber-500/30 ring-offset-2 ring-offset-background rounded-lg"
    subtitle="Highlighted"
  />
);

export const WideLayout = () => (
  <AureliusAvatar
    className="w-full max-w-sm justify-between px-4 py-3 rounded-xl border border-border bg-card"
    size="md"
    subtitle="Senior Outreach Specialist"
  />
);

export const WithCustomBadge = () => (
  <AureliusAvatar
    className="relative after:absolute after:-top-0.5 after:-right-0.5 after:h-3 after:w-3 after:rounded-full after:bg-emerald-500 after:ring-2 after:ring-background"
    subtitle="Online"
  />
);
