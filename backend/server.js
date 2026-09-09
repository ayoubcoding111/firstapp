const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Allow the frontend (running on a different port/file) to call this API
app.use(cors());
// Let Express understand JSON request bodies
app.use(express.json());

// Simple health check route - visit this in your browser to confirm the
// server is running: http://localhost:5000/
app.get('/', (req, res) => {
    res.json({ message: 'Todo App API is running.' });
});

// Route groups
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});

// Generic error handler (catches anything unexpected)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Todo App server running on http://localhost:${PORT}`);
});
