import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

export default { title: 'UI/Tabs', component: Tabs };

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => (
  <Tabs defaultValue="account" className="w-full max-w-sm">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="account" className="text-sm text-muted-foreground p-2">
      Manage your account details and preferences.
    </TabsContent>
    <TabsContent value="password" className="text-sm text-muted-foreground p-2">
      Update your password and security settings.
    </TabsContent>
    <TabsContent value="settings" className="text-sm text-muted-foreground p-2">
      Configure your app experience.
    </TabsContent>
  </Tabs>
);

export const WithLongLabels = () => (
  <Tabs defaultValue="email" className="w-full max-w-sm">
    <TabsList>
      <TabsTrigger value="email">Email</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="privacy">Privacy &amp; Data</TabsTrigger>
    </TabsList>
    <TabsContent value="email" className="text-sm text-muted-foreground p-2">
      Email notification preferences.
    </TabsContent>
    <TabsContent value="notifications" className="text-sm text-muted-foreground p-2">
      Push and in-app notification settings.
    </TabsContent>
    <TabsContent value="privacy" className="text-sm text-muted-foreground p-2">
      Data sharing and privacy controls.
    </TabsContent>
  </Tabs>
);

export const TwoTabs = () => (
  <Tabs defaultValue="on" className="w-full max-w-sm">
    <TabsList>
      <TabsTrigger value="on">On</TabsTrigger>
      <TabsTrigger value="off">Off</TabsTrigger>
    </TabsList>
    <TabsContent value="on" className="text-sm text-muted-foreground p-2">
      Feature is enabled.
    </TabsContent>
    <TabsContent value="off" className="text-sm text-muted-foreground p-2">
      Feature is disabled.
    </TabsContent>
  </Tabs>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkModeDefault = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-sm text-muted-foreground p-2">
        Manage your account details and preferences.
      </TabsContent>
      <TabsContent value="password" className="text-sm text-muted-foreground p-2">
        Update your password and security settings.
      </TabsContent>
      <TabsContent value="settings" className="text-sm text-muted-foreground p-2">
        Configure your app experience.
      </TabsContent>
    </Tabs>
  </div>
);

export const DarkModeMinimal = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <Tabs defaultValue="chats" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="chats">Chats</TabsTrigger>
        <TabsTrigger value="calls">Calls</TabsTrigger>
      </TabsList>
      <TabsContent value="chats" className="text-sm text-muted-foreground p-2">
        Your conversation history appears here.
      </TabsContent>
      <TabsContent value="calls" className="text-sm text-muted-foreground p-2">
        Recent calls and voicemail.
      </TabsContent>
    </Tabs>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const CardStyle = () => (
  <Tabs defaultValue="login" className="w-full max-w-sm">
    <TabsList className="w-full bg-muted/50 rounded-xl p-1.5">
      <TabsTrigger value="login" className="flex-1 data-[state=active]:shadow-sm data-[state=active]:bg-background rounded-lg">
        Login
      </TabsTrigger>
      <TabsTrigger value="signup" className="flex-1 data-[state=active]:shadow-sm data-[state=active]:bg-background rounded-lg">
        Sign Up
      </TabsTrigger>
    </TabsList>
    <TabsContent value="login" className="text-sm text-muted-foreground p-3">
      Sign in to your existing account.
    </TabsContent>
    <TabsContent value="signup" className="text-sm text-muted-foreground p-3">
      Create a new account.
    </TabsContent>
  </Tabs>
);

export const UnderlineStyle = () => (
  <Tabs defaultValue="tab1" className="w-full max-w-sm">
    <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-6">
      <TabsTrigger
        value="tab1"
        className="rounded-none px-0 pb-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent"
      >
        Tab One
      </TabsTrigger>
      <TabsTrigger
        value="tab2"
        className="rounded-none px-0 pb-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent"
      >
        Tab Two
      </TabsTrigger>
      <TabsTrigger
        value="tab3"
        className="rounded-none px-0 pb-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent"
      >
        Tab Three
      </TabsTrigger>
    </TabsList>
    <TabsContent value="tab1" className="text-sm text-muted-foreground p-3">
      Content for tab one.
    </TabsContent>
    <TabsContent value="tab2" className="text-sm text-muted-foreground p-3">
      Content for tab two.
    </TabsContent>
    <TabsContent value="tab3" className="text-sm text-muted-foreground p-3">
      Content for tab three.
    </TabsContent>
  </Tabs>
);

export const PillsStyle = () => (
  <Tabs defaultValue="all" className="w-full max-w-sm">
    <TabsList className="bg-transparent gap-2 p-0 h-auto">
      <TabsTrigger
        value="all"
        className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm bg-muted text-muted-foreground"
      >
        All
      </TabsTrigger>
      <TabsTrigger
        value="active"
        className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm bg-muted text-muted-foreground"
      >
        Active
      </TabsTrigger>
      <TabsTrigger
        value="archived"
        className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm bg-muted text-muted-foreground"
      >
        Archived
      </TabsTrigger>
    </TabsList>
    <TabsContent value="all" className="text-sm text-muted-foreground p-2">
      Showing all items.
    </TabsContent>
    <TabsContent value="active" className="text-sm text-muted-foreground p-2">
      Showing active items only.
    </TabsContent>
    <TabsContent value="archived" className="text-sm text-muted-foreground p-2">
      Showing archived items.
    </TabsContent>
  </Tabs>
);
