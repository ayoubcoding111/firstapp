const currentUser = requireLogin(); // redirects to index.html if not logged in

if (currentUser) {
    document.getElementById('userName').textContent = currentUser.name;
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

const statusMsg = document.getElementById('statusMsg');
let allTodos = [];

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Render all Kanban columns
function renderKanbanBoard(todos) {
    allTodos = todos;
    const statuses = ['pending', 'in_progress', 'suspended', 'finished'];

    // Group todos by status
    const grouped = {
        pending: [],
        in_progress: [],
        suspended: [],
        finished: []
    };

    todos.forEach(todo => {
        // Handle legacy status 'completed' -> 'finished'
        const status = todo.status === 'completed' ? 'finished' : (todo.status || 'pending');
        if (grouped[status]) {
            grouped[status].push(todo);
        } else {
            grouped.pending.push(todo);
        }
    });

    // Render each column
    statuses.forEach(status => {
        const columnEl = document.getElementById(`cards-${status}`);
        const countEl = document.getElementById(`count-${status}`);
        const statusTodos = grouped[status];

        countEl.textContent = statusTodos.length;

        if (statusTodos.length === 0) {
            columnEl.innerHTML = `<div class="kanban-empty">No tasks in this list</div>`;
        } else {
            columnEl.innerHTML = statusTodos.map(todo => `
                <div class="kanban-card" draggable="true" data-id="${todo.id}">
                    <h4 class="kanban-card-title">${escapeHtml(todo.title)}</h4>
                    ${todo.description ? `<p class="kanban-card-description">${escapeHtml(todo.description)}</p>` : ''}
                    <div class="kanban-card-footer">
                        <span class="kanban-card-meta">${formatDate(todo.created_at)}</span>
                        <div class="kanban-card-actions">
                            <button class="icon-btn btn-delete" data-id="${todo.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    });

    setupDragAndDrop();
}

// Setup HTML5 Drag and Drop
function setupDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-column');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    const todoId = e.dataTransfer.getData('text/plain');
    const newStatus = this.dataset.status;

    if (!todoId || !newStatus) return;

    try {
        // Optimistic UI update
        const todoIndex = allTodos.findIndex(t => t.id == todoId);
        if (todoIndex !== -1) {
            allTodos[todoIndex].status = newStatus;
            renderKanbanBoard(allTodos);
        }

        // Send API request to update status
        await apiRequest(`/todos/${todoId}/status`, {
            method: 'PATCH',
            body: { status: newStatus }
        });

        statusMsg.className = 'form-msg';
    } catch (err) {
        statusMsg.className = 'form-msg error';
        statusMsg.textContent = err.message || 'Failed to update task status';
        // Revert on error
        loadTodos();
    }
}

// Load todos from API
async function loadTodos() {
    try {
        const todos = await apiRequest('/todos');
        renderKanbanBoard(todos);
    } catch (err) {
        statusMsg.className = 'form-msg error';
        statusMsg.textContent = err.message;
    }
}

// Add new todo
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    if (!title) return;

    try {
        await apiRequest('/todos', {
            method: 'POST',
            body: { title, description }
        });
        document.getElementById('todoTitle').value = '';
        document.getElementById('todoDescription').value = '';
        statusMsg.className = 'form-msg';
        loadTodos();
    } catch (err) {
        statusMsg.className = 'form-msg error';
        statusMsg.textContent = err.message;
    }
});

// Event delegation for delete buttons
document.getElementById('kanbanBoard').addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        if (!confirm('Delete this task?')) return;

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
