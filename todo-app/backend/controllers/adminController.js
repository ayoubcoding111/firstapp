const db = require('../config/db');

// GET /api/admin/users - list every normal user, with a count of their todos
async function getAllUsers(req, res) {
    try {
        const [users] = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.created_at,
                    COUNT(t.id) AS total_todos,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_todos
             FROM users u
             LEFT JOIN todos t ON t.user_id = u.id
             WHERE u.role = 'user'
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        res.json(users);
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
}

// GET /api/admin/users/:id/todos - view a specific user's full todo list
async function getUserTodos(req, res) {
    try {
        const { id } = req.params;

        const [userRows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const [todos] = await db.query(
            'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
            [id]
        );

        res.json({ user: userRows[0], todos });
    } catch (err) {
        console.error('Get user todos error:', err);
        res.status(500).json({ message: 'Server error while fetching user todos.' });
    }
}

// DELETE /api/admin/users/:id - remove a user account (and their todos, via cascade)
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (userRows[0].role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete an admin account.' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error while deleting user.' });
    }
}

// GET /api/admin/todos - view every todo from every user at once
async function getAllTodos(req, res) {
    try {
        const [todos] = await db.query(
            `SELECT t.*, u.name AS user_name, u.email AS user_email
             FROM todos t
             JOIN users u ON u.id = t.user_id
             ORDER BY t.created_at DESC`
        );
        res.json(todos);
    } catch (err) {
        console.error('Get all todos error:', err);
        res.status(500).json({ message: 'Server error while fetching all todos.' });
    }
}

module.exports = { getAllUsers, getUserTodos, deleteUser, getAllTodos };
