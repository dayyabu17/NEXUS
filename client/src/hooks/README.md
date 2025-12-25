# Hooks Directory Guidelines

## Scope

This directory groups reusable logic that complements React components. Hooks fall into two categories:

- Domain hooks kept in feature folders such as `organizer/` or `guest/`.
- Shared hooks that remain at the root when they are used across multiple domains.

## Naming Conventions

Follow these conventions when creating a new hook:

1. Always start the filename and exported function with `use` (for example, `useGuestNotifications`).
2. Compose names with the pattern `use<Domain><Feature>` when the hook is feature-scoped (for example, `useOrganizerEarnings`).
3. Use `use<Feature>` only when the hook is intentionally shared across domains (for example, `useEventDetails`).
4. Prefer descriptive verbs or outcomes at the end of the name: `useGuestLocationSync`, `useAdminTheme`. Avoid generic suffixes like `Data` unless the hook strictly fetches data.
5. If a hook wraps another library hook (such as `useEffect` or `useQuery`), clarify the specialization in the name: `useOrganizerEventQuery`.

## File Placement

- Place domain-specific hooks inside the matching folder: organizer-focused logic in `organizer/`, guest flows in `guest/`, and future domains in their respective folders.
- Keep shared hooks at the directory root only when they serve more than one domain or are truly app-wide utilities.
- When extracting a hook from an existing component, move any domain-heavy helpers alongside it to keep the hook focused.

## Documentation

- Export a single default function per file. Inline helpers should remain file-local unless they are reused elsewhere.
- Briefly describe the hook's responsibility at the top of the file when its behavior is not obvious (one-line comment is enough).
- Update any consuming component or service imports to match the new path and name after refactors.

## Testing and Verification

- Exercise new hooks through the components that consume them. Add targeted unit tests when the hook manages complex state transitions or side effects.
- Validate that linting and type checks continue to pass after renaming or relocating hooks.
