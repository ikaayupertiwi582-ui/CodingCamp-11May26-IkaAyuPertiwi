# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses, manage a transaction list, and visualize spending distribution by category. Built with plain HTML, CSS, and Vanilla JavaScript, it requires no backend server and stores all data in the browser's Local Storage. The application provides an input form for adding transactions, a scrollable transaction list with delete capability, a live total balance display, and a pie chart that updates automatically as transactions change.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application
- **Transaction**: A single expense entry consisting of an item name, amount, and category
- **Category**: One of three predefined spending groups — Food, Transport, or Fun
- **Transaction_List**: The scrollable UI component that displays all stored transactions
- **Balance_Display**: The UI element at the top of the page showing the current total of all transaction amounts
- **Chart**: The pie chart component that visualizes spending distribution by category
- **Local_Storage**: The browser's built-in client-side key-value storage API used to persist transaction data
- **Input_Form**: The UI form containing fields for item name, amount, and category, plus a submit button
- **Validator**: The client-side logic that checks all form fields are filled before a transaction is accepted

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to enter expense details through a form, so that I can record my spending quickly and accurately.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field for item name, a numeric field for amount, and a dropdown selector for category (Food, Transport, Fun).
2. THE Input_Form SHALL contain a submit button that triggers transaction creation.
3. WHEN the submit button is clicked, THE Validator SHALL check that the item name field is non-empty (1–100 characters), the amount field contains a positive numeric value greater than 0 and no greater than 1,000,000, and a category has been selected.
4. IF any required field is empty or invalid, THEN THE Validator SHALL prevent form submission, display an inline error message identifying the missing or invalid field, and visually highlight the invalid field (e.g., red border).
5. WHEN all fields are valid and the form is submitted, THE App SHALL create a new Transaction and add it to the Transaction_List.
6. WHEN a Transaction is successfully added, THE Input_Form SHALL reset the item name field to empty, the amount field to empty, and the category dropdown to its default unselected placeholder state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded transactions in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored Transactions in insertion order (oldest first, newest last).
2. WHEN a Transaction is displayed, THE Transaction_List SHALL show the item name, the amount formatted as a currency value (e.g., $12.50), and the category label for that Transaction.
3. THE Transaction_List SHALL be scrollable (overflow-y: auto or scroll) when the number of Transactions exceeds the visible area of the list container.
4. WHEN a Transaction is displayed, THE Transaction_List SHALL show a clearly labeled delete button (e.g., "×" or "Delete") associated with that Transaction row.
5. WHEN a user clicks the delete button for a Transaction, THE App SHALL synchronously remove that Transaction from the in-memory list, re-render the Transaction_List, and write the updated list to Local_Storage before the next user interaction.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total spending at a glance, so that I can understand my overall expense level.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all Transaction amounts held in the in-memory transaction list, formatted as a USD currency value with two decimal places (e.g., "$0.00", "$123.45").
2. WHEN a new Transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the reduced total without requiring a page reload.
4. WHILE no Transactions are stored, THE Balance_Display SHALL show "$0.00".
5. IF a Local_Storage write fails after an add or delete operation, THEN THE App SHALL display a non-blocking error notification to the user indicating that the data could not be saved.

---

### Requirement 4: Spending Distribution Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart where each slice represents a category (Food, Transport, Fun) whose total spending is greater than $0.00; the slice angle SHALL equal (category sum / overall total) × 360°.
2. WHEN a new Transaction is added, THE Chart SHALL update automatically to reflect the new spending distribution without requiring a page reload.
3. WHEN a Transaction is deleted, THE Chart SHALL update automatically to reflect the revised spending distribution without requiring a page reload.
4. WHILE no Transactions are stored (or all category totals are $0.00), THE Chart canvas SHALL be hidden and a visible placeholder message (e.g., "No data to display") SHALL be shown in its place.
5. THE App SHALL use Chart.js (loaded via CDN) to render the pie chart.
6. WHEN the user hovers over a chart slice, THE Chart SHALL display a tooltip showing the category name, the total amount for that category formatted as USD, and the percentage of overall spending.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL synchronously write the updated in-memory Transaction list (serialized as JSON) to Local_Storage before the next user interaction.
2. WHEN a Transaction is deleted, THE App SHALL synchronously write the updated in-memory Transaction list (serialized as JSON) to Local_Storage before the next user interaction.
3. WHEN the App loads, THE App SHALL read the stored JSON from Local_Storage and populate the Transaction_List, Balance_Display, and Chart; IF the stored value is missing, null, or not valid JSON, THEN THE App SHALL discard it and initialize with an empty state.
4. IF Local_Storage contains no data on load, THEN THE App SHALL initialize with an empty Transaction_List, a "$0.00" Balance_Display, and the Chart placeholder message visible.

---

### Requirement 6: Technical Constraints and Project Structure

**User Story:** As a developer, I want the project to follow a clean file structure and use only approved technologies, so that the codebase is simple, maintainable, and runs without a server.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no frontend frameworks (React, Vue, Angular, etc.) and no external JavaScript libraries loaded at runtime except Chart.js via CDN.
2. THE App SHALL contain exactly one CSS file located inside a `css/` directory.
3. THE App SHALL contain exactly one JavaScript file located inside a `js/` directory.
4. THE App SHALL function correctly in the latest stable release of Chrome, Firefox, Edge, and Safari without requiring a backend server and without making any network requests at runtime (except loading Chart.js from CDN on initial page load).
5. WHEN the App is opened on a connection of at least 10 Mbps, THE App SHALL finish loading and become fully interactive within 3 seconds.
