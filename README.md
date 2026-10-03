# 📖 BookBridge

> **A college platform where students can buy, sell, borrow, lend, and exchange second-hand books.**  
> Crafted with a warm, vintage-inspired **"Paper & Ink"** visual theme for an authentic digital campus library experience.

---

## 🏛️ Technology Stack

- **Frontend:** React 18, Vite, JavaScript, React Router 6, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose ODM
- **Styling:** Custom CSS with CSS Custom Properties (Design Tokens)
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Version Control:** Git & GitHub

---

## 🎨 Design Theme: "Paper & Ink"

### Palette Tokens (defined in `client/src/styles/variables.css`):
| Token Name | Hex Code | Description |
| :--- | :--- | :--- |
| **Paper Cream** | `#F5EBDD` | Canvas page background |
| **Warm Ivory** | `#FFF9EF` | Card surfaces, modal dialogs, dropdowns |
| **Ink Black** | `#29251F` | Primary high-contrast text |
| **Deep Brown** | `#5A3825` | Section headers, borders, secondary text |
| **Terracotta** | `#A65335` | Primary CTA buttons, badges, highlights |
| **Muted Taupe** | `#9B8B78` | Subdued labels, placeholders, borders |

### Typography:
- **Headings:** *Playfair Display* (Serif)
- **Body & Literature:** *Lora* (Serif)
- **Interface & Controls:** *Inter* (Clean Sans-Serif)

---

## 📂 Project Architecture

```text
BOOKBRIDGE/
├── .gitignore                      # Shared git ignore (node_modules, .env, dist, etc.)
├── README.md                       # Complete setup & team guide
├── package.json                    # Root scripts to orchestrate client & server
│
├── client/                         # FRONTEND: React + Vite + JavaScript
│   ├── index.html                  # HTML entry point (Playfair Display & Lora Google Fonts)
│   ├── vite.config.js              # Vite dev server + proxy configuration
│   ├── package.json
│   └── src/
│       ├── styles/                 # "Paper & Ink" theme tokens
│       │   ├── variables.css       # Color palette, shadows, spacing tokens
│       │   ├── typography.css      # Font families & heading styles
│       │   └── global.css          # Resets, container, utilities, paper-card
│       ├── components/             # Reusable UI component library
│       │   ├── common/             # Navbar, Footer, Button, Input, Modal, Badge, Loader, EmptyState, ErrorAlert
│       │   └── books/              # Shared BookCard component
│       ├── context/                # AuthContext (user session, JWT storage)
│       ├── layouts/                # MainLayout (sticky Navbar + content + Footer)
│       ├── services/               # API service layer (Axios + auto JWT headers)
│       │   ├── api.js              # Base Axios instance with interceptors
│       │   ├── authService.js      # Register, login, me
│       │   ├── bookService.js      # Book catalog queries
│       │   ├── exchangeService.js  # Borrow & exchange queries
│       │   ├── userService.js      # Profile & shelf queries
│       │   └── adminService.js     # Admin metrics & alerts
│       ├── pages/                  # Dedicated modules for the 5 developers
│       │   ├── home/               # [Dev 1] HomePage, DiscoveryPage
│       │   ├── books/              # [Dev 2] BookListingPage, BookDetailPage, AddBookPage
│       │   ├── exchange/           # [Dev 3] ExchangeHubPage, MyRequestsPage
│       │   ├── dashboard/          # [Dev 4] UserDashboardPage, MyListingsPage
│       │   ├── admin/              # [Dev 5] AdminDashboardPage, NotificationsPage
│       │   ├── auth/               # LoginPage, RegisterPage
│       │   └── NotFoundPage.jsx    # 404 handler
│       ├── routes/                 # AppRoutes.jsx, ProtectedRoute.jsx
│       ├── App.jsx
│       └── main.jsx
│
└── server/                         # BACKEND: Node.js + Express + MongoDB
    ├── package.json
    ├── .env.example                # Template for environment configuration
    └── src/
        ├── config/                 # db.js (Mongoose connection)
        ├── models/                 # Mongoose schemas: User, Book, ExchangeRequest, Notification
        ├── middlewares/            # authMiddleware.js, errorHandler.js
        ├── controllers/            # authController, bookController, exchangeController, userController, adminController, notificationController
        ├── routes/                 # authRoutes, bookRoutes, exchangeRoutes, userRoutes, adminRoutes, notificationRoutes
        ├── utils/                  # generateToken.js
        └── server.js               # Express application entry point
```

