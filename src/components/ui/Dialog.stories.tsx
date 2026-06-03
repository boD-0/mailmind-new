import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';

const meta = { title: 'UI/Dialog', component: Dialog };

export default meta;

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="primary">Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm action</DialogTitle>
        <DialogDescription>
          Are you sure you want to proceed with this action? This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const Minimal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost">Open</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Quick info</DialogTitle>
        <DialogDescription>
          A minimal dialog with just a title and description.
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

export const WithLongContent = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="primary">Terms &amp; Conditions</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogDescription>
          Please read the following terms carefully before proceeding.
        </DialogDescription>
      </DialogHeader>
      <div className="text-sm text-muted-foreground space-y-3 max-h-48 overflow-y-auto">
        <p>
          1. Acceptance of Terms. By accessing and using this service, you accept and agree
          to be bound by these terms. If you do not agree, you may not use the service.
        </p>
        <p>
          2. Data Usage. We collect and process your data in accordance with our Privacy
          Policy. You retain ownership of your content.
        </p>
        <p>
          3. Service Availability. We strive to maintain high availability but do not
          guarantee uninterrupted access to the service.
        </p>
        <p>
          4. Limitation of Liability. We shall not be liable for any indirect, incidental,
          or consequential damages arising from your use of the service.
        </p>
        <p>
          5. Changes to Terms. We reserve the right to modify these terms at any time.
          Users will be notified of material changes.
        </p>
      </div>
      <DialogFooter>
        <Button variant="secondary">Decline</Button>
        <Button variant="primary">Accept</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const Destructive = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="primary">Delete Account</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-destructive">Delete account</DialogTitle>
        <DialogDescription>
          This will permanently delete your account and all associated data. This action
          cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
        <strong>Warning:</strong> All your campaigns, prospects, and email history will be
        permanently removed.
      </div>
      <DialogFooter>
        <Button variant="secondary">Keep account</Button>
        <Button variant="primary">Delete everything</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkModeDefault = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[300px] flex items-center justify-center">
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed with this action? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);

export const DarkModeDestructive = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[300px] flex items-center justify-center">
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete workspace</DialogTitle>
          <DialogDescription>
            This workspace and all its data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          You cannot undo this action.
        </div>
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const CenteredForm = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="primary">Create project</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New project</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new project.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Project name</label>
          <input
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="My campaign"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder="Optional description"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Create</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const WideDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="primary">View details</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Campaign analytics</DialogTitle>
        <DialogDescription>
          Detailed performance metrics for your last email campaign.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-3 gap-4 py-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">24%</p>
          <p className="text-xs text-muted-foreground mt-1">Open rate</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">12%</p>
          <p className="text-xs text-muted-foreground mt-1">Click rate</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">4.2%</p>
          <p className="text-xs text-muted-foreground mt-1">Reply rate</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary">Close</Button>
        <Button variant="primary">Export report</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
