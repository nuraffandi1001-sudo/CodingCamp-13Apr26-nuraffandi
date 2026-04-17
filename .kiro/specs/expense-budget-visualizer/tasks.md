# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a single-page expense tracker using vanilla HTML, CSS, and JavaScript. All logic lives in `js/app.js`, styles in `css/style.css`, and markup in `index.html`. No build tools, no backend — Chart.js loaded via CDN, data persisted in Local Storage.

## Tasks

- [x] 1. Scaffold project files and base HTML structure
  - Create `index.html` with semantic layout: header (balance display + theme toggle), main form section, transaction list section, chart section, monthly summary section
  - Create `css/style.css` with CSS custom properties for light/dark themes and base responsive layout (flexbox/grid, mobile-first from 320px)
  - Create `js/app.js` with the `AppState` object, section comments for State / Storage / Validation / Rendering / Chart / Event Handlers, and a `DOMContentLoaded` entry point
  - Add Chart.js CDN `<script>` tag to `index.html`
  - _Requirements: 9.2, 9.3_

- [x] 2. Implement State and Storage module
  - [x] 2.1 Define `AppState` with `transactions`, `categories` (seeded with `["Food","Transport","Fun"]`), and `theme` fields
    - _Requirements: 1.2, 8.1_
  - [x] 2.2 Implement `saveState()` — serializes `AppState` to `localStorage` under key `"appState"`
    - _Requirements: 8.1_
  - [x] 2.3 Implement `loadState()` — reads and parses `localStorage`, merges into `AppState`, handles missing key and malformed JSON (reset to defaults on parse error), shows warning banner if Local Storage is unavailable
    - _Requirements: 8.2, 8.3_
  - [ ]* 2.4 Write property test for full AppState serialization round-trip
    - **Property 8: Full AppState serialization round-trip**
    - **Validates: Requirements 8.1, 8.2**
  - [ ]* 2.5 Write property test for custom categories and theme persist across save/load
    - **Property 6: Custom categories and theme persist across save/load round-trip**
    - **Validates: Requirements 5.2, 5.3, 7.3, 7.4, 8.2**

- [x] 3. Implement Validation module
  - [x] 3.1 Implement `validateTransaction({ name, amount, category })` — returns an errors object; rejects empty/whitespace name, zero/negative/non-numeric amount, empty category
    - _Requirements: 1.4_
  - [x] 3.2 Implement `validateCategory(name, existingCategories)` — rejects empty/whitespace name and names already present (case-insensitive trim comparison)
    - _Requirements: 5.4, 5.5_
  - [ ]* 3.3 Write property test for invalid inputs rejected and state unchanged
    - **Property 2: Invalid inputs are rejected and state is unchanged**
    - **Validates: Requirements 1.4, 5.4**
  - [ ]* 3.4 Write property test for custom category uniqueness enforcement
    - **Property 5: Custom category uniqueness is enforced**
    - **Validates: Requirements 5.5**

- [x] 4. Implement pure computation functions
  - [x] 4.1 Implement `calculateBalance(transactions)` — returns the arithmetic sum of all `amount` fields (returns `0` for empty array)
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 4.2 Implement `aggregateByCategory(transactions)` — returns `{ [category]: totalAmount }` map
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 4.3 Implement `aggregateMonthlySummary(transactions)` — returns `{ "YYYY-MM": { [category]: totalAmount } }` map, sorted by month descending
    - _Requirements: 6.1, 6.2_
  - [ ]* 4.4 Write property test for balance invariant
    - **Property 3: Balance invariant — always equals sum of transaction amounts**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  - [ ]* 4.5 Write property test for chart data matches category aggregation
    - **Property 4: Chart data always matches category aggregation**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [ ]* 4.6 Write property test for monthly summary totals consistency
    - **Property 7: Monthly summary totals are consistent with transactions**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 5. Checkpoint — core logic complete
  - Verify `calculateBalance`, `aggregateByCategory`, `aggregateMonthlySummary`, `validateTransaction`, `validateCategory`, `saveState`, and `loadState` are all implemented and wired to `AppState`
  - Ask the user if questions arise before proceeding to UI rendering.

