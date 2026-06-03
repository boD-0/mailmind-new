import React from 'react';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './table';
import { Badge } from './badge';

export default {}
const meta = { title: 'UI/Table', component: Table };

/* ── Basic Variants ───────────────────────────────────── */

const subscribers = [
  { name: 'Alice Johnson', email: 'alice@acmecorp.com', plan: 'Professional', status: 'active', joined: '2025-01-15', replies: 24 },
  { name: 'Bob Smith', email: 'bob@startup.io', plan: 'Starter', status: 'active', joined: '2025-02-03', replies: 12 },
  { name: 'Carol Williams', email: 'carol@enterprise.com', plan: 'Professional', status: 'active', joined: '2025-03-20', replies: 8 },
  { name: 'Dave Brown', email: 'dave@agency.co', plan: 'Free', status: 'active', joined: '2025-04-01', replies: 3 },
  { name: 'Eve Davis', email: 'eve@techlabs.io', plan: 'Starter', status: 'inactive', joined: '2025-01-28', replies: 0 },
  { name: 'Frank Miller', email: 'frank@design.studio', plan: 'Professional', status: 'active', joined: '2025-05-12', replies: 15 },
];

export const Default = () => (
  <div className="border border-border rounded-lg overflow-hidden">
    <Table>
      <TableCaption>List of subscribers and their engagement.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Replies</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscribers.map((s) => (
          <TableRow key={s.email}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell className="text-muted-foreground">{s.email}</TableCell>
            <TableCell>
              <span className={`text-xs font-medium ${
                s.plan === 'Professional' ? 'text-amber-600' :
                s.plan === 'Starter' ? 'text-blue-600' : 'text-muted-foreground'
              }`}>
                {s.plan}
              </span>
            </TableCell>
            <TableCell className="font-mono text-sm">{s.replies}</TableCell>
            <TableCell>
              <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                {s.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export const WithFooter = () => (
  <div className="border border-border rounded-lg overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">Replies</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscribers.map((s) => (
          <TableRow key={s.email}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell className="text-muted-foreground">{s.email}</TableCell>
            <TableCell>{s.plan}</TableCell>
            <TableCell className="text-right font-mono">{s.replies}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total replies</TableCell>
          <TableCell className="text-right font-mono font-bold">
            {subscribers.reduce((sum, s) => sum + s.replies, 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
);

export const Empty = () => (
  <div className="border border-border rounded-lg overflow-hidden">
    <Table>
      <TableCaption>No subscribers yet.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
            No data available
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export const ContactsList = () => (
  <div className="border border-border rounded-lg overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contact</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Last Contact</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { name: 'Sarah Kim', company: 'Helix Bio', score: 92, lastContact: '2 days ago' },
          { name: 'J. Chen', company: 'Arcadia Finance', score: 78, lastContact: '5 days ago' },
          { name: 'Mike Rivera', company: 'NovaStack', score: 85, lastContact: '1 week ago' },
          { name: 'Priya Patel', company: 'CloudZen', score: 63, lastContact: '2 weeks ago' },
          { name: 'Tom O\'Brien', company: 'Greenline Energy', score: 71, lastContact: '3 weeks ago' },
        ].map((c) => (
          <TableRow key={c.name}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium">{c.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{c.company}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.score >= 80 ? 'bg-emerald-500' :
                      c.score >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{c.score}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{c.lastContact}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.slice(0, 4).map((s) => (
            <TableRow key={s.email}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.plan}</TableCell>
              <TableCell>
                <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                  {s.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);
