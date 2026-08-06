# Frontend — Next.js Chat UI

> This is the Next.js 16 chat interface for the AgenticRAG project. For backend and API context, see the root [AGENTS.md](../AGENTS.md) and [docs/architecture.md](../docs/architecture.md).

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Package Manager**: `pnpm` — do not use `npm` or `yarn`
- **UI Components**: shadcn/ui v4 (Theme: Sapphire Blue)
- **Styling**: Tailwind CSS v4
- **Icons**: `@hugeicons/react` and `@hugeicons/core-free-icons` (Do not use `lucide-react`)
- **Fonts**: Space Grotesk (sans) and IBM Plex Mono (mono) via `next/font/google`
- **API Client**: `axios` (specifically via `axiosClient` in `src/lib/api.ts`)

## Setup & Run

```bash
pnpm install          # install dependencies
pnpm dev              # start the Next.js dev server (localhost:3000)
pnpm build            # production build
pnpm format           # format code with Prettier
pnpm lint             # run ESLint checks
```

The frontend proxies API requests to the FastAPI backend via `next.config.ts` rewrites (for client requests) and uses `API_BASE_URL` from `.env.local` for server-side requests.

## Directory Structure

```text
frontend/
├── src/
│   ├── app/            # Next.js App Router. Uses route groups like (authenticated) and (unauthenticated) with separate layouts
│   ├── components/     # Reusable React components
│   │   └── ui/         # shadcn/ui primitives
│   ├── hooks/          # React hooks
│   ├── lib/            # Shared utilities and `api.ts` (axiosClient setup)
│   ├── services/       # API call definitions (e.g. `conversations.ts`). Do not use names like `db` for this folder
│   └── types/          # Application-wide types (e.g., `base.ts`, `conversation.ts`)
├── .agents/hooks.json  # Antigravity CLI hooks (runs pnpm exec lint/format on file changes)
```

## Coding Style & Patterns

- **Component Standard**: Use arrow functions (`rafce` snippet style), e.g., `const Component = () => { ... }; export default Component;`.
- **Server Components**: Prefer React Server Components (RSC) where possible (e.g., fetching initial data for the Sidebar natively on the server).
- **Type Definitions**: Prefer `type` instead of `interface`.
- **API Responses & Types**:
  - Standardize API responses using the generic `Output<T>` type defined in `base.ts`:
    ```typescript
    export type Output<T = Record<string, unknown>> = {
      success: boolean;
      message: string;
    } & T;
    ```
  - **Naming Convention**: Do not add "Response" to the end of API types. Use the `Output` suffix (e.g., `GetConversationsOutput` instead of `GetConversationsResponse`).
- **Icons**: When using Hugeicons, import `HugeiconsIcon` from `@hugeicons/react` and the specific icon from `@hugeicons/core-free-icons` (e.g. `import { BubbleChatIcon } from "@hugeicons/core-free-icons";`).
- **Linting & Formatting**: Code formatting is enforced via `pnpm format` and `pnpm lint`. The `.agents/hooks.json` file is configured to run these checks locally via `pnpm exec` when files are modified.
