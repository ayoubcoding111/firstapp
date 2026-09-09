const currentAdmin = requireAdmin(); // redirects away if not logged in as admin

if (currentAdmin) {
    document.getElementById('userName').textContent = currentAdmin.name;
}

// Dark mode functionality
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
}

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');

    // Save preference
    if (document.documentElement.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

const userListEl = document.getElementById('userList');
const adminMainEl = document.getElementById('adminMain');
let selectedUserId = null;
let allUsers = [];

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadUsers() {
    try {
        allUsers = await apiRequest('/admin/users');
        renderUserList();
        renderStats();
    } catch (err) {
        userListEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
    }
}

function renderStats() {
    const totalTodos = allUsers.reduce((sum, u) => sum + Number(u.total_todos || 0), 0);
    document.getElementById('statUsers').textContent = allUsers.length;
    document.getElementById('statTodos').textContent = totalTodos;
}

function renderUserList() {
    if (allUsers.length === 0) {
        userListEl.innerHTML = `<div class="empty-state">No registered users yet.</div>`;
        return;
    }

    userListEl.innerHTML = allUsers.map(u => `
        <button class="user-row ${u.id === selectedUserId ? 'active' : ''}" data-id="${u.id}">
            <div>
                <div class="name">${escapeHtml(u.name)}</div>
                <div class="email">${escapeHtml(u.email)}</div>
            </div>
            <span class="count">${u.completed_todos || 0}/${u.total_todos || 0}</span>
        </button>
    `).join('');
}

async function selectUser(id) {
    selectedUserId = Number(id);
    renderUserList();

    adminMainEl.innerHTML = `<div class="no-selection">Loading todos…</div>`;

    try {
        const data = await apiRequest(`/admin/users/${id}/todos`);
        renderUserTodos(data.user, data.todos);
    } catch (err) {
        adminMainEl.innerHTML = `<div class="no-selection">${escapeHtml(err.message)}</div>`;
    }
}

function renderUserTodos(user, todos) {
    const todosHtml = todos.length === 0
        ? `<div class="empty-state">This user hasn't added any todos yet.</div>`
        : todos.map(todo => `
            <div class="todo-item ${todo.status === 'completed' ? 'completed' : ''}">
                <div class="todo-body">
                    <h4>${escapeHtml(todo.title)}</h4>
                    ${todo.description ? `<p>${escapeHtml(todo.description)}</p>` : ''}
                    <div class="todo-meta">Created ${formatDate(todo.created_at)}</div>
                </div>
                <span class="status-pill ${todo.status}">${todo.status}</span>
            </div>
        `).join('');

    adminMainEl.innerHTML = `
        <div class="selected-user-head">
            <div>
                <h2>${escapeHtml(user.name)}'s Todos</h2>
                <p>${escapeHtml(user.email)}</p>
            </div>
        </div>
        <div class="todo-list">${todosHtml}</div>
    `;
}

userListEl.addEventListener('click', (e) => {
    const row = e.target.closest('.user-row');
    if (row) selectUser(row.dataset.id);
});

if (currentAdmin) {
    loadUsers();
}