---

## 👥 5-Developer Module Allocation

| Module | Name | Assigned Directory (Client) | Assigned Directory (Server) |
| :--- | :--- | :--- | :--- |
| **Module 1** | **Home + Discovery** | `client/src/pages/home/` | Queries `server/src/controllers/bookController.js` |
| **Module 2** | **Book Listing + Details** | `client/src/pages/books/` | `server/src/controllers/bookController.js` & `bookRoutes.js` |
| **Module 3** | **Borrow / Lend / Exchange** | `client/src/pages/exchange/` | `server/src/controllers/exchangeController.js` & `exchangeRoutes.js` |
| **Module 4** | **User Account + Dashboard** | `client/src/pages/dashboard/`| `server/src/controllers/userController.js` & `userRoutes.js` |
| **Module 5** | **Admin + Notifications** | `client/src/pages/admin/` | `server/src/controllers/adminController.js`, `notificationController.js` |

> 💡 **Shared Components Rule:** Reusable components like `<Button>`, `<Input>`, `<Badge>`, `<BookCard>`, `<Modal>`, `<Loader>`, and `<EmptyState>` reside in `client/src/components/`. If you need to tweak a shared component, coordinate with your teammates first!

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas cloud URI.

### 2. Environment Variables Setup
In the `server/` directory, duplicate `.env.example` and name it `.env`:

On Windows PowerShell:
```powershell
Copy-Item server\.env.example server\.env
```

Review `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bookbridge
JWT_SECRET=bookbridge_dev_secret_key_change_in_production_12345
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
You can install dependencies across the root, client, and server in one step:

```powershell
# Using npm.cmd on Windows:
npm.cmd run install:all
```

Or install individually:
```powershell
npm.cmd install
cd server; npm.cmd install; cd ..
cd client; npm.cmd install; cd ..
```

---

## 💻 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the project root:
```powershell
npm.cmd run dev
```

### Option B: Run Individually in Separate Terminals

**Terminal 1 — Backend Server:**
```powershell
cd server
npm.cmd run dev
```
Backend will start on: **`http://localhost:5000`**  
Health Check: **`http://localhost:5000/api/health`**

**Terminal 2 — Frontend Client:**
```powershell
cd client
npm.cmd run dev
```
Frontend will start on: **`http://localhost:5173`**

---

## 🌿 Git & GitHub Workflow for the 5 Developers

To keep our repository clean and conflict-free:

### 1. Branch Strategy
- `main`: Production / Demo branch. Only merges tested, stable code.
- `develop`: Integration branch. All features merge here first.
- Feature branches:
  - `feat/mod1-home-discovery` (Developer 1)
  - `feat/mod2-book-listing` (Developer 2)
  - `feat/mod3-borrow-exchange` (Developer 3)
  - `feat/mod4-user-dashboard` (Developer 4)
  - `feat/mod5-admin-notifications` (Developer 5)

### 2. Starting Your Module
```powershell
git checkout develop
git pull origin develop
git checkout -b feat/mod1-home-discovery
```

### 3. Committing Your Changes
```powershell
git add .
git commit -m "feat(mod1): implement discovery genre carousels"
git push origin feat/mod1-home-discovery
```

### 4. Pull Requests
Open a Pull Request on GitHub targeting `develop`. Request at least one teammate to review before merging.
