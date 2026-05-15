# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a single-page, client-side expense tracker using plain HTML, CSS, and Vanilla JavaScript across exactly three files: `index.html`, `css/style.css`, and `js/app.js`. Chart.js is loaded via CDN. No build tools, frameworks, or test files are used.

---

## Tasks

- [ ] 1. Create `index.html` — page skeleton and static markup
  - [ ] 1.1 Set up the HTML document shell
    - Create `index.html` at the project root
    - Add `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with charset, viewport meta, and `<title>Expense & Budget Visualizer</title>`
    - Link `css/style.css` via `<link rel="stylesheet">`
    - Add Chart.js CDN `<script>` tag before the closing `</body>`: `https://cdn.jsdelivr.net/npm/chart.js`
    - Add `<script src="js/app.js" defer></script>` after the Chart.js tag
    - _Requirements: Architecture — three-file delivery_

  - [ ] 1.2 Add the balance display section
    - Inside `<main>`, add a `<section id="balance-section">` containing an `<h2>` label and a `<span id="balance">$0.00</span>`
    - _Requirements: Design § Balance Display_

  - [ ] 1.3 Add the input form markup
    - Add `<form id="expense-form">` with:
      - `<input type="text" id="item-name" maxlength="100" placeholder="Item name" required>`  + `<span class="error-msg" id="name-error"></span>`
      - `<input type="number" id="item-amount" min="0.01" max="999999.99" step="0.01" placeholder="Amount" required>` + `<span class="error-msg" id="amount-error"></span>`
      - `<select id="item-category">` with a disabled placeholder option and options for Food, Transport, Fun + `<span class="error-msg" id="category-error"></span>`
      - `<button type="submit" id="add-btn">Add Expense</button>`
    - _Requirements: Design § Input Form_

  - [ ] 1.4 Add the transaction list markup
    - Add `<section id="list-section">` containing a scrollable `<div id="list-container">` wrapping `<ul id="transaction-list"><li class="empty-state">No transactions yet.</li></ul>`
    - _Requirements: Design § Transaction List_

  - [ ] 1.5 Add the chart section markup
    - Add `<section id="chart-section">` containing `<canvas id="expense-chart"></canvas>` and `<p id="chart-empty">No data to display</p>`
    - _Requirements: Design § Pie Chart_

  - [ ] 1.6 Add the storage-error banner markup
    - Add a `<div id="storage-error-banner" hidden>` with a message `<span>` and a dismiss `<button>` inside `<body>` (above `<main>`)
    - _Requirements: Design § Error Handling — LocalStorage Unavailable_

- [ ] 2. Create `css/style.css` — layout and visual styling
  - [ ] 2.1 Apply CSS reset and base typography
    - Create `css/style.css`
    - Add `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
    - Set `body` font to a system font stack, background color, and comfortable line-height
    - _Requirements: Design § Overview — targets Chrome 90+, Firefox 88+, Edge 90+, Safari 14+_

  - [ ] 2.2 Style the page layout and balance section
    - Center `<main>` with `max-width`, horizontal `auto` margins, and vertical padding
    - Style `#balance-section` with a prominent font size and contrasting color for `#balance`
    - _Requirements: Design § Balance Display_

  - [ ] 2.3 Style the input form
    - Style `#expense-form` as a flex column (or grid) with consistent spacing between fields
    - Style `input`, `select`, and `button` elements for usability (padding, border, border-radius)
    - Style `.error-msg` in red with small font size; hidden by default (`display: none`), shown when non-empty
    - Style `#add-btn` with a distinct background color and hover/focus states
    - _Requirements: Design § Input Form_

  - [ ] 2.4 Style the transaction list
    - Style `#list-container` with a fixed `max-height` and `overflow-y: auto`
    - Style `#transaction-list li` with flex layout: name on the left, amount + category badge + delete button on the right
    - Style the category badge (`.badge`) with a small pill shape and category-specific background colors matching `CATEGORIES` in the design
    - Style the delete button as a small icon-style button with a hover state
    - Style `.empty-state` with muted color and centered text
    - _Requirements: Design § Transaction List_

  - [ ] 2.5 Style the chart section
    - Constrain `#expense-chart` canvas to a readable size (e.g. `max-width: 400px`, centered)
    - Style `#chart-empty` with muted color, centered, hidden by default
    - _Requirements: Design § Pie Chart_

  - [ ] 2.6 Style the storage-error banner
    - Style `#storage-error-banner` as a full-width top banner with a warning background color, flex layout, and a visible dismiss button
    - _Requirements: Design § Error Handling — LocalStorage Unavailable_

  - [ ] 2.7 Add responsive styles
    - Add a `@media (max-width: 600px)` block that stacks the form fields vertically, reduces padding, and ensures no horizontal overflow
    - _Requirements: Design § Overview — targets mobile viewports_

