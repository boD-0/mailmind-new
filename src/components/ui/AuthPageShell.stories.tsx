import React from 'react';
import { AuthPageShell } from './AuthPageShell';

const meta = { title: 'UI/AuthPageShell', component: AuthPageShell };

export default meta;

/* ── Basic Variants ───────────────────────────────────── */

export const SignIn = () => (
  <AuthPageShell
    title="Welcome back"
    description="Sign in to your account to continue."
  >
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm"
          placeholder="you@company.com"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <input
          type="password"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm"
          placeholder="••••••••"
        />
      </div>
      <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Sign In
      </button>
    </div>
  </AuthPageShell>
);

export const SignUp = () => (
  <AuthPageShell
    title="Create an account"
    description="Get started with MailMind in minutes."
  >
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Full name</label>
        <input className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="John Doe" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="you@company.com" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <input type="password" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="••••••••" />
      </div>
      <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Create Account
      </button>
    </div>
  </AuthPageShell>
);

export const WithPreview = () => (
  <AuthPageShell
    title="Join MailMind"
    description="AI-powered cold email that actually knows them."
    showPreview
    preview={
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">M</div>
          <span className="text-white text-lg font-bold">MailMind</span>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          Four specialized AI agents collaborate to craft hyper-personalized email campaigns based on each prospect&#39;s psychological profile.
        </p>
      </div>
    }
  >
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="you@company.com" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <input type="password" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="••••••••" />
      </div>
      <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Sign In
      </button>
    </div>
  </AuthPageShell>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkModeSignIn = () => (
  <div className="dark">
    <AuthPageShell
      title="Welcome back"
      description="Sign in to your account to continue."
    >
      <div className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="you@company.com" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <input type="password" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="••••••••" />
        </div>
        <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Sign In
        </button>
      </div>
    </AuthPageShell>
  </div>
);

export const DarkModeWithPreview = () => (
  <div className="dark">
    <AuthPageShell
      title="Get started"
      description="Create your account and start sending smarter emails."
      showPreview
      preview={
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">M</div>
            <span className="text-white text-lg font-bold">MailMind</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Four specialized AI agents collaborate to craft hyper-personalized email campaigns.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <input className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="John Doe" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm" placeholder="you@company.com" />
        </div>
        <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Create Account
        </button>
      </div>
    </AuthPageShell>
  </div>
);
