# @visitly/shared-core Governance Rules

To maintain a healthy monorepo and avoid circular dependencies, these rules MUST be followed when contributing to this package.

## 1. No Imports from 'apps/'
This package is a "Bottom-Level" dependency. It must **NEVER** import from any directory in `apps/` (shell, auth-mfe, etc.).

## 2. Dependency Management
- **Internal Monorepo Packages**: Use `dependencies` with `"*"` for internal packages like `@visitly/ui` and `@visitly/api-client`. This allows `shared-core` to build high-level logic using existing building blocks.
- **External Framework Libraries**: Use `peerDependencies` for large libraries (e.g., `react`, `@tanstack/react-query`). This ensures the final application (the host shell) provides a single instance of these libraries.
- **One-Way Flow**: `@visitly/shared-core` is a high-level shared layer. It can consume `@visitly/ui`, but `@visitly/ui` should **NEVER** import from `@visitly/shared-core`. This prevents circular dependency hell.
- **Circular Check**: Do not create circular references between components within this package. If `Component A` needs `Component B`, ensure it doesn't create a loop.

## 3. Structure Guidelines
- **types/**: Put pure TS interfaces/types here.
- **utils/**: Pure functions without React dependencies.
- **hooks/**: Reusable React hooks.
- **components/**: UI components that are common enough to be reused across at least two MFEs.
- **logic/**: Shared business logic (e.g., complex calculations, data transformers).

## 4. Exports
- Export everything via `src/index.ts`.
- Avoid "Internal" exports that aren't meant for public use; keep them local to their folders.
