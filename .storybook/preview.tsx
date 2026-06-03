import '../src/app/globals.css';
import type { Preview } from '@storybook/react';

/* ═══════════════════════════════════════════════════════════════════════════
   Dark mode support for Storybook
   
   The project uses :root for dark theme and .light / html:not([data-theme="dark"])
   for light theme. In Storybook's iframe, <html> has no data-theme attribute, so
   the light theme selector matches and CSS variables resolve to light-mode values.
   
   Wrapping a story in <div className="dark"> needs to switch the CSS variables
   back to dark theme. This block ensures .dark sets the correct dark-mode values.
   ═══════════════════════════════════════════════════════════════════════════ */

const style = document.createElement('style');
style.textContent = `
  .dark {
    --color-background: #111110 !important;
    --color-foreground: #F1EFE8 !important;
    --color-muted-foreground: #888780 !important;
    --color-card: #1C1C1A !important;
    --color-card-foreground: #F1EFE8 !important;
    --color-popover: #1C1C1A !important;
    --color-popover-foreground: #F1EFE8 !important;
    --color-border: rgba(255,255,255,0.07) !important;
    --color-muted: #2C2C2A !important;
    --color-secondary: #242422 !important;
    --color-secondary-foreground: #B4B2A9 !important;
    --color-accent: rgba(239,159,39,0.15) !important;
    --color-accent-foreground: #F1EFE8 !important;
    --color-primary: #EF9F27 !important;
    --color-primary-foreground: #FFFFFF !important;
    --color-sidebar: #111110 !important;
    --color-sidebar-foreground: #B4B2A9 !important;
    --color-sidebar-accent: #2C2C2A !important;
    --color-sidebar-accent-foreground: #F1EFE8 !important;
    --color-sidebar-border: rgba(255,255,255,0.07) !important;
  }
`;
document.head.appendChild(style);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true }
  }
};

export default preview;
