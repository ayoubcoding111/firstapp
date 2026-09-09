// ============================================
// Small helper for talking to our backend API.
// If your backend runs on a different address,
// change API_BASE_URL below.
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(path, { method = 'GET', body = null, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        // response had no JSON body
    }

    if (!response.ok) {
        const message = (data && data.message) ? data.message : 'Something went wrong. Please try again.';
        throw new Error(message);
    }

    return data;
}

// Helpers to read the currently logged-in user from localStorage
function getCurrentUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Guards used at the top of user.html / admin.html to keep pages protected
function requireLogin() {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    if (!token || !user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

function requireAdmin() {
    const user = requireLogin();
    if (user && user.role !== 'admin') {
        window.location.href = 'user.html';
        return null;
    }
    return user;
}
