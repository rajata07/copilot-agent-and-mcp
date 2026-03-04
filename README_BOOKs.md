# Book Favorites App — Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [API Reference](#api-reference)
6. [Data Models](#data-models)
7. [Frontend Components](#frontend-components)
8. [State Management](#state-management)
9. [Setup & Installation](#setup--installation)
10. [Running the Application](#running-the-application)
11. [Testing](#testing)
12. [Configuration](#configuration)

---

## Project Overview

**Book Favorites App** is a full-stack web application that lets registered users browse a curated catalog of 50 books and maintain a personal list of favorite titles. The app is built as a demonstration project for GitHub Copilot Agents and MCP training.

---

## Features

- **User Registration & Login** — Create a new account or sign in with existing credentials.
- **Book Catalog** — Browse a curated list of 50 books.
- **Favorites Management** — Add books to a personal favorites list and view them in a dedicated section.
- **Protected Routes** — Book catalog and favorites pages are accessible only to authenticated users.
- **Responsive UI** — Clean, modern interface that works on desktop and mobile.
- **JWT Authentication** — Tokens are issued on login and validated on every protected request.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│           React + Redux Toolkit (Vite)              │
│         http://localhost:5173                       │
└─────────────────────┬───────────────────────────────┘
                      │  HTTP / REST (JSON)
                      ▼
┌─────────────────────────────────────────────────────┐
│              Node.js + Express API                  │
│              http://localhost:4000                  │
│                                                     │
│  POST /api/register   POST /api/login               │
│  GET  /api/books                                    │
│  GET  /api/favorites  POST /api/favorites           │
└─────────────────────┬───────────────────────────────┘
                      │  fs.readFileSync / writeFileSync
                      ▼
┌─────────────────────────────────────────────────────┐
│              JSON File Storage                      │
│   backend/data/books.json                           │
│   backend/data/users.json                           │
└─────────────────────────────────────────────────────┘
```

**Frontend** — React 19, Redux Toolkit, React Router v7, CSS Modules, built with Vite.  
**Backend** — Node.js, Express 5, `jsonwebtoken`, `body-parser`, `cors`.  
**Persistence** — JSON flat files (no database required).  
**Auth** — JWT tokens (1-hour expiry), stored in `localStorage` on the client.

---

## Project Structure

```
copilot-agent-and-mcp/
├── backend/
│   ├── data/
│   │   ├── books.json          # Book catalog (50 books)
│   │   ├── users.json          # Registered users & their favorites
│   │   └── copy-test-data.sh   # Script to reset test data
│   ├── routes/
│   │   ├── index.js            # Mounts auth, books, and favorites routers
│   │   ├── auth.js             # POST /register, POST /login
│   │   ├── books.js            # GET /books
│   │   └── favorites.js        # GET /favorites, POST /favorites
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── books.test.js
│   │   └── favorites.test.js
│   ├── jest.config.js
│   └── server.js               # Express app entry point (port 4000)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookList.jsx    # Book catalog page
│   │   │   ├── Favorites.jsx   # User favorites page
│   │   │   ├── Header.jsx      # Navigation header
│   │   │   ├── Login.jsx       # Login form
│   │   │   ├── Register.jsx    # Registration form
│   │   │   └── Welcome.jsx     # Landing page
│   │   ├── store/
│   │   │   ├── index.js        # Redux store setup
│   │   │   ├── userSlice.js    # Authentication state
│   │   │   ├── booksSlice.js   # Books catalog state
│   │   │   ├── favoritesSlice.js # Favorites state
│   │   │   └── hooks.js        # Typed Redux hooks
│   │   ├── App.jsx             # Routes and layout
│   │   └── main.jsx            # React entry point
│   ├── cypress/                # E2E tests (Cypress)
│   ├── vite.config.js
│   └── package.json
├── demos/                      # Demo exercise guides
├── hands-on/                   # Hands-on exercise guides
├── images/                     # Screenshot assets for docs
├── package.json                # Root scripts
├── cypress.config.js           # Cypress configuration
├── run-e2e.sh                  # E2E test runner script
└── README.md
```

---

## API Reference

All endpoints are prefixed with `/api` and served on **port 4000**.

### Authentication

#### `POST /api/register`

Register a new user account.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Desired username |
| `password` | string | ✅ | Desired password |

**Responses:**

| Status | Body | Description |
|--------|------|-------------|
| `201` | `{ "message": "User registered" }` | User created successfully |
| `400` | `{ "message": "Username and password required" }` | Missing fields |
| `409` | `{ "message": "User already exists" }` | Username already taken |

---

#### `POST /api/login`

Authenticate a user and receive a JWT token.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Registered username |
| `password` | string | ✅ | Account password |

**Responses:**

| Status | Body | Description |
|--------|------|-------------|
| `200` | `{ "token": "<JWT>" }` | Login successful; token expires in 1 hour |
| `401` | `{ "message": "Invalid credentials" }` | Wrong username or password |

---

### Books

> Unlike the Favorites endpoints below, the Books endpoint is **public** — no authentication token is required to browse the catalog.

#### `GET /api/books`

Retrieve the full list of books. No authentication required.

**Response `200`:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction"
  },
  ...
]
```

---

### Favorites

> All favorites endpoints require a valid JWT in the `Authorization` header:
> ```
> Authorization: Bearer <token>
> ```

#### `GET /api/favorites`

Get the authenticated user's favorite books.

**Response `200`:** Array of book objects (same shape as `/api/books`).  
**Response `401`:** Missing token.  
**Response `403`:** Invalid/expired token.  
**Response `404`:** `{ "message": "User not found" }`.

---

#### `POST /api/favorites`

Add a book to the authenticated user's favorites.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookId` | number | ✅ | ID of the book to add |

**Responses:**

| Status | Body | Description |
|--------|------|-------------|
| `200` | `{ "message": "Book added to favorites" }` | Added (or already present) |
| `400` | `{ "message": "Book ID required" }` | Missing `bookId` field |
| `401` | — | Missing token |
| `403` | — | Invalid/expired token |
| `404` | `{ "message": "User not found" }` | User not found |

---

## Data Models

### Book (`backend/data/books.json`)

```json
{
  "id": 1,
  "title": "string",
  "author": "string",
  "genre": "string"
}
```

### User (`backend/data/users.json`)

```json
{
  "username": "string",
  "password": "string",
  "favorites": [1, 5, 12]
}
```

> **Note:** Passwords are stored in plain text in JSON files. This is intentional for demo purposes only and should **not** be used in production.

---

## Frontend Components

| Component | Path | Description |
|-----------|------|-------------|
| `Welcome` | `src/components/Welcome.jsx` | Public landing page with links to login/register |
| `Login` | `src/components/Login.jsx` | Login form; dispatches auth action and stores JWT |
| `Register` | `src/components/Register.jsx` | Registration form |
| `Header` | `src/components/Header.jsx` | Navigation bar; shows user name and logout button when logged in |
| `BookList` | `src/components/BookList.jsx` | Protected page; displays all books with "Add to Favorites" buttons |
| `Favorites` | `src/components/Favorites.jsx` | Protected page; displays the current user's favorite books |

### Routing

| Path | Component | Protected |
|------|-----------|-----------|
| `/` | `Welcome` | No |
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/books` | `BookList` | ✅ Yes |
| `/favorites` | `Favorites` | ✅ Yes |

---

## State Management

The Redux store (`src/store/index.js`) contains three slices:

### `userSlice`
Manages authentication state.

| State field | Type | Description |
|-------------|------|-------------|
| `username` | string \| null | Logged-in username |
| `token` | string \| null | JWT token |
| `isAuthenticated` | boolean | Derived auth flag |

### `booksSlice`
Manages the book catalog fetched from the API.

| State field | Type | Description |
|-------------|------|-------------|
| `items` | Book[] | List of all books |
| `status` | string | `'idle'` \| `'loading'` \| `'succeeded'` \| `'failed'` |

### `favoritesSlice`
Manages the current user's favorites.

| State field | Type | Description |
|-------------|------|-------------|
| `items` | Book[] | User's favorite books |
| `status` | string | `'idle'` \| `'loading'` \| `'succeeded'` \| `'failed'` |

---

## Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd copilot-agent-and-mcp

# Install root (backend) dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Running the Application

### 1. Start the Backend

```bash
npm run start:backend
```

The API server starts at **http://localhost:4000**.

### 2. Start the Frontend

Open a second terminal:

```bash
npm run start:frontend
```

The React app starts at **http://localhost:5173**.

### 3. Use the App

- Open **http://localhost:5173** in your browser.
- Register a new account, or log in with the demo account:
  - **Username:** `sandra`
  - **Password:** `sandra`
- Browse books, add favorites, and explore the app.

---

## Testing

### Backend Unit Tests (Jest + Supertest)

```bash
npm run test:backend
```

Test files are located in `backend/tests/`:

| File | What it tests |
|------|---------------|
| `auth.test.js` | Registration and login endpoints |
| `books.test.js` | Book catalog endpoint |
| `favorites.test.js` | Add/get favorites endpoints |

Tests run against isolated copies of the JSON data files (`test-books.json`, `test-users.json`), which are reset before each run by `backend/data/copy-test-data.sh`.

### Frontend E2E Tests (Cypress)

Requires both the backend and frontend to be running first.

```bash
npm run build:frontend
npm run test:frontend
```

Or to open the Cypress interactive runner:

```bash
cd frontend
npm run cypress:open
```

### Run All Tests

```bash
npm run test
```

---

## Configuration

| Setting | Location | Default | Description |
|---------|----------|---------|-------------|
| Backend port | `backend/server.js` | `4000` | Port the Express server listens on |
| JWT secret | `backend/server.js` | `'your_jwt_secret'` | Secret used to sign/verify JWT tokens |
| JWT expiry | `backend/routes/auth.js` | `'1h'` | Token validity duration |
| Frontend dev port | `frontend/vite.config.js` | `5173` | Port the Vite dev server uses |
| Test mode flag | `backend/server.js` | `TEST_MODE=1` env var | When set, uses `test-*.json` data files |
