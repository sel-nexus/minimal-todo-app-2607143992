# Minimal Todo App

A deterministic, dependency-free browser todo fixture for end-to-end pipeline validation. The runtime application is exactly one file: `index.html`.

## Run the app

Open `index.html` directly in a modern browser. No server, backend, package installation, build step, storage, or account is required. Todos exist only for the current page session and reset after a reload.

## User workflow

1. Enter a non-empty task and select **Add**, or press Enter in the input.
2. Tasks receive sequential IDs in insertion order and the input clears after a successful add.
3. Select a task checkbox to toggle its completed state.
4. Select **Delete** to remove only that task.
5. The exact empty state, `No tasks yet.`, returns after the last task is deleted.

Whitespace-only submissions are ignored.

## Stable automation selectors

- `todo-input`, `add-button`, `empty-state`, and `todo-list`
- `todo-item-{id}`, `todo-checkbox-{id}`, `todo-title-{id}`, and `todo-delete-{id}`

All selectors are exposed as `data-testid` values; the fixed elements also have matching IDs.

## Browser validation

Install development-only test tooling and the Chromium binary:

```sh
npm install --no-audit --no-fund --no-bin-links
node node_modules/@playwright/test/cli.js install chromium
```

Run the direct-open browser suite:

```sh
node node_modules/@playwright/test/cli.js test --config playwright.config.js
```

The suite opens `index.html` via `file://`, exercises the complete workflow, and fails if the browser reports a warning or error.

## License

Private and proprietary.
