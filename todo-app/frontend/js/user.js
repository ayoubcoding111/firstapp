const currentUser = requireLogin(); // redirects to index.html if not logged in

if (currentUser) {
    document.getElementById('userName').textContent = currentUser.name;
}

const listEl = document.getElementById('todoList');
const statusMsg = document.getElementById('statusMsg');

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderTodos(todos) {
    if (todos.length === 0) {
        listEl.innerHTML = `<div class="empty-state">You have no todos yet. Add your first one above.</div>`;
        return;
    }

    listEl.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.status === 'completed' ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" class="todo-check" ${todo.status === 'completed' ? 'checked' : ''}>
            <div class="todo-body">
                <h4>${escapeHtml(todo.title)}</h4>
                ${todo.description ? `<p>${escapeHtml(todo.description)}</p>` : ''}
                <div class="todo-meta">Created ${formatDate(todo.created_at)}</div>
            </div>
            <div class="todo-actions">
                <button class="icon-btn btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

async function loadTodos() {
    try {
        const todos = await apiRequest('/todos');
        renderTodos(todos);
    } catch (err) {
        statusMsg.className = 'form-msg error';
        statusMsg.textContent = err.message;
    }
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    if (!title) return;

    try {
        await apiRequest('/todos', { method: 'POST', body: { title, description } });
        document.getElementById('todoTitle').value = '';
        document.getElementById('todoDescription').value = '';
        statusMsg.className = 'form-msg';
        loadTodos();
    } catch (err) {
        statusMsg.className = 'form-msg error';
        statusMsg.textContent = err.message;
    }
});

// Event delegation for checkbox toggles and delete buttons
listEl.addEventListener('click', async (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.classList.contains('todo-check')) {
        try {
            await apiRequest(`/todos/${id}/toggle`, { method: 'PATCH' });
            loadTodos();
        } catch (err) {
            statusMsg.className = 'form-msg error';
            statusMsg.textContent = err.message;
        }
    }

    if (e.target.classList.contains('btn-delete')) {
        if (!confirm('Delete this todo?')) return;
        try {
            await apiRequest(`/todos/${id}`, { method: 'DELETE' });
            loadTodos();
        } catch (err) {
            statusMsg.className = 'form-msg error';
            statusMsg.textContent = err.message;
        }
    }
});

if (currentUser) {
    loadTodos();
}
