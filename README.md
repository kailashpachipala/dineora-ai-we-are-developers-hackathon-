
# Smart Tablekeeper

> AI-powered restaurant reservation, discovery, recommendation, and restaurant intelligence platform.

Smart Tablekeeper enables users to express restaurant reservation requirements using natural language, safely converts those requests into validated structured requirements using LLMs with Pydantic validation, checks table availability, and orchestrates concurrency-safe bookings with waitlist fallbacks.

---

## Architecture Overview

```text
[ Patron / Web Client (React 19 + Tailwind CSS) ]
                        │
                        ▼  HTTP/REST + JSON
┌─────────────────────────────────────────────────────────────┐
│               Backend Layer (Python FastAPI)                │
│  • API v1 Endpoints (/health, /search, /reservations)        │
│  • Pydantic Schema Sanitizer & Untrusted AI Guardrails      │
│  • Services: AI, Availability, Reservation, Waitlist, Recs  │
│  • Repositories & Async SQLAlchemy 2.0 ORM                  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     PostgreSQL 16 Engine      │ │      Redis 7 Ephemeral    │
│  • ACID Transactional Safety  │ │  • Distributed Locks      │
│  • Unique Idempotency Keys    │ │  • Fast Slot Cache        │
│  • Table Overlap Invariants   │ │  • Rate Limiting & Queue  │
└───────────────────────────────┘ └───────────────────────────┘
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide Icons
- **Backend / API**: Python 3.11, FastAPI, Pydantic v2, Uvicorn, asyncpg
- **Database & Persistence**: PostgreSQL 16 (relational ACID, composite slot indices)
- **Caching & Ephemeral Locks**: Redis 7
- **AI Intent Pipeline**: Google Gemini (`gemini-3.8-flash`) with structured schema output
- **Containerization**: Docker, Docker Compose multi-service topology

---

## Repository Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   └── health.py        # System health & dependency check
│   │   │       └── api.py               # v1 Router assembly
│   │   ├── core/
│   │   │   └── config.py                # Pydantic Settings & environment
│   │   ├── db/
│   │   │   ├── base.py                  # DeclarativeBase & TimestampMixin
│   │   │   └── session.py               # Async engine & sessionmaker
│   │   ├── models/                      # 8 SQLAlchemy domain models
│   │   │   ├── user.py                  # User entity
│   │   │   ├── restaurant.py            # Restaurant entity
│   │   │   ├── table.py                 # Table / Resource entity
│   │   │   ├── reservation.py           # Concurrency-safe reservation
│   │   │   ├── waitlist.py              # Waitlist entry
│   │   │   ├── scheduled_booking.py     # Automated booking agent task
│   │   │   ├── feedback.py              # Post-dining review entity
│   │   │   └── insight.py               # Aggregated intelligence model
│   │   ├── schemas/                     # Pydantic validation schemas
│   │   │   ├── health.py
│   │   │   ├── intent.py                # Untrusted AI output sanitizer
│   │   │   ├── restaurant.py
│   │   │   ├── table.py
│   │   │   └── reservation.py
│   │   ├── repositories/                # Data access layer
│   │   ├── services/                    # Business & domain services
│   │   └── main.py                      # FastAPI application entrypoint
│   ├── Dockerfile                       # Multi-stage Python 3.11 image
│   └── requirements.txt                 # FastAPI, SQLAlchemy, asyncpg, etc.
├── src/
│   ├── api/                             # Typed API client
│   ├── components/                      # Modular UI presentation
│   ├── types/                           # Shared TypeScript definitions
│   ├── App.tsx                          # Root application container
│   ├── index.css                        # Tailwind v4 import
│   └── main.tsx                         # React entrypoint
├── docker-compose.yml                   # 4-tier orchestration (web, api, db, redis)
├── Dockerfile                           # Frontend / Node runner image
├── server.ts                            # Full-stack dev & preview gateway
├── .env.example                         # Documented environment variables
└── README.md
```

---

## Quickstart with Docker Compose

To start the entire multi-service stack with one command:

### 1. Copy Environment Configuration
```bash
cp .env.example .env
```

### 2. Launch Services
```bash
docker compose up --build -d
```

### 3. Verify Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### 4. Access Services
- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **PostgreSQL Database**: `localhost:5432` (`smart_tablekeeper`)
- **Redis Cache**: `localhost:6379`

---

## Local Development (Without Docker)

### Backend Setup (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI with live reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (React)

```bash
# In repository root
npm install

# Run dev server on port 3000
npm run dev
```

---

## Initial Domain Models (8 Entities)

1. **User** (`users`): Patrons and reservation contacts.
2. **Restaurant** (`restaurants`): Geolocation, price tier, hours, cuisine, average spend per person.
3. **Table** (`tables`): Floor plan resource, capacity limits (`min_capacity`, `max_capacity`), seating areas (indoor, outdoor, patio, counter, bar).
4. **Reservation** (`reservations`): Concurrency-safe booking, unique `reservation_code`, `idempotency_key`, start/end times, estimated spend (`avg_spend × party_size`).
5. **WaitlistEntry** (`waitlist_entries`): Priority-ordered standby queue with desired time windows.
6. **ScheduledBooking** (`scheduled_bookings`): Asynchronous tasks for automated snipe agents.
7. **Feedback** (`feedbacks`): Verified 1:1 post-dining ratings (food, service, ambiance).
8. **RestaurantInsight** (`restaurant_insights`): Nightly analytics (searches, bookings, cancellations, occupancy rate).

---

## Reliability & AI Safety Rules

1. **Untrusted AI Output**: The LLM *never* writes directly to the database. All extracted parameters pass through Pydantic schema validation and business constraint validation before hitting availability services.
2. **Idempotency**: Every booking request requires a client-generated `idempotency_key` stored with a unique constraint in PostgreSQL to prevent duplicate reservations during network retries.
3. **Budget Formula**: Estimated group spend is calculated as:
   $$\text{Estimated Group Spend} = \text{Average Spend per Person} \times \text{Party Size}$$
   Explicitly communicated as an estimate, not a guaranteed bill.
