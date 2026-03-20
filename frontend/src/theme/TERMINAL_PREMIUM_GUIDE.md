# Terminal-Premium Editorial Theme Guide

## North Star
- Build a focus-first interface with Organic Brutalism: dense, sharp, monochrome with amber accents.
- Avoid bubbly SaaS visuals and soft, high-radius cards.

## Core Rules
- No-line layout rule: do not use divider lines for structural separation.
- Separate regions with tonal shifts: `surface` -> `surface-low` -> `surface-container`.
- Reserve strong borders for accessibility fallback only (`outline-variant` at 15% opacity).
- Use ambient depth and recess (tonal stacking), not hard shadow stacks.

## Tokens
- Base desk: `surface-dim` / `background`.
- Primary workspace: `surface-container-low`.
- Nested data trays: `surface-container`.
- Interaction hover/active: `surface-container-highest`.
- Accent system: `primary-container` (amber) and `primary` (focus ring).

## Typography
- Display/editorial text: `font-display` (Geist/Inter stack).
- Data/technical text: `font-data` (JetBrains Mono stack).
- Metadata labels: use `.tm-label` (uppercase, widest tracking).

## Components
- Buttons: sharp corners (`rounded-sm`), amber primary, tonal secondary.
- Inputs: recessed field (`surface-lowest`) with ghost border and amber focus ring.
- Cards/lists: tonal separation over divider lines.
- Chips: use semantic intensity (`low`, `medium`, `high`) with minimal fill.

## Motion
- Use meaningful reveal motion only (`animate-editorial-rise`) for first paint/list entry.
- Avoid decorative micro-animations.

## Interaction
- Link color defaults to amber or underlined foreground text.
- Never use pure white text; stick to `foreground` token.

## Page Implementation Contract
- Every page should be composed from tokenized primitives first (`Card`, `Button`, `Input`, `Badge`).
- If a new UI pattern is introduced, add a token-backed utility class in `index.css` before page-level custom styling.
