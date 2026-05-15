/* ============================================================
   Expense & Budget Visualizer — app.js
   Vanilla JavaScript, no frameworks, no build tools.
   ============================================================ */

// ── Constants & State ────────────────────────────────────────

const STORAGE_KEY = 'ebv_transactions';

/** Category metadata: display name → chart color */
const CATEGORIES = {
  Food:      { color: '#FF6384' },
  Transport: { color: '#36A2EB' },
  Fun:       { color: '#FFCE56' },
};

/** In-memory source of truth for all renders */
let transactions = [];

/** Holds the Chart.js Pie instance once created */
let chartInstance = null;

// ── Storage Layer ────────────────────────────────────────────

/**
 * Persist the current transaction array to localStorage.
 * Calls showStorageError on failure (quota exceeded, sandboxed context, etc.)
 * @param {Array} txns
 */
function saveToStorage(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (err) {
    showStorageError('Could not save data: ' + err.message);
  }
}

/**
 * Load transactions from localStorage.
 * Returns [] and shows an error banner if the data is missing, corrupt, or not an array.
 * @returns {Array}
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      showStorageError('Saved data was in an unexpected format and has been reset.');
      return [];
    }
    return parsed;
  } catch (err) {
    showStorageError('Could not load saved data: ' + err.message);
    return [];
  }
}

// ── Validation ───────────────────────────────────────────────

/**
 * Validate all form fields.
 * Populates inline error spans and marks fields as invalid.
 * @returns {boolean} true when all fields are valid
 */
function validate() {
  const nameInput     = document.getElementById('item-name');
  const amountInput   = document.getElementById('item-amount');
  const categoryInput = document.getElementById('item-category');

  const nameError     = document.getElementById('name-error');
  const amountError   = document.getElementById('amount-error');
  const categoryError = document.getElementById('category-error');

  let valid = true;

  // Clear previous errors
  [nameInput, amountInput, categoryInput].forEach(el => el.classList.remove('invalid'));
  [nameError, amountError, categoryError].forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });

  // Item name
  const name = nameInput.value.trim();
  if (name.length === 0) {
    nameError.textContent = 'Item name is required.';
    nameError.classList.add('visible');
    nameInput.classList.add('invalid');
    valid = false;
  } else if (name.length > 100) {
    nameError.textContent = 'Item name must be 100 characters or fewer.';
    nameError.classList.add('visible');
    nameInput.classList.add('invalid');
    valid = false;
  }

  // Amount
  const amountRaw = amountInput.value.trim();
  const amount    = parseFloat(amountRaw);
  if (amountRaw === '' || isNaN(amount)) {
    amountError.textContent = 'Amount is required.';
    amountError.classList.add('visible');
    amountInput.classList.add('invalid');
    valid = false;
  } else if (amount <= 0) {
    amountError.textContent = 'Amount must be greater than 0.';
    amountError.classList.add('visible');
    amountInput.classList.add('invalid');
    valid = false;
  } else if (amount > 999999.99) {
    amountError.textContent = 'Amount must be 999,999.99 or less.';
    amountError.classList.add('visible');
    amountInput.classList.add('invalid');
    valid = false;
  }

  // Category
  const category = categoryInput.value;
  if (!Object.keys(CATEGORIES).includes(category)) {
    categoryError.textContent = 'Please select a category.';
    categoryError.classList.add('visible');
    categoryInput.classList.add('invalid');
    valid = false;
  }

  return valid;
}

// ── Render Functions ─────────────────────────────────────────

/**
 * Format a number as USD currency string.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Update the balance display with the sum of all transaction amounts.
 * @param {Array} txns
 */
function renderBalance(txns) {
  const total = txns.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById('balance').textContent = formatCurrency(total);
}

/**
 * Rebuild the transaction list in the DOM.
 * Displays an empty-state message when there are no transactions.
 * @param {Array} txns
 */
function renderList(txns) {
  const list = document.getElementById('transaction-list');

  if (txns.length === 0) {
    list.innerHTML = '<li class="empty-state">No transactions yet.</li>';
    return;
  }

  // Sort: most recently added first
  const sorted = [...txns].sort((a, b) => b.addedAt - a.addedAt);

  list.innerHTML = sorted.map(txn => `
    <li>
      <span class="txn-name" title="${escapeHtml(txn.name)}">${escapeHtml(txn.name)}</span>
      <span class="txn-amount">${formatCurrency(txn.amount)}</span>
      <span class="badge badge-${txn.category}">${txn.category}</span>
      <button class="delete-btn" data-id="${txn.id}" aria-label="Delete ${escapeHtml(txn.name)}">Delete</button>
    </li>
  `).join('');
}

