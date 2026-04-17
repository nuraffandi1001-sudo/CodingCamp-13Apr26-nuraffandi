'use strict';

// =============================================
// STATE
// =============================================

var AppState = {
  transactions: [],
  categories: ['Food', 'Transport', 'Fun'],
  theme: 'light'
};

// =============================================
// STORAGE
// =============================================

var DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

function saveState() {
  try {
    localStorage.setItem('appState', JSON.stringify(AppState));
  } catch (e) {
    // quota exceeded or unavailable — silently ignore
  }
}

function loadState() {
  var raw;
  try {
    raw = localStorage.getItem('appState');
  } catch (e) {
    var banner = document.createElement('div');
    banner.id = 'storage-warning';
    banner.textContent = 'Warning: Local Storage is unavailable. Data will not be saved.';
    banner.style.cssText = 'background:#f59e0b;color:#000;padding:8px 16px;text-align:center;font-weight:bold;';
    document.body.prepend(banner);
    applyTheme(AppState.theme);
    return;
  }

  if (raw === null) {
    applyTheme(AppState.theme);
    return;
  }

  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    AppState.transactions = [];
    AppState.categories   = DEFAULT_CATEGORIES.slice();
    AppState.theme        = 'light';
    applyTheme(AppState.theme);
    return;
  }

  if (Array.isArray(parsed.transactions)) AppState.transactions = parsed.transactions;
  if (Array.isArray(parsed.categories))   AppState.categories   = parsed.categories;
  if (parsed.theme === 'light' || parsed.theme === 'dark') AppState.theme = parsed.theme;

  applyTheme(AppState.theme);
}

// =============================================
// VALIDATION
// =============================================

function validateTransaction(input) {
  var errors = { name: '', amount: '', category: '' };

  if (typeof input.name !== 'string' || input.name.trim() === '') {
    errors.name = 'Item name is required.';
  }

  var n = Number(input.amount);
  if (input.amount === '' || input.amount === null || input.amount === undefined || isNaN(n)) {
    errors.amount = 'Amount must be a valid number.';
  } else if (n <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  }

  if (typeof input.category !== 'string' || input.category.trim() === '') {
    errors.category = 'Category is required.';
  }

  return errors;
}

function validateCategory(name, existingCategories) {
  if (typeof name !== 'string' || name.trim() === '') {
    return 'Category name is required.';
  }
  var trimmed = name.trim().toLowerCase();
  var exists  = existingCategories.some(function (c) {
    return c.trim().toLowerCase() === trimmed;
  });
  if (exists) return 'Category already exists.';
  return '';
}

// =============================================
// COMPUTATION
// =============================================

function calculateBalance(transactions) {
  return transactions.reduce(function (sum, t) { return sum + t.amount; }, 0);
}