- [ ] 3. Create `js/app.js` — data model and storage layer
  - [ ] 3.1 Define constants and in-memory state
    - Create `js/app.js`
    - Declare `const CATEGORIES` object with `Food`, `Transport`, `Fun` keys and their hex color values as shown in the design
    - Declare `const STORAGE_KEY = "ebv_transactions"`
    - Declare `let transactions = []` as the in-memory source of truth
    - Declare `let chartInstance = null`
    - _Requirements: Design § Data Models — Category Metadata, In-Memory State_

  - [ ] 3.2 Implement `saveToStorage(txns)` and `loadFromStorage()`
    - `saveToStorage`: `JSON.stringify` the array and call `localStorage.setItem(STORAGE_KEY, ...)` inside a `try/catch`; on error call `showStorageError`
    - `loadFromStorage`: `localStorage.getItem` + `JSON.parse` inside a `try/catch`; validate result is an array; return `[]` and call `showStorageError` on any failure
    - _Requirements: Design § Controller Functions, LocalStorage Schema, Property 8_

- [ ] 4. Implement form validation in `js/app.js`
  - [ ] 4.1 Implement `validate()` — field validation logic
    - Read trimmed values from `#item-name`, `#item-amount`, and `#item-category`
    - Check name: non-empty after trim, length ≤ 100; populate `#name-error` span and set `display: block` on failure
    - Check amount: numeric, > 0, ≤ 999,999.99; populate `#amount-error` span on failure
    - Check category: value must be one of `["Food", "Transport", "Fun"]`; populate `#category-error` span on failure
    - Return `true` only when all three checks pass; clear all error spans on a clean pass
    - _Requirements: Design § Input Form — Validation rules, Property 1_

- [ ] 5. Implement render functions in `js/app.js`
  - [ ] 5.1 Implement `renderBalance(txns)`
    - Sum all `amount` values in `txns`
    - Format the total with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
    - Set `document.getElementById('balance').textContent` to the formatted string
    - _Requirements: Design § Balance Display, Property 5_

  - [ ] 5.2 Implement `renderList(txns)`
    - Sort a copy of `txns` by `addedAt` descending (most recent first)
    - If the sorted array is empty, set `#transaction-list` innerHTML to `<li class="empty-state">No transactions yet.</li>` and return
    - Otherwise build an `<li>` string for each transaction containing: name, formatted amount, a `<span class="badge">` with the category name, and a `<button class="delete-btn" data-id="${txn.id}">Delete</button>`
    - Set `#transaction-list` innerHTML to the joined string
    - _Requirements: Design § Transaction List, Property 3, Property 4_

  - [ ] 5.3 Implement `renderChart(txns)`
    - Compute per-category totals by reducing `txns`; exclude categories with a total of 0
    - If no categories have a positive total: hide `#expense-chart` (`display: none`), show `#chart-empty` (`display: block`), and return
    - Otherwise show `#expense-chart`, hide `#chart-empty`
    - If `chartInstance` is `null`, create a new `Chart` instance on `#expense-chart` with type `'pie'`; store it in `chartInstance`
    - If `chartInstance` already exists, update `chartInstance.data.labels`, `chartInstance.data.datasets[0].data`, and `chartInstance.data.datasets[0].backgroundColor` then call `chartInstance.update()`
    - Use `CATEGORIES[name].color` for each slice color
    - _Requirements: Design § Pie Chart, Property 6, Property 7_

  - [ ] 5.4 Implement `renderAll(txns)`
    - Call `renderBalance(txns)`, `renderList(txns)`, `renderChart(txns)` in sequence
    - _Requirements: Design § Controller Functions_

