import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu';
import { Button } from './button';

const meta = { title: 'UI/DropdownMenu', component: DropdownMenu };

/* ── Basic Variants ───────────────────────────────────── */

export const Default = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="primary">Open Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>
        Profile
        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Settings
        <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Billing
        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        Log out
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithIcons = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary">Actions</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-4.5a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithCheckboxes = () => {
  const [bookmarks, setBookmarks] = React.useState<string[]>(["twitter", "github"]);
  const [sortBy, setSortBy] = React.useState("date");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">View options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>Bookmarks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={bookmarks.includes("twitter")}
          onCheckedChange={(checked) =>
            setBookmarks(checked ? [...bookmarks, "twitter"] : bookmarks.filter((b) => b !== "twitter"))
          }
        >
          Twitter
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={bookmarks.includes("github")}
          onCheckedChange={(checked) =>
            setBookmarks(checked ? [...bookmarks, "github"] : bookmarks.filter((b) => b !== "github"))
          }
        >
          GitHub
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={bookmarks.includes("dribbble")}
          onCheckedChange={(checked) =>
            setBookmarks(checked ? [...bookmarks, "dribbble"] : bookmarks.filter((b) => b !== "dribbble"))
          }
        >
          Dribbble
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default meta;

export const WithSubmenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary">More</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>New tab</DropdownMenuItem>
      <DropdownMenuItem>New window</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-44">
          <DropdownMenuItem>Email</DropdownMenuItem>
          <DropdownMenuItem>Messages</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Copy link</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Print</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const DisabledItems = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary">Options</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>Edit</DropdownMenuItem>
      <DropdownMenuItem disabled>Archive (unavailable)</DropdownMenuItem>
      <DropdownMenuItem disabled>Export (coming soon)</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Settings</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[200px]">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export const DarkModeWithIcons = () => (
  <div className="dark bg-neutral-950 p-8 rounded-lg min-h-[200px]">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-4.5a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const AlignEnd = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary">Aligned right</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48" align="end">
      <DropdownMenuItem>Action one</DropdownMenuItem>
      <DropdownMenuItem>Action two</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Action three</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const InsetItems = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary">Inset items</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuLabel inset>Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem inset>Profile</DropdownMenuItem>
      <DropdownMenuItem inset>Settings</DropdownMenuItem>
      <DropdownMenuItem inset>Billing</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem inset>Log out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
