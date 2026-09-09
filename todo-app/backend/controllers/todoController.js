const db = require('../config/db');

// GET /api/todos - get all todos belonging to the logged-in user
async function getMyTodos(req, res) {
    try {
        const [todos] = await db.query(
            'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(todos);
    } catch (err) {
        console.error('Get todos error:', err);
        res.status(500).json({ message: 'Server error while fetching todos.' });
    }
}

// POST /api/todos - create a new todo for the logged-in user
async function createTodo(req, res) {
    try {
        const { title, description } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required.' });
        }

        const [result] = await db.query(
            'INSERT INTO todos (user_id, title, description, status) VALUES (?, ?, ?, ?)',
            [req.user.id, title.trim(), description || '', 'pending']
        );

        const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create todo error:', err);
        res.status(500).json({ message: 'Server error while creating todo.' });
    }
}

// PUT /api/todos/:id - update a todo's title/description (only if it belongs to the logged-in user)
async function updateTodo(req, res) {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const [existing] = await db.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }

        await db.query(
            'UPDATE todos SET title = ?, description = ? WHERE id = ?',
            [title || existing[0].title, description !== undefined ? description : existing[0].description, id]
        );

        const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Update todo error:', err);
        res.status(500).json({ message: 'Server error while updating todo.' });
    }
}

// PATCH /api/todos/:id/toggle - flip a todo between pending/completed
async function toggleTodo(req, res) {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }

        const newStatus = existing[0].status === 'pending' ? 'completed' : 'pending';
        await db.query('UPDATE todos SET status = ? WHERE id = ?', [newStatus, id]);

        const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Toggle todo error:', err);
        res.status(500).json({ message: 'Server error while updating todo status.' });
    }
}

// DELETE /api/todos/:id - delete a todo (only if it belongs to the logged-in user)
async function deleteTodo(req, res) {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }

        await db.query('DELETE FROM todos WHERE id = ?', [id]);
        res.json({ message: 'Todo deleted successfully.' });
    } catch (err) {
        console.error('Delete todo error:', err);
        res.status(500).json({ message: 'Server error while deleting todo.' });
    }
}

module.exports = { getMyTodos, createTodo, updateTodo, toggleTodo, deleteTodo };
