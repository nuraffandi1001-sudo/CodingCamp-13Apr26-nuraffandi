# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, single-page web application that helps users track their daily spending. It provides an input form for logging transactions, a scrollable transaction history, an auto-updating total balance, and a pie chart visualizing spending by category. All data is persisted client-side using the browser's Local Storage API. The app supports custom categories, a monthly summary view, and a dark/light mode toggle. No backend or build tooling is required.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single spending record consisting of an item name, amount, and category.
- **Category**: A label grouping transactions (e.g., Food, Transport, Fun, or a user-defined label).
- **Balance**: The running total of all transaction amounts currently stored.
- **Chart**: The pie chart component that visualizes spending distribution by category.
- **Transaction_List**: The scrollable UI component displaying all stored transactions.
- **Form**: The input form used to create a new transaction.
- **Storage**: The browser's Local Storage API used to persist all data client-side.
- **Monthly_Summary**: A view that aggregates and displays transaction totals grouped by month.
- **Theme**: The visual color scheme of the App, either light or dark mode.

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, and category so that I can log a new spending transaction.

#### Acceptance Criteria

1. THE Form SHALL contain an item name text field, a numeric amount field, and a category selector.
2. THE Form SHALL include "Food", "Transport", and "Fun" as default category options.
3. WHEN the user submits the Form with all fields filled, THE App SHALL add the transaction to the Transaction_List and persist it to Storage.
4. WHEN the user submits the Form with one or more empty fields, THE Form SHALL display a validation error message and SHALL NOT add the transaction.
5. WHEN a transaction is successfully added, THE Form SHALL reset all fields to their default empty state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see a scrollable list of all my transactions so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored transactions, each showing the item name, amount, and category.
2. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
3. WHEN the user deletes a transaction, THE App SHALL remove it from the Transaction_List and from Storage.
4. WHEN Storage contains no transactions, THE Transaction_List SHALL display an empty-state message indicating no transactions have been added.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total balance at the top of the page so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE App SHALL display the total Balance at the top of the page at all times.
2. WHEN a transaction is added, THE App SHALL recalculate and update the Balance display without requiring a page reload.
3. WHEN a transaction is deleted, THE App SHALL recalculate and update the Balance display without requiring a page reload.
4. WHEN Storage contains no transactions, THE App SHALL display a Balance of 0.

---

### Requirement 4: Spending Chart

**User Story:** As a user, I want to see a pie chart of my spending by category so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render as a pie chart displaying the proportion of total spending for each category.
2. WHEN a transaction is added, THE Chart SHALL update automatically to reflect the new spending distribution.
3. WHEN a transaction is deleted, THE Chart SHALL update automatically to reflect the revised spending distribution.
4. WHEN Storage contains no transactions, THE Chart SHALL display an empty or placeholder state.
5. THE App SHALL use Chart.js or an equivalent lightweight charting library to render the Chart.

---

### Requirement 5: Custom Categories

**User Story:** As a user, I want to add my own spending categories so that I can track expenses beyond the default options.

#### Acceptance Criteria

1. THE Form SHALL provide a mechanism for the user to create a new custom category by entering a category name.
2. WHEN a custom category is created, THE App SHALL add it to the category selector and persist it to Storage.
3. WHEN the App loads, THE App SHALL restore all previously saved custom categories from Storage so they remain available across sessions.
4. IF the user attempts to create a custom category with an empty name, THEN THE App SHALL display a validation error and SHALL NOT add the category.
5. IF the user attempts to create a custom category with a name that already exists, THEN THE App SHALL display an error indicating the category already exists and SHALL NOT add a duplicate.

---

### Requirement 6: Monthly Summary View

**User Story:** As a user, I want to view a monthly summary of my spending so that I can understand my financial patterns over time.

#### Acceptance Criteria

1. THE App SHALL provide a Monthly_Summary view that groups transactions by calendar month and year.
2. THE Monthly_Summary SHALL display the total amount spent per category for each month.
3. WHEN the user navigates to the Monthly_Summary, THE App SHALL display data derived from transactions currently in Storage.
4. WHEN a transaction is added or deleted, THE Monthly_Summary SHALL reflect the updated totals the next time it is viewed.
5. WHEN Storage contains no transactions for a given month, THE Monthly_Summary SHALL not display that month.

---

### Requirement 7: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light mode so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a toggle control that switches the Theme between light mode and dark mode.
2. WHEN the user activates the toggle, THE App SHALL apply the selected Theme to all visible UI components immediately without a page reload.
3. WHEN the user sets a Theme preference, THE App SHALL persist the preference to Storage.
4. WHEN the App loads, THE App SHALL restore the previously saved Theme preference from Storage.
5. IF no Theme preference is found in Storage, THEN THE App SHALL default to the light mode Theme.

---

### Requirement 8: Data Persistence

**User Story:** As a user, I want my transactions and settings to be saved automatically so that my data is available when I return to the app.

#### Acceptance Criteria

1. THE App SHALL use the browser's Local Storage API as the sole persistence mechanism for all data.
2. WHEN the App loads, THE App SHALL read all transactions, custom categories, and Theme preference from Storage and restore the UI to the last saved state.
3. THE App SHALL NOT require a backend server, database, or network connection to store or retrieve data.

---

### Requirement 9: Responsive and Accessible UI

**User Story:** As a user, I want the app to work well on my mobile phone and desktop browser so that I can use it anywhere.

#### Acceptance Criteria

1. THE App SHALL render correctly and be fully usable on viewport widths from 320px to 1920px.
2. THE App SHALL be built using a single HTML file, a single CSS file inside a `css/` folder, and a single JavaScript file inside a `js/` folder.
3. THE App SHALL function correctly in the latest stable versions of Chrome, Firefox, Edge, and Safari without requiring installation or build steps.
4. THE App SHALL load and become interactive within 3 seconds on a standard broadband connection.
5. WHILE the App is running, THE App SHALL maintain a responsive UI with no perceptible input lag during normal transaction operations.
