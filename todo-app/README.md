# 📝 Todo App — Admin & User Roles

A simple full-stack Todo List application with **two types of accounts**:

- **Users** — can create, complete, and delete their own personal todos.
- **Admins** — can see every registered user and browse each user's todo list (read-only oversight).

**Tech stack**

- Frontend: plain **HTML, CSS, and JavaScript** (no frameworks, no build step)
- Backend: **Node.js** + **Express**
- Database: **MySQL**
- Auth: email/password login with hashed passwords (bcrypt) and JSON Web Tokens (JWT)

This guide assumes you are a beginner. Follow it top to bottom and you will have the app running locally.

---

## 1. What you need installed first

Install these three things before doing anything else:

| Tool                                                                 | Why you need it                                 | Check if it's installed |
| -------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| [Node.js](https://nodejs.org/) (v18 or newer)                        | Runs the backend server                         | `node -v`               |
| [MySQL](https://dev.mysql.com/downloads/installer/) (v8 recommended) | Stores users and todos                          | `mysql --version`       |
| A code editor like [VS Code](https://code.visualstudio.com/)         | To open/edit the project (optional but helpful) | —                       |

Open a terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux) and run `node -v` and `mysql --version`. If either command says "command not found," install that tool first and come back.

---

## 2. Project structure

```
todo-app/
├── backend/                 ← Node.js + Express + MySQL API
│   ├── config/
│   │   └── db.js            ← MySQL connection settings
│   ├── controllers/         ← the actual logic for each route
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js          ← checks login tokens / admin access
│   ├── routes/               ← maps URLs to controller functions
│   │   ├── authRoutes.js
│   │   ├── todoRoutes.js
│   │   └── adminRoutes.js
│   ├── .env.example         ← template for your secret config
│   ├── schema.sql           ← creates the database + tables
│   ├── package.json
│   └── server.js            ← starts the API server
│
├── frontend/                 ← plain HTML/CSS/JS website
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js           ← shared helper for calling the backend
│   │   ├── auth.js          ← login / signup page logic
│   │   ├── user.js          ← user dashboard logic
│   │   └── admin.js         ← admin dashboard logic
│   ├── index.html           ← login / sign up page
│   ├── user.html            ← normal user's todo dashboard
│   └── admin.html           ← admin's dashboard (view all users)
│
└── README.md                 ← you are here
```

---

## 3. Set up the database (MySQL)

### 3.1 Start MySQL

Make sure your local MySQL server is running.

- **Windows**: open "Services", find MySQL, make sure it's "Running" (or start it from MySQL Workbench / XAMPP).
- **Mac**: `brew services start mysql` (if installed via Homebrew), or start it from System Preferences if you used the installer.
- **Linux**: `sudo service mysql start`

### 3.2 Create the database and tables

The file `backend/schema.sql` contains everything needed: it creates the `todo_app` database, the `users` and `todos` tables, and one ready-to-use admin account.

Run it from your terminal (replace `root` with your MySQL username if different):

```bash
mysql -u root -p < backend/schema.sql
```

You'll be prompted for your MySQL password, then it runs automatically. If you prefer a GUI, open **MySQL Workbench**, connect to your local server, open `backend/schema.sql`, and click the "execute" (lightning bolt) button.

### 3.3 What this gives you

A default **admin account** is created automatically:

```
Email:    admin@todo.com
Password: Admin123!
```

Log in with this account to see the admin dashboard immediately, no extra setup needed.

> **Note:** the app deliberately does not let you sign up as an admin from the website — that keeps random visitors from giving themselves admin access. If you want to create _additional_ admin accounts, see section 7 ("Creating more admin accounts") below.

---

## 4. Set up and run the backend

### 4.1 Install dependencies

Open a terminal, move into the `backend` folder, and install the required packages:

```bash
cd backend
npm install
```

This downloads Express, MySQL driver, JWT, bcrypt, etc. into a `node_modules` folder (this can take a minute).

### 4.2 Configure your environment variables

Copy the example env file:

```bash
# Mac/Linux
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env
```

Open the new `.env` file in your code editor and fill in your real MySQL password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=todo_app

PORT=5000

JWT_SECRET=change_this_to_a_long_random_secret_key
```

- `DB_PASSWORD` — the password you use to log into MySQL locally.
- `JWT_SECRET` — any long, random string of your choosing (used to sign login tokens). Just mash your keyboard for 30+ characters — it doesn't need to be memorable.

### 4.3 Start the server

```bash
npm start
```

If everything is configured correctly, you'll see:

```
✅ Todo App server running on http://localhost:5000
```

Leave this terminal window open — the server needs to keep running while you use the app. Visit `http://localhost:5000` in your browser; you should see a small JSON message confirming the API is alive.

**Common errors here:**
| Error message | Fix |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | Your `DB_PASSWORD` in `.env` is wrong. |
| `ECONNREFUSED` (to MySQL) | MySQL isn't running — go back to step 3.1. |
| `ER_BAD_DB_ERROR: Unknown database 'todo_app'` | You skipped step 3.2 — run `schema.sql` first. |
| `EADDRINUSE: address already in use :::5000` | Something else is using port 5000. Change `PORT` in `.env` to e.g. `5050`, and update `API_BASE_URL` in `frontend/js/api.js` to match. |

---

## 5. Run the frontend

The frontend is just static HTML/CSS/JS files — no build step, no npm install needed. You just need to open it in a browser **while the backend is running**.

### Easiest option: VS Code "Live Server" extension

1. Open the `frontend` folder in VS Code.
2. Install the free "Live Server" extension.
3. Right-click `index.html` → "Open with Live Server".

### Alternative: Python's built-in server

If you have Python installed:

```bash
cd frontend
python3 -m http.server 5500
```

Then visit `http://localhost:5500` in your browser.

### Alternative: just double-click it

You can literally double-click `frontend/index.html` to open it directly in your browser (as a `file://` URL). This works for this app too, since the backend already allows cross-origin requests (CORS is enabled).

> Whichever method you use, make sure the **backend server from step 4.3 is still running** in its own terminal window — the frontend needs it to log in and load/save todos.

---

## 6. Using the app

1. Open the frontend (`index.html`) in your browser.
2. **Log in as the pre-made admin** to explore the admin side:
   - Email: `admin@todo.com`
   - Password: `Admin123!`
   - You'll land on the admin dashboard, with a list of every registered user on the left. Click a user to view their todo list on the right.
3. **Or click "Sign Up"** to create a normal user account:
   - Fill in your name, email, and a password (6+ characters).
   - You'll land on your personal todo dashboard.
   - Add todos with the form at the top, check the checkbox to mark one complete, and click "Delete" to remove one.
4. Log out any time with the "Log out" button — this clears your session and sends you back to the login page.
5. Log back in as the admin to see the todos you just added show up in their user list.

---

## 7. Creating more admin accounts

For security, the public "Sign Up" form only ever creates normal user accounts. To promote someone to admin, run this SQL command (swap in the correct email):

```sql
USE todo_app;
UPDATE users SET role = 'admin' WHERE email = 'someone@example.com';
```

You can run this in MySQL Workbench, or from the terminal:

```bash
mysql -u root -p -e "USE todo_app; UPDATE users SET role='admin' WHERE email='someone@example.com';"
```

---

## 8. How the app works (a quick tour, for learning purposes)

- **Passwords are never stored in plain text.** When you sign up, the backend hashes your password with `bcrypt` before saving it (see `authController.js`). When you log in, it compares the hash — the original password is never stored anywhere.
- **Logging in returns a token (JWT)**, which the frontend saves in the browser's `localStorage`. Every request to a protected route (like "get my todos") includes this token in the `Authorization` header so the backend knows who you are.
- **Roles are checked on the backend, not just the frontend.** Even if someone tampered with the frontend, the `/api/admin/*` routes reject any request that isn't from a logged-in admin (see `middleware/auth.js`'s `isAdmin` function). This is the correct way to do access control — never trust the frontend alone.
- **Each todo belongs to exactly one user** via a `user_id` foreign key in the `todos` table. Normal users can only ever see/edit/delete their own todos. Admins have separate read-only endpoints to view any user's todos.

---

## 9. API reference (for the curious)

All endpoints are prefixed with `http://localhost:5000/api`.

### Auth (public)

| Method | Endpoint         | Body                        | Description                              |
| ------ | ---------------- | --------------------------- | ---------------------------------------- |
| POST   | `/auth/register` | `{ name, email, password }` | Create a new normal user account         |
| POST   | `/auth/login`    | `{ email, password }`       | Log in (works for both users and admins) |

### Todos (requires login token)

| Method | Endpoint            | Body                     | Description                           |
| ------ | ------------------- | ------------------------ | ------------------------------------- |
| GET    | `/todos`            | —                        | Get all of my todos                   |
| POST   | `/todos`            | `{ title, description }` | Create a new todo                     |
| PUT    | `/todos/:id`        | `{ title, description }` | Edit a todo                           |
| PATCH  | `/todos/:id/toggle` | —                        | Flip a todo between pending/completed |
| DELETE | `/todos/:id`        | —                        | Delete a todo                         |

### Admin (requires login token + admin role)

| Method | Endpoint                 | Description                                   |
| ------ | ------------------------ | --------------------------------------------- |
| GET    | `/admin/users`           | List every normal user with their todo counts |
| GET    | `/admin/users/:id/todos` | View one user's full todo list                |
| DELETE | `/admin/users/:id`       | Delete a user account (and their todos)       |
| GET    | `/admin/todos`           | View every todo from every user at once       |

For protected routes, send the token like this:

```
Authorization: Bearer <the_token_you_got_from_login>
```

---

## 10. Troubleshooting

- **"Failed to fetch" errors in the browser console** → the backend server isn't running, or is running on a different port than `frontend/js/api.js` expects. Check `API_BASE_URL` at the top of that file.
- **Blank page / nothing loads** → open your browser's DevTools (F12) → Console tab, and read the error message; it usually points straight at the problem.
- **Changes to `.env` don't seem to apply** → stop the server (Ctrl+C in its terminal) and run `npm start` again; `.env` is only read when the server starts.
- **Still stuck?** Delete the `todo_app` database and re-run `schema.sql` to start fresh:
  ```sql
  DROP DATABASE todo_app;
  ```
  then repeat step 3.2.

---

## 11. Next steps / ideas to extend this project

This project is intentionally kept simple so it's easy to learn from. Some ideas if you want to keep building:

- Add due dates and priority levels to todos.
- Let admins edit or delete any user's todos, not just view them.
- Add pagination to the admin user list for large numbers of users.
- Add "forgot password" email flow.
- Deploy the backend (e.g. Render, Railway) and frontend (e.g. Netlify, Vercel) so it's live on the internet.

Enjoy building! 🎉