/**
 * Update (or create) the Chart.js pie chart.
 * Hides the canvas and shows a placeholder when there is no data.
 * @param {Array} txns
 */
function renderChart(txns) {
  const canvas      = document.getElementById('expense-chart');
  const emptyMsg    = document.getElementById('chart-empty');

  // Compute per-category totals, excluding zero-amount categories
  const totals = {};
  Object.keys(CATEGORIES).forEach(cat => { totals[cat] = 0; });
  txns.forEach(t => { totals[t.category] += t.amount; });

  const activeCategories = Object.keys(totals).filter(cat => totals[cat] > 0);

  if (activeCategories.length === 0) {
    canvas.style.display = 'none';
    emptyMsg.style.display = 'block';
    return;
  }

  canvas.style.display = 'block';
  emptyMsg.style.display = 'none';

  const labels = activeCategories;
  const data   = activeCategories.map(cat => totals[cat]);
  const colors = activeCategories.map(cat => CATEGORIES[cat].color);

  if (chartInstance === null) {
    // Create the chart for the first time
    chartInstance = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 13 },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct   = ((value / total) * 100).toFixed(1);
                return ` ${context.label}: ${formatCurrency(value)} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  } else {
    // Update existing chart
    chartInstance.data.labels                        = labels;
    chartInstance.data.datasets[0].data              = data;
    chartInstance.data.datasets[0].backgroundColor   = colors;
    chartInstance.update();
  }
}

/**
 * Re-render all three views (balance, list, chart) from the given transaction array.
 * @param {Array} txns
 */
function renderAll(txns) {
  renderBalance(txns);
  renderList(txns);
  renderChart(txns);
}

// ── Utility ──────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS when inserting user content into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Error Banner ─────────────────────────────────────────────

/**
 * Show the storage-error banner with a given message.
 * The banner can be dismissed by the user.
 * @param {string} msg
 */
function showStorageError(msg) {
  const banner  = document.getElementById('storage-error-banner');
  const msgSpan = document.getElementById('storage-error-msg');
  const dismiss = document.getElementById('storage-error-dismiss');

  msgSpan.textContent = msg;
  banner.removeAttribute('hidden');

  // One-time dismiss handler
  dismiss.addEventListener('click', () => {
    banner.setAttribute('hidden', '');
  }, { once: true });
}

// ── Event Handlers ───────────────────────────────────────────

/**
 * Handle form submission: validate, create transaction, persist, render.
 * @param {Event} e
 */
function handleFormSubmit(e) {
  e.preventDefault();

  if (!validate()) return;

  const nameInput     = document.getElementById('item-name');
  const amountInput   = document.getElementById('item-amount');
  const categoryInput = document.getElementById('item-category');

  const newTransaction = {
    id:       crypto.randomUUID(),
    name:     nameInput.value.trim(),
    amount:   parseFloat(amountInput.value),
    category: categoryInput.value,
    addedAt:  Date.now(),
  };

  transactions.push(newTransaction);
  saveToStorage(transactions);
  renderAll(transactions);

  // Reset form fields to default state
  e.target.reset();
}

/**
 * Handle delete button clicks via event delegation on the transaction list.
 * @param {Event} e
 */
function handleDeleteClick(e) {
  if (!e.target.matches('.delete-btn')) return;

  const id = e.target.dataset.id;
  const index = transactions.findIndex(t => t.id === id);

  // Guard: id not found (stale DOM reference)
  if (index === -1) return;

  transactions.splice(index, 1);
  saveToStorage(transactions);
  renderAll(transactions);
}

// ── Initialisation ───────────────────────────────────────────

/**
 * Bootstrap the application:
 * load persisted data, render all views, attach event listeners.
 */
function init() {
  transactions = loadFromStorage();
  renderAll(transactions);

  document.getElementById('expense-form')
    .addEventListener('submit', handleFormSubmit);

  document.getElementById('transaction-list')
    .addEventListener('click', handleDeleteClick);
}

// Run after the DOM is ready (app.js is loaded with defer)
document.addEventListener('DOMContentLoaded', init);
