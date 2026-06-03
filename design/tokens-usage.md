# How to use MailMind design tokens

Location: `styles/tokens.css`

Guidelines:

- Import `styles/tokens.css` (or reference the CSS variables) at the top level (e.g., `src/app/globals.css`).
- Prefer variables over hardcoded values in components. Examples:
  - Button background: `background: var(--color-accent); color: #FFF;`
  - Card radius: `border-radius: var(--radius-card);`
  - Spacing: `padding: var(--space-5);` (20px)
- Breakpoints: use the defined breakpoints in media queries. Example:

```css
@media (min-width: 1024px) {
  .dashboard-shell { padding: calc(var(--space-6) * 2); }
}
```

- Motion: use `--motion-short`/`--motion-medium` for transitions. Respect `prefers-reduced-motion`.

- Dark theme: toggle `data-theme="dark"` on the root element to switch variables.

- Adding tokens: when adding tokens, keep naming consistent (`--color-*`, `--space-*`, `--scale-*`). Update `design/components-inventory.json` if a new component consumes a new token.

- Testing: include visual regression snapshots for key components using the tokens. If a contrast issue appears, update tokens and the design doc, not individual components.

Example button style:

```css
.button-primary {
  background: var(--color-accent);
  color: var(--color-background);
  border-radius: var(--radius-button);
  padding: 12px 20px;
  transition: background var(--motion-short) var(--motion-ease);
}

.button-primary:focus {
  outline: var(--focus-ring);
}
```
