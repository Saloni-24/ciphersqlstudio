#  CipherSQL Studio

> Master SQL through real challenges. Write queries, execute instantly, unlock hints.

CipherSQL Studio is a full-stack SQL learning platform where students solve real database challenges using a live SQL editor. It provides instant query execution, AI-powered Socratic hints, and a clean dark-themed interface built for developers.

---

##  Live Demo

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

##  Features

-  **Live SQL Editor** — Monaco Editor (same as VS Code) with syntax highlighting
-  **Real Query Execution** — Runs against a live PostgreSQL sandbox database
-  **AI Hint System** — Gemini AI gives Socratic hints without revealing answers
-  **Sample Data Viewer** — Shows table schema and preview rows for each challenge
-  **Security Layer** — Only SELECT queries allowed; blocks all destructive commands
-  **Mobile Responsive** — Works on phone and desktop
-  **5 SQL Challenges** — Beginner to Advanced difficulty levels

---

##  Technology Stack

### Frontend
| Technology | Why chosen |
|-----------|------------|
| React 18 | Component-based UI, fast re-renders for live query results |
| React Router 6 | Client-side routing between assignment list and attempt pages |
| Monaco Editor | Professional code editor with SQL syntax highlighting |
| Axios | HTTP client for API calls with clean async/await syntax |
| SCSS | Nested CSS with variables for consistent dark theme |

### Backend
| Technology | Why chosen |
|-----------|------------|
| Node.js + Express | Fast, lightweight REST API server |
| PostgreSQL 17 | Relational database for sandbox query execution — real SQL environment |
| MongoDB Atlas | NoSQL cloud database for storing assignments and attempt history |
| Mongoose | ODM for MongoDB — clean schema definition and validation |
| node-postgres (pg) | PostgreSQL client with connection pooling |
| Helmet | Sets secure HTTP headers automatically |
| express-rate-limit | Prevents API abuse and protects Gemini quota |

### AI Integration
| Technology | Why chosen |
|-----------|------------|
| Google Gemini API | Free tier available, excellent at generating educational Socratic hints |

---

##  Project Structure

```
ciphersqlstudio/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── assignmentController.js   # Fetches assignments + table previews
│   │   │   ├── queryController.js        # Executes SQL queries safely
│   │   │   └── hintController.js         # Calls Gemini API for hints
│   │   ├── db/
│   │   │   ├── postgres.js               # PostgreSQL connection pool
│   │   │   ├── mongodb.js                # MongoDB Atlas connection
│   │   │   └── seed.js                   # Seeds initial data
│   │   ├── middleware/
│   │   │   └── errorHandler.js           # Global error handler
│   │   ├── routes/
│   │   │   ├── assignments.js            # GET /api/assignments
│   │   │   ├── query.js                  # POST /api/query/execute
│   │   │   └── hints.js                  # POST /api/hint
│   │   ├── utils/
│   │   │   └── queryValidator.js         # SQL security validation
│   │   └── server.js                     # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentList/           # Home page — lists all challenges
│   │   │   ├── AssignmentAttempt/        # Challenge page — editor + results
│   │   │   ├── SQLEditor/                # Monaco Editor wrapper
│   │   │   ├── ResultsPanel/             # Displays query results table
│   │   │   ├── DataViewer/               # Shows sample table data
│   │   │   ├── HintPanel/                # AI hint interface
│   │   │   └── Layout/                   # Navbar and page layout
│   │   ├── services/
│   │   │   └── api.js                    # Axios API calls
│   │   ├── hooks/
│   │   │   └── useSessionId.js           # Generates unique session ID
│   │   └── styles/                       # Global SCSS variables and mixins
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

##  Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- [PostgreSQL](https://postgresql.org) v14 or higher
- A [MongoDB Atlas](https://mongodb.com/atlas) account (free M0 cluster)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Saloni-24/ciphersqlstudio.git
cd ciphersqlstudio
```

### Step 2 — Set up PostgreSQL

```bash
psql -U postgres
CREATE DATABASE ciphersql_sandbox;
\q
```

### Step 3 — Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=ciphersql_sandbox
PG_USER=postgres
PG_PASSWORD=your_postgres_password
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:3000
QUERY_TIMEOUT_MS=5000
MAX_RESULT_ROWS=500
```

### Step 4 — Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### Step 5 — Seed the database

```bash
cd backend
npm run seed
```

This creates 4 PostgreSQL tables and seeds 5 MongoDB assignments.

### Step 6 — Run the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Open **http://localhost:3000** in your browser.

---

##  Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Backend server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `PG_HOST` | Yes | PostgreSQL host |
| `PG_PORT` | Yes | PostgreSQL port (default: 5432) |
| `PG_DATABASE` | Yes | PostgreSQL database name |
| `PG_USER` | Yes | PostgreSQL username |
| `PG_PASSWORD` | Yes | PostgreSQL password |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI hints |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS |
| `QUERY_TIMEOUT_MS` | No | Max query execution time in ms (default: 5000) |
| `MAX_RESULT_ROWS` | No | Max rows returned per query (default: 500) |

---

##  Security

- **Query Validation** — Only `SELECT` and `WITH` queries allowed. All write operations blocked.
- **Query Timeout** — PostgreSQL `statement_timeout` set to 5 seconds.
- **Rate Limiting** — Global: 200 req/15 min. Hint endpoint: 5 req/min.
- **Helmet** — Secure HTTP headers set automatically.
- **Environment Variables** — All secrets stored in `.env` (never committed to Git).

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/assignments` | Get all assignments |
| GET | `/api/assignments/:id` | Get single assignment with table previews |
| POST | `/api/query/execute` | Execute a SQL query |
| POST | `/api/hint` | Get an AI hint for current challenge |

---

##  Database Schema

### PostgreSQL (Sandbox)
- **employees** — id, name, dept, salary, hire_date
- **departments** — id, name, head, budget
- **orders** — id, customer, product, amount, order_date
- **students** — id, name, grade, score, enrolled_date

### MongoDB (Persistence)
- **assignments** — title, difficulty, question, tags, tables, expectedColumns
- **attempts** — sessionId, assignmentId, sql, success, rowCount, timestamp

---

##  Author

**Saloni** — Built as a full-stack project submission
- GitHub: [@Saloni-24](https://github.com/Saloni-24)