function aggregateByCategory(transactions) {
  return transactions.reduce(function (acc, t) {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
}

function aggregateMonthlySummary(transactions) {
  var raw = transactions.reduce(function (acc, t) {
    var month = t.date.slice(0, 7);
    if (!acc[month]) acc[month] = {};
    acc[month][t.category] = (acc[month][t.category] || 0) + t.amount;
    return acc;
  }, {});

  return Object.keys(raw)
    .sort(function (a, b) { return b.localeCompare(a); })
    .reduce(function (sorted, key) {
      sorted[key] = raw[key];
      return sorted;
    }, {});
}

// =============================================
// RENDERING
// =============================================

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var btn    = document.getElementById('theme-toggle');
  if (!btn) return;
  var iconEl = btn.querySelector('.theme-toggle-icon');
  var textEl = btn.querySelector('.theme-toggle-text');
  if (theme === 'dark') {
    iconEl.textContent = '\u2600\uFE0F';
    textEl.textContent = 'Light Mode';
  } else {
    iconEl.textContent = '\uD83C\uDF19';
    textEl.textContent = 'Dark Mode';
  }
}

function renderCategoryOptions() {
  var select = document.getElementById('input-category');
  while (select.options.length > 1) { select.remove(1); }
  AppState.categories.forEach(function (cat) {
    var opt       = document.createElement('option');
    opt.value     = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function renderAll() {
  renderTransactionList();
  renderBalance();
  renderChart();
  renderMonthlySummary();
}

function renderTransactionList() {
  var list       = document.getElementById('transaction-list');
  var emptyState = document.getElementById('empty-state-list');

  // Remove only transaction items, keep the empty-state element in the DOM
  var items = list.querySelectorAll('.transaction-item');
  for (var i = 0; i < items.length; i++) { list.removeChild(items[i]); }

  if (AppState.transactions.length === 0) {
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';

  // Render newest first
  var reversed = AppState.transactions.slice().reverse();
  reversed.forEach(function (tx) {
    var item = document.createElement('div');
    item.className = 'transaction-item';
    item.setAttribute('role', 'listitem');

    // Info block: name + category
    var info   = document.createElement('div');
    info.className = 'transaction-info';

    var nameEl = document.createElement('span');
    nameEl.className   = 'transaction-name';
    nameEl.textContent = tx.name;

    var meta = document.createElement('span');
    meta.className   = 'transaction-meta';
    meta.textContent = tx.category;

    info.appendChild(nameEl);
    info.appendChild(meta);

    // Amount
    var amountEl = document.createElement('span');
    amountEl.className   = 'transaction-amount';
    amountEl.textContent = formatCurrency(tx.amount);

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.type        = 'button';
    deleteBtn.className   = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete ' + tx.name);
    deleteBtn.dataset.id  = tx.id;

    item.appendChild(info);
    item.appendChild(amountEl);
    item.appendChild(deleteBtn);

    list.appendChild(item);
  });
}

function renderBalance() {
  var total = calculateBalance(AppState.transactions);
  var el    = document.getElementById('balance-amount');
  el.textContent = formatCurrency(total);
}

function renderMonthlySummary() {
  var container  = document.getElementById('monthly-summary');
  var emptyState = document.getElementById('empty-state-summary');

  // Remove old month groups
  var old = container.querySelectorAll('.month-group');
  for (var i = 0; i < old.length; i++) { container.removeChild(old[i]); }

  if (AppState.transactions.length === 0) {
    emptyState.style.display = '';
    return;
  }
  emptyState.style.display = 'none';

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  var summary = aggregateMonthlySummary(AppState.transactions);
  Object.keys(summary).forEach(function (monthKey) {
    var parts   = monthKey.split('-');
    var label   = MONTHS[parseInt(parts[1], 10) - 1] + ' ' + parts[0];

    var group   = document.createElement('div');
    group.className = 'month-group';

    var heading = document.createElement('h3');
    heading.className   = 'month-heading';
    heading.textContent = label;
    group.appendChild(heading);

    Object.keys(summary[monthKey]).forEach(function (cat) {
      var row = document.createElement('div');
      row.className = 'month-category-row';

      var catName  = document.createElement('span');
      catName.textContent = cat;

      var catTotal = document.createElement('span');
      catTotal.textContent = formatCurrency(summary[monthKey][cat]);

      row.appendChild(catName);
      row.appendChild(catTotal);
      group.appendChild(row);
    });

    container.appendChild(group);
  });
}

// =============================================
// CHART
// =============================================

var chart = null;

var CHART_COLORS = [
  '#FF6384','#36A2EB','#FFCE56','#4BC0C0',
  '#9966FF','#FF9F40','#C9CBCF','#E7E9ED'
];

function initChart() {
  var canvas     = document.getElementById('spending-chart');
  var emptyState = document.getElementById('empty-state-chart');

  if (!window.Chart) {
    emptyState.textContent   = 'Chart unavailable: Chart.js could not be loaded.';
    emptyState.style.display = '';
    canvas.style.display     = 'none';
    return;
  }

  chart = new window.Chart(canvas, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: CHART_COLORS }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderChart() {
  var canvas     = document.getElementById('spending-chart');
  var emptyState = document.getElementById('empty-state-chart');

  if (!chart) return;

  var agg  = aggregateByCategory(AppState.transactions);
  var cats = Object.keys(agg);

  if (cats.length === 0) {
    emptyState.style.display = '';
    canvas.style.display     = 'none';
    return;
  }

  emptyState.style.display = 'none';
  canvas.style.display     = '';

  chart.data.labels           = cats;
  chart.data.datasets[0].data = cats.map(function (c) { return agg[c]; });
  chart.update();
}

// =============================================
// HELPERS
// =============================================

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

// =============================================
// EVENT HANDLERS
// =============================================

function handleAddTransaction(event) {
  event.preventDefault();

  var name     = document.getElementById('input-name').value;
  var amount   = document.getElementById('input-amount').value;
  var category = document.getElementById('input-category').value;

  var errors    = validateTransaction({ name: name, amount: parseFloat(amount), category: category });
  var hasErrors = Object.keys(errors).some(function (k) { return errors[k] !== ''; });

  // Clear previous errors
  ['name', 'amount', 'category'].forEach(function (f) {
    document.getElementById('error-' + f).textContent = '';
    document.getElementById('input-' + f).classList.remove('invalid');
  });

  if (hasErrors) {
    if (errors.name)     { document.getElementById('error-name').textContent     = errors.name;     document.getElementById('input-name').classList.add('invalid'); }
    if (errors.amount)   { document.getElementById('error-amount').textContent   = errors.amount;   document.getElementById('input-amount').classList.add('invalid'); }
    if (errors.category) { document.getElementById('error-category').textContent = errors.category; document.getElementById('input-category').classList.add('invalid'); }
    return;
  }

  AppState.transactions.push({
    id:       String(Date.now()),
    name:     name.trim(),
    amount:   parseFloat(amount),
    category: category,
    date:     new Date().toISOString().slice(0, 10)
  });

  saveState();
  event.target.reset();
  renderAll();
}

function handleDeleteTransaction(id) {
  AppState.transactions = AppState.transactions.filter(function (t) { return t.id !== id; });
  saveState();
  renderAll();
}

function handleThemeToggle() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  saveState();
  applyTheme(AppState.theme);
}

function handleAddCategory() {
  var input = document.getElementById('input-custom-category');
  var name  = input.value;
  var error = validateCategory(name, AppState.categories);

  document.getElementById('error-custom-category').textContent = '';
  input.classList.remove('invalid');

  if (error) {
    document.getElementById('error-custom-category').textContent = error;
    input.classList.add('invalid');
    return;
  }

  AppState.categories.push(name.trim());
  saveState();
  renderCategoryOptions();
  input.value = '';
}

// =============================================
// ENTRY POINT
// =============================================

document.addEventListener('DOMContentLoaded', function () {
  loadState();
  renderCategoryOptions();
  renderTransactionList();
  renderBalance();
  initChart();
  renderChart();
  renderMonthlySummary();

  document.getElementById('transaction-form')
    .addEventListener('submit', handleAddTransaction);

  document.getElementById('transaction-list')
    .addEventListener('click', function (e) {
      var id = e.target.dataset.id;
      if (id) handleDeleteTransaction(id);
    });

  document.getElementById('btn-add-category')
    .addEventListener('click', handleAddCategory);

  document.getElementById('theme-toggle')
    .addEventListener('click', handleThemeToggle);
});
