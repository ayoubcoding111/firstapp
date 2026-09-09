const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getAllUsers, getUserTodos, deleteUser, getAllTodos } = require('../controllers/adminController');

// All routes below require the user to be logged in AND be an admin
router.use(verifyToken, isAdmin);

router.get('/users', getAllUsers);
router.get('/users/:id/todos', getUserTodos);
router.delete('/users/:id', deleteUser);
router.get('/todos', getAllTodos);

module.exports = router;
