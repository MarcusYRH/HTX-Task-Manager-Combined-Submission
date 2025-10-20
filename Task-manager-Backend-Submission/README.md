# Task Manager Backend API

A RESTful API backend for task management built with Node.js, Express, TypeORM, and PostgreSQL. Features AI-powered skill prediction using Google Gemini with Retrieval-Augmented Generation (RAG).

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [LLM-Powered Skill Prediction](#llm-powered-skill-prediction)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

---

## Overview

This backend implements the **HTX Software Engineering Take-Home Test** requirements, providing a comprehensive task management system with the following capabilities:

- **Task Management**: Create, read, and update tasks with automatic or manual skill assignment
- **Developer Assignment**: Match developers to tasks based on their skills
- **Hierarchical Tasks**: Support parent-child task relationships with unlimited nesting
- **AI Skill Prediction**: Automatically determine required skills using LLM with historical context
- **Data Validation**: Enforce business rules and maintain data integrity

---

## Key Features

### 1. AI-Powered Skill Prediction with RAG
- **Automatic skill detection** from task titles using Google Gemini LLM
- **Retrieval-Augmented Generation (RAG)** leveraging PostgreSQL trigram similarity search
- **Context-aware predictions** using similar historical tasks as examples
- **Dual-phase verification** for improved accuracy
- **Fallback mechanism** ensuring system reliability
- NOTE: Why no LLM-powered keyword-based matching alongside this? I tried this out previously, but found that keyword based matching did not provide as much benefit as opposed to just using the LLM with RAG. The Gemini 2.0 LLM was able to pick up on patterns and context that simple keyword matching could not, leading to better overall predictions.

### 2. Subtask Support
- **Parent-child task relationships** for task organization
- **Business rule enforcement**: Parent tasks require all subtasks complete before marking "Done"
- **Subtask tracking** with count display for better task management

### 3. Skill-Based Developer Assignment
- **Validation logic** ensuring developers only receive tasks matching their expertise
- **Many-to-many relationships** between developers/skills and tasks/skills
- **Flexible assignment/unassignment** with comprehensive validation

### 4. Production-Ready Architecture
- **Layered architecture** following Controller → Service → Repository pattern
- **Custom exception hierarchy** with proper HTTP status code mapping
- **Swagger/OpenAPI documentation** for interactive API exploration
- **Security features**: Helmet.js, CORS, rate limiting
- **Docker support** with multi-stage builds and health checks

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18 (Alpine) |
| **Framework** | Express.js 4.18 |
| **Language** | TypeScript 5.9 |
| **Database** | PostgreSQL 15 with `pg_trgm`, `uuid-ossp` extensions |
| **ORM** | TypeORM 0.3.27 |
| **AI/LLM** | Google Gemini API (`gemini-2.0-flash-exp`) |
| **API Docs** | Swagger UI + OpenAPI 3.0.3 |
| **Security** | Helmet.js, CORS, Express Rate Limit |
| **Containerization** | Docker + Docker Compose |
| **Validation** | class-validator, class-transformer |

---
### Running Locally

#### Option 1: With Local PostgreSQL

1. **Ensure PostgreSQL is running** and create the database:
```sql
CREATE DATABASE task_assignment;
\c task_assignment
CREATE EXTENSION pg_trgm;
CREATE EXTENSION "uuid-ossp";
```

2. **Run schema and seed scripts**:
```bash
psql -U root -d task_assignment -f 0-db/01-schema.sql
psql -U root -d task_assignment -f 0-db/02-seed.sql
```

---

## API Documentation

### Interactive Swagger UI
Visit `http://localhost:5000/api-docs` for complete interactive API documentation.

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tasks` | Create task (auto-predicts skills if not provided) |
| `GET` | `/api/tasks` | Get paginated tasks with filters |
| `GET` | `/api/tasks/:id` | Get task by ID with details |
| `PUT` | `/api/tasks/:id` | Update task (assign developer or change status) |
| `GET` | `/api/developers` | Get all developers with their skills |
| `GET` | `/api/developers/:id` | Get developer by ID with assigned tasks |
| `GET` | `/api/skills` | Get all available skills |
| `GET` | `/api/skills/:id` | Get skill by ID with developers |

### Example: Create Task with Auto-Prediction

**Request:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build user authentication with OAuth"
  }'
```

**Response:**
```json
{
  "id": 50,
  "title": "Build user authentication with OAuth",
  "status": "To-do",
  "skills": [
    { "id": 2, "name": "Backend" }
  ],
  "developer": null,
  "parentTask": null,
  "subtasks": [],
  "createdAt": "2024-10-19T10:30:00Z",
  "updatedAt": "2024-10-19T10:30:00Z"
}
```

The system automatically predicted "Backend" skill based on the task title and historical data.

---

## LLM-Powered Skill Prediction

### Implementation Overview

The system uses a RAG (Retrieval-Augmented Generation) approach to predict required skills when tasks are created without explicit skill assignment.

#### 1. **Similarity Search (Retrieval Phase)**

Uses PostgreSQL's `pg_trgm` extension for fuzzy text matching:

```sql
SELECT * FROM task
WHERE similarity(title, :newTitle) > 0.2
  OR word_similarity(:newTitle, title) > 0.3
ORDER BY GREATEST(similarity(title, :newTitle), word_similarity(:newTitle, title)) DESC
LIMIT 5;
```

This finds up to 5 similar historical tasks from the database. The trigram GIN index enables fast fuzzy matching (~15-20ms).

#### 2. **LLM Prediction with Context (Generation Phase)**

Constructs a prompt containing:
- The new task title
- List of available skills (e.g., Frontend, Backend)
- Similar historical tasks with their assigned skills
- Skill frequency patterns from historical data

**Example Prompt:**
```
Task: "Implement OAuth authentication service"

Available skills: Frontend, Backend

Similar tasks from our database:
1. "Implement user authentication with JWT" → Skills: [Backend]
2. "Implement OAuth 2.0 authentication flow" → Skills: [Backend]
3. "Implement two-factor authentication" → Skills: [Backend]

Pattern analysis: 100% needed Backend

Analyze this task and predict required skills based on the patterns above...
```

The LLM returns structured JSON with predicted skills, confidence scores, and reasoning.

#### 3. **Verification Phase**

A second LLM call reviews the initial prediction against historical patterns to validate accuracy and catch edge cases.

#### 4. **Fallback Mechanism**

If the LLM is unavailable or returns no valid results, the system falls back to keyword-based matching:
- **Frontend keywords**: `ui`, `page`, `component`, `responsive`, `css`, `react`
- **Backend keywords**: `api`, `database`, `server`, `auth`, `security`

### Why RAG?

| Benefit | Description |
|---------|-------------|
| **Domain-Specific** | Learns from actual project tasks, not generic training data |
| **No Training Required** | Uses existing database as knowledge base |
| **Fast** | Trigram GIN index keeps similarity queries under 20ms |
| **Accurate** | Historical context improves prediction quality |
| **Transparent** | Can inspect which similar tasks influenced predictions |
| **Resilient** | Multiple fallback layers ensure reliability |

### Performance Characteristics

- **Similarity Search**: ~15-20ms (with GIN index on 45+ tasks)
- **LLM Initial Prediction**: ~800-1200ms
- **LLM Verification**: ~600-1000ms
- **Total End-to-End**: ~1.5-2.5 seconds
- **Fallback (keyword-based)**: <50ms

---

## Database Schema

### Core Tables

**task** - Stores task information
```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'To-do' CHECK (status IN ('To-do', 'In Progress', 'Done')),
    developer_id INTEGER REFERENCES developer(id) ON DELETE SET NULL,
    parent_task_id INTEGER REFERENCES task(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**developer** - Stores developer information
```sql
CREATE TABLE developer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**skill** - Stores available skills
```sql
CREATE TABLE skill (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Junction Tables (Many-to-Many)

**developer_skills** - Links developers to their skills
```sql
CREATE TABLE developer_skills (
    developer_id INTEGER NOT NULL REFERENCES developer(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
    PRIMARY KEY (developer_id, skill_id)
);
```

**task_skills** - Links tasks to required skills
```sql
CREATE TABLE task_skills (
    task_id INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, skill_id)
);
```

### Indexes & Performance

- **GIN index on task.title** (`gin_trgm_ops`) for fast trigram similarity search
- **B-tree indexes** on all foreign keys for efficient joins
- **Status index** for filtering tasks by status
- **Triggers** for automatic `updated_at` timestamp management

### Sample Data
The seed file (`02-seed.sql`) includes:
- **4 Developers**: Alice (Frontend), Bob (Backend), Carol (Full-stack), Dave (Backend)
- **2 Skills**: Frontend, Backend
- **49+ Tasks** with realistic user stories across 3 nesting levels

---

## Project Structure

```
src/
├── config/                  # Configuration
│   ├── database.ts          # TypeORM DataSource configuration
│   └── env.ts               # Environment variable validation
├── controllers/             # Request handlers
│   ├── task.controller.ts
│   ├── developer.controller.ts
│   └── skill.controller.ts
├── services/                # Business logic layer
│   ├── task.service.ts      # Task CRUD + validation
│   ├── llm.service.ts       # Gemini API integration
│   ├── taskContext.service.ts # RAG similarity search
│   ├── developer.service.ts
│   └── skill.service.ts
├── data/
│   ├── entities/            # TypeORM entities
│   │   ├── Task.ts
│   │   ├── Developer.ts
│   │   └── Skill.ts
│   └── DTO/                 # Data Transfer Objects
│       ├── task/
│       │   ├── TaskCreateDTO.ts
│       │   ├── TaskDetailDTO.ts
│       │   └── TaskListItemDTO.ts
│       ├── UpdateTaskDTO.ts
│       ├── DeveloperDTO.ts
│       ├── SkillDTO.ts
│       └── common/
│           └── PaginatedResponse.ts
├── common/
│   └── exceptions/          # Custom exception hierarchy
│       ├── TaskManagerException.ts
│       ├── EntityNotFoundException.ts
│       └── InvalidRequestException.ts
├── routes/                  # Express route definitions
│   ├── task.routes.ts
│   ├── developer.routes.ts
│   └── skill.routes.ts
└── index.ts                 # Application entry point

0-db/                        # Database initialization
├── 01-schema.sql            # DDL (tables, indexes, triggers)
└── 02-seed.sql              # DML (sample data)
```

### Architecture Patterns

- **Layered Architecture**: Controller → Service → Repository separation
- **DTO Pattern**: Separate data transfer objects from entities
- **Custom Exception Handling**: Type-safe errors with HTTP status codes
- **Dependency Injection**: Service initialization in controllers

---

## System Design & Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │
│ (Frontend)  │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────────────────────────────────────┐
│         Express.js Application              │
├─────────────────────────────────────────────┤
│  Middleware Layer                           │
│  ├─ Helmet (Security Headers)               │
│  ├─ CORS (Cross-Origin)                     │
│  ├─ Rate Limiter                            │
│  └─ Error Handler                           │
├─────────────────────────────────────────────┤
│  Controller Layer                           │
│  ├─ TaskController                          │
│  ├─ DeveloperController                     │
│  └─ SkillController                         │
├─────────────────────────────────────────────┤
│  Service Layer (Business Logic)             │
│  ├─ TaskService                             │
│  │  └─ Validation, CRUD operations          │
│  ├─ LLMService                              │
│  │  └─ Gemini API integration               │
│  ├─ TaskContextService                      │
│  │  └─ RAG similarity search                │
│  ├─ DeveloperService                        │
│  └─ SkillService                            │
├─────────────────────────────────────────────┤
│  Data Access Layer                          │
│  └─ TypeORM Repositories                    │
│     (Task, Developer, Skill entities)       │
└──────────────┬──────────────────────────────┘
               │
               ↓
      ┌────────────────┐         ┌──────────────┐
      │   PostgreSQL   │         │ Google Gemini│
      │   Database     │         │     API      │
      └────────────────┘         └──────────────┘
```

### Request Flow Example: Create Task with Auto-Prediction

1. **Client Request**: `POST /api/tasks` with `{ title: "Build OAuth service" }`
2. **Middleware Processing**:
   - Helmet adds security headers
   - CORS validation
   - Rate limiter checks request count
   - JSON body parsing
3. **Controller Layer** (`TaskController.createTask`):
   - Receives HTTP request
   - Extracts request body
   - Passes to service layer
   - Handles errors via try-catch
4. **Service Layer** (`TaskService.createTask`):
   - Validates title uniqueness and length
   - If no skills provided → calls `LLMService.predictSkills`
   - Validates predicted skills exist
   - Validates parent task (if provided)
   - Validates developer has required skills (if provided)
   - Persists task to database
5. **LLM Prediction Flow** (if skills not provided):
   - `TaskContextService.findSimilarTasks`: Query PostgreSQL with trigram similarity
   - `LLMService.generateInitialPrediction`: Send prompt with context to Gemini API
   - `LLMService.generateVerificationPrediction`: Second LLM call for validation
   - Returns predicted skill IDs
6. **Data Access Layer**:
   - TypeORM Repository saves task entity
   - Handles relationships (task_skills, developer assignment)
7. **Response**: Returns `TaskDetailDTO` with HTTP 201

### Design Decisions

#### 1. **Layered Architecture**
- **Why**: Clear separation of concerns, testability, maintainability
- **Benefit**: Each layer has single responsibility; easy to modify business logic without touching controllers

#### 2. **RAG for Skill Prediction**
- **Why**: More accurate than standalone LLM by providing domain-specific context
- **Alternative Considered**: Fine-tuning LLM (rejected due to cost and complexity)
- **Benefit**: Learns from actual project data; transparent (can inspect similar tasks used)

#### 3. **PostgreSQL Trigram Similarity**
- **Why**: Built-in fuzzy matching without external dependencies
- **Alternative Considered**: Elasticsearch (rejected as overkill for this use case)
- **Benefit**: Fast (~15-20ms), no additional infrastructure required

#### 4. **TypeORM over Prisma**
- **Why**: Decorator-based syntax, familiar pattern for Java developers
- **Benefit**: Active Record + Data Mapper patterns, migration support, raw SQL capability

#### 5. **Custom Exception Hierarchy**
- **Why**: Type-safe error handling with automatic HTTP status code mapping
- **Benefit**: Consistent error responses, easier error handling in middleware

#### 5. **Why no caching?**
- **Why**: Complicated key creation for dynamic LLM responses, and key comparison is very tricky. Could end up being counterproductive if cached wrong responses.
- **Initial considerations** - LRU caching of the existing matching tasks, but removed as a feature as this was not feasible.

### Data Flow Patterns

#### Subtask Relationships
- **Database**: Self-referencing foreign key `parent_task_id` enables parent-child relationships
- **Validation**: Business rules prevent parent tasks from being marked "Done" with incomplete subtasks

#### Skill Prediction Flow
```
User creates task without skills
    ↓
TaskService checks if skillIds empty
    ↓
TaskContextService.findSimilarTasks(title)
    ↓
PostgreSQL trigram search → returns 5 similar tasks
    ↓
LLMService builds prompt with context
    ↓
Gemini API → returns predicted skills
    ↓
Verification call → validates prediction
    ↓
TaskService validates predicted skills exist
    ↓
Task created with predicted skills
```

---

## Technology Choices & Justifications

### Core Framework & Runtime

**Node.js 18 (LTS)**

**Express.js 4.18**
- **Why**: Industry standard, minimal overhead, flexible middleware system
- **Alternatives Considered**:
  - Fastify (rejected: Express is more battle-tested)
  - NestJS (rejected: too opinionated for this project scope)
- **Benefit**: Simple, well-documented, extensive middleware ecosystem

**TypeScript 5.9**

### Database & ORM

**PostgreSQL 15**

**TypeORM 0.3.27**
- **Why**:
  - Decorator-based entities (clean syntax)
  - Supports Active Record and Data Mapper patterns
  - TypeScript-first design
  - Migration support
- **Alternatives Considered**:
  - Prisma (rejected: less flexibility with raw SQL, newer ecosystem)
  - Sequelize (rejected: not TypeScript-native)
- **Benefit**: Type-safe database operations, automatic migrations, query builder

### AI/LLM Integration

**Google Gemini API (gemini-2.0-flash-exp)**
- **Why**:
  - Fast response times (~800ms for prediction)
  - Free tier sufficient for testing
  - Good at structured JSON output
  - Flash model optimized for speed
- **Alternatives Considered**:
  - OpenAI GPT-4 (rejected: more expensive, slower)
  - Claude (rejected: API access limitations)
  - Local models (rejected: deployment complexity)
- **Benefit**: Cost-effective, fast, reliable structured outputs

**@google/generative-ai (SDK)**
- **Why**: Official Google SDK, handles authentication and request formatting
- **Benefit**: Typed responses, automatic retries, simpler than raw HTTP calls

### Security & Middleware

**Helmet.js 7.1**
- **Why**: Sets secure HTTP headers (CSP, XSS protection, HSTS)
- **Benefit**: One-line security improvements, prevents common vulnerabilities

**CORS 2.8**
- **Why**: Configurable cross-origin resource sharing for frontend integration
- **Benefit**: Simple configuration, supports credentials, pre-flight handling

**express-rate-limit 7.1**
- **Why**: Prevents abuse and DDoS attacks
- **Configuration**: 100k requests per 15 minutes (generous for testing, adjustable for production)
- **Benefit**: In-memory (no Redis needed), IP-based limiting

### Validation

**class-validator 0.14 + class-transformer 0.5**
- **Why**: Decorator-based validation on DTOs (similar to Java Bean Validation)
- **Benefit**: Declarative validation rules, automatic transformation, type-safe. Clean low-code request validations.

### API Documentation

**Swagger UI Express 5.0 + OpenAPI 3.0**
- **Why**: Interactive API documentation, industry standard
- **Benefit**: Auto-generates try-it-out interface, exports OpenAPI spec for client generation

I also generated a Postman collection from the OpenAPI spec for your reference for easier testing and evaluation.

### Utilities

**dotenv 16.3**
- **Why**: Loads environment variables from `.env` file
- **Benefit**: Standard pattern for configuration management

**lru-cache 11.2**
- **Why**: In-memory caching for LLM responses (optional future enhancement)
- **Benefit**: Fast, memory-efficient, automatic eviction

### Dependencies Summary

**Total Dependencies**: 15 production + 6 dev dependencies
- **Philosophy**: Minimal dependencies, prefer standard libraries where possible
- **Security**: All dependencies actively maintained with recent updates
- **Bundle Size**: ~200MB Docker image (Alpine Linux + Node 18)

### Trade-offs & Alternatives Not Chosen

| Technology | Why Not Chosen | Trade-off |
|------------|----------------|-----------|
| **NestJS** | Too opinionated, steeper learning curve | Vanilla Express: more flexible, simpler for this scope |
| **Prisma ORM** | Less SQL flexibility, different migration approach | TypeORM: more control, familiar decorator pattern |
| **Redis** | Additional infrastructure for caching | In-memory cache: simpler deployment, sufficient for MVP |
| **Vector DB (Pinecone/Weaviate)** | Overkill for small dataset, additional cost | PostgreSQL trigram: free, fast enough, simpler |
| **Jest** | Testing not in MVP scope | Manual testing via Swagger: faster initial development |
| **Winston/Pino** | Logging library adds complexity | console.log: sufficient for development/debugging |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `DB_HOST` | **Yes** | - | PostgreSQL host |
| `DB_PORT` | **Yes** | - | PostgreSQL port |
| `DB_USER` | **Yes** | - | PostgreSQL username |
| `DB_PASSWORD` | **Yes** | - | PostgreSQL password |
| `DB_NAME` | **Yes** | - | PostgreSQL database name |
| `LLM_PROVIDER` | No | gemini | LLM provider |
| `GEMINI_API_KEY` | No | - | Google Gemini API key (optional) |
| `FRONTEND_URL` | No | http://localhost:3000 | Allowed CORS origin |

**Note**: Missing required database variables will cause startup failure with descriptive error messages.

---

## Core Business Logic

### Task Creation Validation
1. **Title uniqueness**: Prevents duplicate task titles
2. **Title length**: Maximum 100 characters
3. **Skill validation**: All skill IDs must exist and be unique
4. **Parent task validation**: Parent task must exist if specified
5. **Developer-skill matching**: Assigned developer must possess all required skills

### Task Update Rules
1. **Developer assignment**: Validates developer has task's required skills
2. **Status transitions**: Only allows `To-do`, `In Progress`, `Done`
3. **Parent task completion**: Cannot mark parent as "Done" if subtasks are incomplete
4. **Partial updates**: Supports updating only `developerId` or `status` independently

### Query Capabilities
- **Pagination**: `page` and `pageSize` parameters
- **Status filtering**: Filter by `To-do`, `In Progress`, `Done`
- **Developer filtering**: Tasks assigned to specific developer
- **Skill filtering**: Tasks requiring specific skills (comma-separated IDs)
- **Hierarchy filtering**: `parentOnly=true` returns only top-level tasks

---

## Security Features

- **Helmet.js**: Sets secure HTTP headers (XSS protection, content security policy)
- **CORS**: Configurable allowed origins for cross-origin requests
- **Rate Limiting**: 100,000 requests per 15-minute window per IP
- **Input Validation**: class-validator decorators on DTOs
- **SQL Injection Protection**: Parameterized queries via TypeORM
- **Error Message Sanitization**: Stack traces only in development mode

---

## Testing the Application

### Via Swagger UI
1. Start the server: `npm run dev`
2. Visit: `http://localhost:5000/api-docs`
3. Test skill prediction: Create a task without `skillIds`
4. Monitor console for detailed logs

### Key Test Scenarios
1. **Auto-predict skills**: `POST /api/tasks` with only `title` - observe LLM prediction
2. **Manual skills**: `POST /api/tasks` with `skillIds: [1, 2]`
3. **Skill validation**: Try assigning developer without required skills - should fail with 400
4. **Subtask completion**: Try marking parent "Done" with incomplete subtasks - should fail
5. **Filter queries**: `GET /api/tasks?parentOnly=true` to view only top-level tasks
6. **Pagination**: `GET /api/tasks?page=2&pageSize=5`

### Known Limitations
