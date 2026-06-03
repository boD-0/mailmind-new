import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarFooter, SidebarSeparator } from './sidebar';

export default { title: 'UI/Sidebar', component: Sidebar };

/* ── Basic Variants ───────────────────────────────────── */

const navItems = [
  { label: 'Dashboard', icon: '📊', active: true },
  { label: 'Campaigns', icon: '📧', active: false },
  { label: 'Prospects', icon: '👥', active: false },
  { label: 'Analytics', icon: '📈', active: false },
  { label: 'Settings', icon: '⚙️', active: false },
];

export const Default = () => (
  <SidebarProvider defaultOpen>
    <div className="flex h-[400px] w-full max-w-[300px] border border-border rounded-lg overflow-hidden">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-sm font-bold">MailMind</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Team">
                    <span>👤</span>
                    <span>Team Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Billing">
                    <span>💳</span>
                    <span>Billing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">John Doe</p>
              <p className="text-[10px] text-muted-foreground">PRO plan</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  </SidebarProvider>
);

export const Collapsed = () => (
  <SidebarProvider defaultOpen={false}>
    <div className="flex h-[400px] w-full max-w-[300px] border border-border rounded-lg overflow-hidden">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-center px-2 py-2">
            <span className="text-sm font-bold">M</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  </SidebarProvider>
);

export const WithSubmenu = () => (
  <SidebarProvider defaultOpen>
    <div className="flex h-[400px] w-full max-w-[300px] border border-border rounded-lg overflow-hidden">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-sm font-bold">MailMind</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Q1 Campaign">
                    <span>📋</span>
                    <span>Q1 Campaign</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Product Launch">
                    <span>🚀</span>
                    <span>Product Launch</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Newsletter">
                    <span>📬</span>
                    <span>Newsletter</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Team</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Team Members">
                    <span>👤</span>
                    <span>Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  </SidebarProvider>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-4 rounded-lg">
    <SidebarProvider defaultOpen>
      <div className="flex h-[400px] w-full max-w-[300px] border border-border rounded-lg overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-sm font-bold">MailMind</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const FloatingVariant = () => (
  <SidebarProvider defaultOpen>
    <div className="flex h-[400px] w-full max-w-[340px]">
      <Sidebar variant="floating">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-sm font-bold">MailMind</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.slice(0, 4).map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  </SidebarProvider>
);