- [ ] 6. Implement controller functions and event wiring in `js/app.js`
  - [ ] 6.1 Implement `handleFormSubmit(e)`
    - Call `e.preventDefault()`
    - Call `validate()`; if it returns `false`, return early (no transaction created)
    - Build a new `Transaction` object: `id` via `crypto.randomUUID()`, `name` from trimmed `#item-name`, `amount` as `parseFloat(#item-amount.value)`, `category` from `#item-category`, `addedAt` as `Date.now()`
    - Push the new transaction to `transactions`
    - Call `saveToStorage(transactions)`
    - Call `renderAll(transactions)`
    - Call `form.reset()` to clear all fields
    - _Requirements: Design § Input Form, Property 1, Property 2_

  - [ ] 6.2 Implement `handleDeleteClick(e)`
    - Check `e.target.matches('.delete-btn')`; if not, return
    - Read `const id = e.target.dataset.id`
    - Filter `transactions` to remove the entry with matching `id`; if no match found, return silently
    - Call `saveToStorage(transactions)`
    - Call `renderAll(transactions)`
    - _Requirements: Design § Transaction List, Property 4_

  - [ ] 6.3 Implement `showStorageError(msg)` and its dismiss handler
    - Set the message `<span>` text inside `#storage-error-banner` to `msg`
    - Remove the `hidden` attribute from `#storage-error-banner`
    - Attach a one-time click listener to the dismiss button that re-adds `hidden`
    - _Requirements: Design § Error Handling — LocalStorage Unavailable_

  - [ ] 6.4 Implement `init()` and attach all event listeners
    - Define `init()`: call `loadFromStorage()`, assign result to `transactions`, call `renderAll(transactions)`
    - Attach `handleFormSubmit` to `#expense-form` `submit` event
    - Attach `handleDeleteClick` to `#transaction-list` via event delegation on `click`
    - Call `init()` inside a `DOMContentLoaded` listener (or at the bottom of the script since `app.js` uses `defer`)
    - _Requirements: Design § Controller Functions_

- [ ] 7. Final checkpoint — verify the complete application works end-to-end
  - Open `index.html` directly in a browser (no server needed)
  - Confirm: adding a valid expense updates the balance, list, and chart
  - Confirm: invalid inputs show inline error messages and do not add a transaction
  - Confirm: deleting a transaction updates all three views
  - Confirm: reloading the page restores all transactions from `localStorage`
  - Confirm: no horizontal overflow at narrow viewport widths
  - Ask the user if any adjustments are needed before considering the feature complete.

---

## Notes

- All three files must be created from scratch — there is no existing codebase to extend.
- Chart.js is loaded exclusively via CDN; no npm install or bundler is involved.
- `crypto.randomUUID()` is available in all target browsers (Chrome 92+, Firefox 95+, Edge 92+, Safari 15.4+); no polyfill needed.
- The `defer` attribute on `<script src="js/app.js">` ensures the DOM is ready before `app.js` runs, so no extra `DOMContentLoaded` wrapper is strictly required — but wrapping `init()` in one is harmless and defensive.
- All styling lives exclusively in `css/style.css`; no inline styles in HTML or JS.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "3.2"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 4, "tasks": ["5.4"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4"] }
  ]
}
```
