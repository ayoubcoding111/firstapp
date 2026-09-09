const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getMyTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo
} = require('../controllers/todoController');

// All routes below require the user to be logged in
router.use(verifyToken);

router.get('/', getMyTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/toggle', toggleTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