- [x] 6. Implement Transaction Form rendering and submission
  - [x] 6.1 Render the form in `index.html` with `name` text input, `amount` number input, `category` `<select>`, and a submit button; add an "Add Custom Category" sub-form (text input + button) below the select
    - _Requirements: 1.1, 1.2, 5.1_
  - [x] 6.2 Implement `renderCategoryOptions()` — populates the `<select>` from `AppState.categories`
    - _Requirements: 1.2, 5.3_
  - [x] 6.3 Implement `handleAddTransaction(event)` — calls `validateTransaction`, shows inline per-field errors on failure, on success generates a UUID/timestamp ID and today's ISO date, pushes to `AppState.transactions`, calls `saveState()`, resets form, triggers full UI re-render
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 6.4 Implement `handleAddCategory(event)` — calls `validateCategory`, shows inline error on failure, on success appends to `AppState.categories`, calls `saveState()`, calls `renderCategoryOptions()`, clears the custom category input
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  - [ ]* 6.5 Write property test for transaction addition persists to state and storage
    - **Property 1: Transaction addition persists to state and storage**
    - **Validates: Requirements 1.3, 8.2**

- [x] 7. Implement Transaction List rendering and deletion
  - [x] 7.1 Implement `renderTransactionList()` — clears and re-renders the list container from `AppState.transactions` in reverse-chronological order; each row shows name, amount, category, and a delete button; shows empty-state message when list is empty
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 7.2 Implement `handleDeleteTransaction(id)` — filters `AppState.transactions` to remove the matching ID, calls `saveState()`, triggers full UI re-render
    - _Requirements: 2.3, 3.3_
  - [ ]* 7.3 Write property test for transaction deletion removes from state and updates balance
    - **Property 9: Transaction deletion removes from state and updates balance**
    - **Validates: Requirements 2.3, 3.3**

- [x] 8. Implement Balance Display rendering
  - Implement `renderBalance()` — reads `calculateBalance(AppState.transactions)` and updates the balance DOM element; called after every add/delete
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9. Implement Chart component
  - [x] 9.1 Implement `initChart()` — creates a Chart.js pie chart instance on a `<canvas>` element; stores instance in a module-level variable; shows fallback text if Chart.js is unavailable
    - _Requirements: 4.1, 4.5_
  - [x] 9.2 Implement `renderChart()` — calls `aggregateByCategory(AppState.transactions)`, updates `chart.data.labels`, `chart.data.datasets[0].data`, and calls `chart.update()`; handles empty state (no transactions) by showing placeholder
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 10. Implement Monthly Summary rendering
  - Implement `renderMonthlySummary()` — calls `aggregateMonthlySummary(AppState.transactions)`, renders grouped month sections each showing per-category totals; hides the section or shows empty-state message when no transactions exist
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Implement Theme Toggle
  - [x] 11.1 Implement `applyTheme(theme)` — sets `data-theme` attribute on `<html>` element; CSS variables in `style.css` handle all color switching for both `light` and `dark` values
    - _Requirements: 7.2_
  - [x] 11.2 Implement `handleThemeToggle()` — flips `AppState.theme`, calls `saveState()`, calls `applyTheme()`
    - _Requirements: 7.1, 7.3_
  - [x] 11.3 On `loadState()`, call `applyTheme(AppState.theme)` to restore persisted preference; default to `"light"` if no preference found
    - _Requirements: 7.4, 7.5_

- [x] 12. Wire everything together on DOMContentLoaded
  - In the `DOMContentLoaded` handler: call `loadState()`, call `renderCategoryOptions()`, call `renderTransactionList()`, call `renderBalance()`, call `initChart()`, call `renderChart()`, call `renderMonthlySummary()`, attach all event listeners (form submit, delete buttons via delegation, add-category button, theme toggle)
  - _Requirements: 8.2, 1.3, 2.3, 3.2, 4.2, 5.2, 7.4_

- [x] 13. Implement responsive CSS
  - In `css/style.css`: define CSS custom properties for light/dark color schemes under `[data-theme="dark"]`; implement mobile-first layout (single column at 320px, two-column or wider at ≥768px); ensure transaction list has `overflow-y: auto` with a `max-height`; ensure all interactive elements meet minimum touch target size (44×44px)
  - _Requirements: 9.1, 7.2_

- [x] 14. Final checkpoint — full integration
  - Ensure the app loads without console errors, all UI sections render correctly from Local Storage on page reload, add/delete transactions update balance, chart, and monthly summary in real time, theme toggle persists across reload, and custom categories survive a page reload
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.3, 2.3, 3.2, 4.2, 5.3, 6.4, 7.4, 8.2_

## Notes

- Tasks marked with `*` are optional and can be skipped — no test framework is configured (NFR-1)
- Each task references specific requirements for traceability
- All rendering functions should be idempotent: safe to call multiple times
- Property tests (if implemented) use fast-check with ≥100 iterations per property
- Chart.js is loaded via CDN; `initChart()` must guard against CDN failure
