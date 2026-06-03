# Font loading and preload recommendations

## Goals
- Ensure LCP-friendly font loading
- Avoid FOUT where possible
- Use `font-display: swap` and preload critical weights

## HTML preload example
```html
<link rel="preload" href="/fonts/DM-Sans-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/DM-Sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

## Next.js (app router) example
In `app/layout.tsx` (or `_document` for older Next.js versions):

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/DM-Sans-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/DM-Sans-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Recommendations
- Only preload weights used above the fold (e.g., hero headings).
- Use `font-display: swap` in `@font-face` definitions.
- Subset fonts for production to reduce bytes.
- Consider using `next/font` (if available) for automatic optimization.
