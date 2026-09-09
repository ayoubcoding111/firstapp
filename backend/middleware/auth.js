// Middleware functions that protect our routes.
// "verifyToken" checks that the request has a valid login token.
// "isAdmin" checks that the logged-in user is an admin.

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    // The frontend sends the token in the "Authorization" header
    // in the format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token. Please log in again.' });
        }
        // Attach the decoded user info (id, role, name, email) to the request
        req.user = decoded;
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Admins only.' });
}

module.exports = { verifyToken, isAdmin };
