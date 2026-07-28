# PostgreSQL Database Setup Guide

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm

## Setup Instructions

### Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crop_capitals;

# Exit psql
\q
```

### Step 2: Configure Environment Variables

The `.env` file is already created with default values:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crop_capitals
NODE_ENV=development
PORT=5000
```

⚠️ **Change the password to match your PostgreSQL installation!**

### Step 3: Initialize Database Tables

```bash
cd backend
npm run init-db
```

This will:

- Create `users` table
- Create `projects` table
- Create `investments` table
- Insert test user: `test@test.com` / `1234`
- Insert sample projects

### Step 4: Start Backend Server

```bash
npm start
```

The backend will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/login` - Login user
- `GET /api/logout` - Logout user
- `GET /api/user` - Get current user

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project details

### Investments

- `POST /api/invest` - Create investment
- `GET /api/investments` - Get user investments
- `GET /api/investments/stats` - Get investment statistics

### Health Check

- `GET /api/health` - Check server status

## Database Schema

### Users Table

```sql
- id (Primary Key)
- email (Unique)
- password
- name
- created_at
- updated_at
```

### Projects Table

```sql
- id (Primary Key)
- name
- goal
- funded
- description
- image
- status
- created_at
- updated_at
```

### Investments Table

```sql
- id (Primary Key)
- user_id (Foreign Key → users)
- project_id (Foreign Key → projects)
- amount
- created_at
```

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

- PostgreSQL is not running
- Update `.env` with correct host/port

### Error: "database "crop_capitals" does not exist"

- Run the CREATE DATABASE command above

### Password authentication failed

- Update `.env` with correct PostgreSQL password

## Features Now Available

✅ **Persistent Data Storage** - All data saved to PostgreSQL
✅ **User Authentication** - Login system with database
✅ **Investment Tracking** - Track investments per user
✅ **Transaction Safety** - Database transactions for investments
✅ **Better Scalability** - Ready for production
