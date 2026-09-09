// If the user is already logged in, skip the login page entirely
(function redirectIfLoggedIn() {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    if (token && user) {
        window.location.href = user.role === 'admin' ? 'admin.html' : 'user.html';
    }
})();

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

function showTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    document.getElementById('panelLogin').classList.toggle('active', isLogin);
    document.getElementById('panelRegister').classList.toggle('active', !isLogin);
}

function showMsg(el, text, type) {
    el.textContent = text;
    el.className = `form-msg ${type}`;
}

function saveSessionAndRedirect(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'user.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('loginMsg');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            auth: false,
            body: { email, password }
        });
        showMsg(msgEl, 'Login successful. Redirecting…', 'success');
        saveSessionAndRedirect(data);
    } catch (err) {
        showMsg(msgEl, err.message, 'error');
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('registerMsg');
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            auth: false,
            body: { name, email, password }
        });
        showMsg(msgEl, 'Account created. Redirecting…', 'success');
        saveSessionAndRedirect(data);
    } catch (err) {
        showMsg(msgEl, err.message, 'error');
    }
});
