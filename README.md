# Collaborative Task Manager

A full-stack Task Management application built with modern JavaScript/TypeScript technologies.

## Tech Stack

### Frontend
- **React** (via Vite) with TypeScript
- **Tailwind CSS** for styling
- **SWR** for data fetching and caching
- **React Hook Form** with Zod validation
- **Socket.io-client** for real-time updates

### Backend
- **Node.js + Express** with TypeScript
- **PostgreSQL** with Prisma ORM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing

### Database Choice: PostgreSQL
PostgreSQL was chosen for its:
- ACID compliance ensuring data integrity
- Strong typing system
- Excellent performance for complex queries
- Rich ecosystem and tooling support
- Better suited for structured task management data

## Architecture Overview

### Backend Architecture
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Data access layer using Prisma
- **DTOs**: Input validation using Zod
- **Middleware**: Authentication, error handling, logging

### Frontend Architecture
- **Components**: Reusable UI components
- **Hooks**: Custom hooks for data fetching and state management
- **Services**: API communication layer
- **Types**: TypeScript interfaces and types

## Real-Time Features
Socket.io integration provides:
- Live task updates across all connected clients
- Instant assignment notifications
- Real-time status and priority changes

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database URL in .env
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup (Bonus)
```bash
docker-compose up -d
```

## API Contract

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks with filtering/sorting
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users (for assignment)
- `PUT /api/users/profile` - Update user profile

## Design Decisions

1. **JWT in HttpOnly Cookies**: Secure token storage preventing XSS attacks
2. **Service Layer Pattern**: Clear separation of business logic from controllers
3. **DTO Validation**: Input validation at API boundaries using Zod
4. **Optimistic Updates**: Immediate UI feedback with SWR mutations
5. **Socket.io Rooms**: Efficient real-time updates using room-based broadcasting

## Trade-offs & Assumptions

1. **Session Management**: JWT tokens expire in 24 hours for security
2. **Real-time Scope**: Limited to task updates and assignments
3. **File Uploads**: Not implemented to focus on core functionality
4. **Pagination**: Implemented for task lists to handle large datasets
5. **Caching**: SWR provides client-side caching with 5-minute stale time

## Testing

Backend unit tests cover:
- Task creation validation
- Authentication middleware
- Socket.io event handling

Run tests:
```bash
cd backend
npm test
```

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway
- **Database**: PostgreSQL on Railway

## Live URLs
- Frontend: [Deploy to Vercel]
- Backend API: [Deploy to Railway]

## Quick Start with Docker

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Start the application:
   ```bash
   docker-compose up -d
   ```
4. Run database migrations:
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```
5. Access the application at http://localhost:5173

## Manual Setup

### Quick Setup (Recommended)
```bash
npm run setup  # Sets up both frontend and backend
npm run dev    # Starts both servers concurrently
```

### Individual Setup
```bash
# Backend Setup
cd backend
npm install
cp .env.example .env
# Configure your PostgreSQL database URL in .env
npx prisma migrate dev
npm run dev

# Frontend Setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Deployment Instructions

### Deploy Frontend to Vercel

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: Your backend API URL (e.g., Railway URL)
4. **Deploy**: Vercel will automatically deploy from the `frontend` directory

### Deploy Backend to Railway

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Configure Service**:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. **Add PostgreSQL Database**: Railway will provide `DATABASE_URL`
4. **Environment Variables**:
   - `JWT_SECRET`: Generate a secure random string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL
5. **Deploy**: Railway will build and deploy your backend