const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getMyTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    updateTodoStatus,
    deleteTodo
} = require('../controllers/todoController');

// All routes below require the user to be logged in
router.use(verifyToken);

router.get('/', getMyTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/toggle', toggleTodo);
router.patch('/:id/status', updateTodoStatus);  // New endpoint for drag-and-drop
router.delete('/:id', deleteTodo);

module.exports = router;
