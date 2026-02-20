# SupportDesk - Support Ticket System

A full-stack support ticket system built with Django, React, and PostgreSQL. Users can register, log in, submit tickets, filter and browse them, and view aggregated statistics.

## Tech Stack

- Backend: Django 4.2 + Django REST Framework
- Frontend: React 18 + Vite
- Database: PostgreSQL 15
- Infrastructure: Docker + Docker Compose

## Features

- User registration and login with token-based authentication
- Submit support tickets with title, description, category, and priority
- Browse all tickets with search and filters
- Filter by category, priority, and status
- Update ticket status from open to in_progress to resolved to closed
- Stats dashboard with priority and category breakdowns
- Admins can see all tickets, regular users see only their own

## Prerequisites

- Docker Desktop installed and running

## Setup and Running

1. Clone the repository

```
git clone https://github.com/anshuu08/support-ticket-system.git
cd support-ticket-system
```

2. Start the application

```
docker-compose up --build
```

3. Wait until you see "Starting server..." in the logs, then open http://localhost:5173

4. To create an admin account, open a second terminal and run

```
docker-compose exec backend python manage.py createsuperuser
```

## Common Commands

Stop the app and wipe the database for a fresh start:
```
docker-compose down -v
```

Run migrations manually:
```
docker-compose exec backend python manage.py makemigrations tickets
docker-compose exec backend python manage.py migrate
```

View logs:
```
docker-compose logs backend
docker-compose logs frontend
```

## API Endpoints

- POST /api/auth/register/ - Create account
- POST /api/auth/login/ - Login and get token
- POST /api/auth/logout/ - Logout
- GET /api/tickets/ - List tickets
- POST /api/tickets/ - Create ticket
- PATCH /api/tickets/{id}/ - Update ticket
- GET /api/tickets/stats/ - Get statistics

Supported query params for listing tickets: search, category, priority, status

## Notes

The app runs on http://localhost:5173 for the frontend and http://localhost:8000 for the backend API. Admin users can see all tickets while regular users only see their own.
