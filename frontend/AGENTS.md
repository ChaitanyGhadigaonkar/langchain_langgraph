# Frontend — Next.js Chat UI

> This is the Next.js 16 chat interface for the AgenticRAG project. For backend and API context, see the root [AGENTS.md](../AGENTS.md) and [docs/architecture.md](../docs/architecture.md).

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Package Manager**: `pnpm` — do not use `npm` or `yarn`
- **UI Components**: shadcn/ui v4
- **Styling**: Tailwind CSS v4
- **Icons**: Hugeicons
- **Fonts**: Space Grotesk (sans) and IBM Plex Mono (mono) via `next/font/google`

## Setup & Run

```bash
pnpm install          # install dependencies
pnpm dev              # start the Next.js dev server (localhost:3000)
pnpm build            # production build
pnpm format           # format code with Prettier
npx tsc --noEmit      # TypeScript type check
```

The frontend proxies API requests to the FastAPI backend via `next.config.ts` rewrites. Run both servers side by side during development (backend on `:8000`, frontend on `:3000`).

## Directory Structure

```
frontend/
├── src/
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # Reusable React components
│   │   └── ui/         # shadcn/ui primitives (button, input, etc.)
│   └── lib/            # API client functions and shared utilities
├── public/             # Static assets
├── components.json     # shadcn/ui configuration
├── next.config.ts      # Next.js config (includes API proxy rewrites)
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Coding Style

- Use TypeScript with strict mode. Prefer `interface` over `type` for object shapes.
- Place reusable React components in `src/components/`. shadcn/ui primitives live in `src/components/ui/`.
- Place API client functions and shared utilities in `src/lib/`.
- Use `camelCase` for variables and functions, `PascalCase` for components and types.
- Use Prettier (configured in `.prettierrc`) for formatting with import sorting via `@trivago/prettier-plugin-sort-imports`.
