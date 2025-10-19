# Task Manager UI

A modern, responsive React-based frontend application for managing development tasks, developers, and skill assignments. This application provides an intuitive interface for creating hierarchical tasks, assigning them to developers based on required skills, and tracking their progress through various status states.

## Features

### Task Management
- **Create Tasks**: Define tasks with titles, descriptions, and required skills
- **Hierarchical Structure**: Support for parent-child task relationships with unlimited nesting levels
- **Subtask Management**: Add multiple subtasks to any parent task during creation
- **Status Tracking**: Track tasks through multiple states (To Do, In Progress, In Review, Completed, Cancelled)
- **Pagination**: Efficient browsing of large task lists with configurable page sizes

### Developer Assignment
- **Smart Assignment**: Assign tasks to developers based on their skill sets
- **Skill Matching**: Visual indication of developer skills matching task requirements
- **Dynamic Updates**: Update assignees directly from the task list view
- **Unassignment**: Remove developer assignments when needed

### Filtering & Views
- **Parent Task Filter**: Toggle between viewing all tasks or only top-level parent tasks
- **Skill-Based Filtering**: Filter developers by required task skills during assignment
- **Status Management**: Update task statuses directly from the list view

### User Experience
- **Responsive Design**: Fully responsive interface using Tailwind CSS
- **Loading States**: Clear loading indicators for async operations
- **Error Handling**: User-friendly error messages and validation
- **Smooth Navigation**: Client-side routing with React Router
- **Visual Feedback**: Color-coded status badges and skill indicators

## Technology Stack

- **React 18.2.0**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full TypeScript support
- **Vite**: Fast build tool and development server
- **React Router 6.20.0**: Client-side routing and navigation
- **Axios 1.6.0**: HTTP client for API communication
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **ESLint**: Code quality and consistency enforcement

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── AssigneeDropdown.tsx
│   │   ├── Pagination.tsx
│   │   ├── SkillBadge.tsx
│   │   ├── SkillSelector.tsx
│   │   └── StatusDropdown.tsx
│   └── task/            # Task-specific components
│       ├── SubtaskForm.tsx
│       └── TaskRow.tsx
├── context/
│   └── TaskContext.tsx  # Global state management
├── pages/
│   ├── TaskCreationPage.tsx
│   └── TaskListPage.tsx
├── types/               # TypeScript type definitions
│   ├── developer.ts
│   ├── skill.ts
│   └── task.ts
├── utils/
│   └── apiHelpers.ts    # API integration utilities
├── App.tsx              # Main application component
├── index.css            # Global styles and Tailwind directives
└── main.tsx             # Application entry point
```

## System Design

### Architecture Overview

This frontend application follows a component-based architecture with unidirectional data flow, adhering to React best practices and design patterns.

#### Design Principles

1. **Component-Based Architecture**: The UI is decomposed into reusable, self-contained components organized by functionality (common utilities vs. task-specific components).

2. **Separation of Concerns**: Clear separation between:
   - **Presentation Layer**: React components focused on UI rendering
   - **Business Logic**: Centralized in Context API and custom hooks
   - **Data Access**: Isolated in `apiHelpers.ts` utility module

3. **Single Source of Truth**: Global application state is managed through React Context API, eliminating prop drilling and ensuring consistent state across components.

4. **Type Safety**: Full TypeScript implementation with strict typing prevents runtime errors and improves code maintainability.

### Component Hierarchy

```
App (Router)
├── TaskListPage
│   ├── TaskRow (multiple instances)
│   │   ├── SkillBadge (multiple)
│   │   ├── StatusDropdown
│   │   └── AssigneeDropdown
│   └── Pagination
└── TaskCreationPage
    ├── SkillSelector
    └── SubtaskForm (multiple instances)
        └── SkillSelector
```

### State Management Strategy

#### Global State (TaskContext)
Manages application-wide data that multiple components need access to:
- **Tasks**: Complete task list with pagination metadata
- **Developers**: All available developers with their skills
- **Skills**: Master list of available skills
- **Loading States**: Prevents duplicate operations and provides user feedback
- **Error States**: Centralized error handling

**Rationale**: Using Context API instead of prop drilling improves code maintainability and reduces coupling between components. For this application's scale, Context API provides sufficient performance without the complexity of Redux.

#### Local State (Component-level)
Page-specific concerns managed at component level:
- **Form Inputs**: Task creation form fields, validation states
- **UI State**: Dropdown open/closed states, filter toggles
- **Pagination Controls**: Current page, page size preferences

**Rationale**: Keeps component-specific state close to where it's used, following React's principle of colocation.

### Data Flow

1. **Initial Load**:
   ```
   App Mount → TaskContext useEffect → refreshAll() →
   API Calls (fetchTasks, fetchDevelopers, fetchSkills) →
   State Update → Component Re-render
   ```

2. **User Actions**:
   ```
   User Interaction → Component Handler →
   Context Method → API Call →
   State Update → Re-render with New Data
   ```

3. **Error Handling**:
   ```
   API Error → Catch in apiHelpers →
   Throw Error → Catch in Context →
   Set Error State → Display to User
   ```

### Design Decisions

#### Why Single-Page Application (SPA)?
- **Better UX**: Instant navigation without full page reloads
- **Stateful UI**: Maintains application state during navigation
- **Reduced Server Load**: API only serves data, not full HTML pages

#### Why Client-Side Routing?
- **Fast Navigation**: Route changes don't require server round-trips
- **Bookmarkable URLs**: Direct links to create page or task list
- **Browser History**: Native back/forward button support

#### Why Optimistic UI Updates?
For dropdown changes (status, assignee), the UI updates immediately while the API call processes in the background. This provides instant feedback and better perceived performance, though changes are validated server-side.

#### Pagination Strategy
Server-side pagination was chosen over client-side to:
- **Reduce Initial Load**: Only fetch required data
- **Improve Performance**: Handle large datasets efficiently
- **Lower Memory Usage**: Don't store all tasks in browser memory

### Security Considerations

1. **No Sensitive Data Storage**: No authentication tokens or sensitive data in localStorage
2. **XSS Prevention**: React's built-in XSS protection via JSX escaping
3. **Type Validation**: TypeScript ensures data type integrity
4. **API Communication**: All requests through centralized apiHelpers for consistent error handling

### Performance Optimizations

1. **Code Splitting**: Vite automatically splits code for faster initial load
2. **Lazy Loading**: Components only render when data is available
3. **Efficient Re-renders**: React's virtual DOM minimizes actual DOM manipulations
4. **Memoization**: Stable function references prevent unnecessary child re-renders

## API Documentation

### Base Configuration

**Base URL**: `http://localhost:8080/api`

All requests include:
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Endpoints

#### 1. Fetch Tasks

**GET** `/tasks`

Retrieves paginated list of tasks with optional filtering.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `parentOnly` | boolean | No | false | If true, returns only top-level parent tasks |
| `page` | number | No | 1 | Page number (1-indexed) |
| `pageSize` | number | No | 10 | Number of items per page |

**Request Example**:
```http
GET /tasks?parentOnly=false&page=1&pageSize=10
```

**Response Example**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Implement User Authentication",
      "description": "Add JWT-based authentication to the API",
      "status": "IN_PROGRESS",
      "parentTaskId": null,
      "developer": {
        "id": 5,
        "name": "Jane Smith",
        "skills": [
          { "id": 1, "name": "Java", "color": "#007396" },
          { "id": 3, "name": "Spring Boot", "color": "#6DB33F" }
        ]
      },
      "skills": [
        { "id": 1, "name": "Java", "color": "#007396" },
        { "id": 3, "name": "Spring Boot", "color": "#6DB33F" },
        { "id": 7, "name": "Security", "color": "#FF6B6B" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Status Codes**:
- `200 OK`: Successfully retrieved tasks
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

---

#### 2. Create Task

**POST** `/tasks`

Creates a new task with optional subtasks.

**Request Body**:
```json
{
  "title": "Implement Payment Gateway",
  "description": "Integrate Stripe payment processing",
  "skillIds": [1, 3, 8],
  "subTasks": [
    {
      "title": "Set up Stripe SDK",
      "description": "Install and configure Stripe SDK",
      "skillIds": [1, 3]
    },
    {
      "title": "Create Payment Endpoints",
      "description": "Build REST endpoints for payment processing",
      "skillIds": [1, 3, 8]
    }
  ]
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Task title (non-empty) |
| `description` | string | Yes | Detailed task description |
| `skillIds` | number[] | Yes | Array of skill IDs required for task |
| `subTasks` | object[] | No | Array of subtask objects (same schema minus subTasks) |

**Response Example**:
```json
{
  "id": 46,
  "title": "Implement Payment Gateway",
  "description": "Integrate Stripe payment processing",
  "status": "TODO",
  "parentTaskId": null,
  "developer": null,
  "skills": [
    { "id": 1, "name": "Java", "color": "#007396" },
    { "id": 3, "name": "Spring Boot", "color": "#6DB33F" },
    { "id": 8, "name": "REST API", "color": "#4A90E2" }
  ]
}
```

**Status Codes**:
- `201 Created`: Task successfully created
- `400 Bad Request`: Invalid request body or validation errors
- `500 Internal Server Error`: Server error

---

#### 3. Update Task

**PATCH** `/tasks/:id`

Updates specific fields of an existing task.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Task ID |

**Request Body** (all fields optional):
```json
{
  "status": "IN_PROGRESS",
  "developerId": 5
}
```

**Supported Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | One of: TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, CANCELLED |
| `developerId` | number \| null | Developer ID to assign, or null to unassign |

**Response Example**:
```json
{
  "id": 46,
  "title": "Implement Payment Gateway",
  "description": "Integrate Stripe payment processing",
  "status": "IN_PROGRESS",
  "parentTaskId": null,
  "developer": {
    "id": 5,
    "name": "Jane Smith",
    "skills": [...]
  },
  "skills": [...]
}
```

**Status Codes**:
- `200 OK`: Task successfully updated
- `400 Bad Request`: Invalid status value or developer ID
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

---

#### 4. Fetch Developers

**GET** `/developers`

Retrieves all developers with their skills.

**Request Example**:
```http
GET /developers
```

**Response Example**:
```json
[
  {
    "id": 5,
    "name": "Jane Smith",
    "skills": [
      { "id": 1, "name": "Java", "color": "#007396" },
      { "id": 3, "name": "Spring Boot", "color": "#6DB33F" },
      { "id": 7, "name": "Security", "color": "#FF6B6B" }
    ]
  },
  {
    "id": 8,
    "name": "John Doe",
    "skills": [
      { "id": 2, "name": "JavaScript", "color": "#F7DF1E" },
      { "id": 4, "name": "React", "color": "#61DAFB" }
    ]
  }
]
```

**Status Codes**:
- `200 OK`: Successfully retrieved developers
- `500 Internal Server Error`: Server error

---

#### 5. Fetch Skills

**GET** `/skills`

Retrieves all available skills.

**Request Example**:
```http
GET /skills
```

**Response Example**:
```json
[
  { "id": 1, "name": "Java", "color": "#007396" },
  { "id": 2, "name": "JavaScript", "color": "#F7DF1E" },
  { "id": 3, "name": "Spring Boot", "color": "#6DB33F" },
  { "id": 4, "name": "React", "color": "#61DAFB" }
]
```

**Status Codes**:
- `200 OK`: Successfully retrieved skills
- `500 Internal Server Error`: Server error

---

### Error Response Format

All API errors follow this format:

```json
{
  "error": "Error message description",
  "status": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### API Client Implementation

All API calls are handled through `src/utils/apiHelpers.ts` using Axios. The implementation includes:

- **Centralized Error Handling**: Consistent error messages across the app
- **Type Safety**: TypeScript interfaces ensure request/response integrity
- **Async/Await**: Modern promise handling for cleaner code
- **Automatic JSON Parsing**: Axios handles serialization/deserialization

**Example Implementation**:
```typescript
export const fetchTasks = async (options: {
  parentOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<TaskResponse> => {
  const params = new URLSearchParams({
    parentOnly: String(options.parentOnly ?? false),
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 10),
  });

  const response = await axios.get(`${BASE_URL}/tasks?${params}`);
  return response.data;
};
```

## Dependencies and Justification

### Production Dependencies

#### React 18.2.0
**Purpose**: Core UI library for building component-based interfaces.

**Justification**:
- Industry standard for modern web applications
- Virtual DOM provides excellent performance
- Hooks API enables clean, functional component patterns
- Large ecosystem and community support
- Concurrent features improve UX with better loading states

---

#### TypeScript
**Purpose**: Static type checking for JavaScript.

**Justification**:
- Catches errors at compile-time rather than runtime
- Improved IDE support with autocomplete and inline documentation
- Self-documenting code through type definitions
- Easier refactoring with confidence
- Required skill for enterprise applications

---

#### React Router DOM 6.20.0
**Purpose**: Client-side routing for navigation between pages.

**Justification**:
- De facto standard for React routing
- Declarative routing matches React's component model
- Browser history API integration
- Nested routing support for scalable applications
- URL parameter extraction for future features

---

#### Axios 1.6.0
**Purpose**: HTTP client for API communication.

**Justification**:
- Cleaner API than native fetch
- Automatic JSON transformation
- Better error handling with interceptors
- Request/response transformation capabilities
- Wide browser support including older browsers
- Easier to mock for testing

---

#### Tailwind CSS 3.4.0
**Purpose**: Utility-first CSS framework.

**Justification**:
- Rapid UI development with utility classes
- Consistent design system out of the box
- No CSS naming conflicts or specificity issues
- Responsive design utilities built-in
- PurgeCSS removes unused styles in production
- Highly customizable through configuration
- Smaller bundle size than component libraries like Material-UI

---

### Development Dependencies

#### Vite 5.0.0
**Purpose**: Build tool and development server.

**Justification**:
- Extremely fast Hot Module Replacement (HMR)
- Native ES modules during development
- Optimized production builds with Rollup
- Minimal configuration required
- Built-in TypeScript support
- Better developer experience than webpack

---

#### ESLint 8.55.0
**Purpose**: Code linting and quality enforcement.

**Justification**:
- Catches common mistakes and anti-patterns
- Enforces consistent code style across team
- Configurable rules for project needs
- Integrates with IDEs for real-time feedback
- Industry standard for JavaScript projects

**Plugins Used**:
- `eslint-plugin-react`: React-specific linting rules
- `eslint-plugin-react-hooks`: Enforces Rules of Hooks

---

#### Autoprefixer & PostCSS
**Purpose**: CSS post-processing and vendor prefixing.

**Justification**:
- Automatic vendor prefixes for browser compatibility
- Required by Tailwind CSS
- Ensures CSS works across all target browsers
- Eliminates manual prefix management

---

### Dependency Size Considerations

Total production bundle size: **~150KB gzipped**

**Breakdown**:
- React + React-DOM: ~40KB
- React Router: ~12KB
- Axios: ~13KB
- Tailwind (purged): ~10KB
- Application code: ~75KB

This is well within acceptable limits for modern web applications and ensures fast load times even on slower connections.

### Security & Maintenance

All dependencies are:
- Actively maintained with recent updates
- From trusted sources (npm verified publishers)
- Free of known critical vulnerabilities (verified via `npm audit`)
- Widely used with large communities (reduces security risks)

Regular dependency updates are recommended to patch security vulnerabilities and access new features.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running backend API server (see backend documentation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint:

The application connects to the backend API at `http://localhost:8080/api`. If your backend runs on a different port or host, update the `BASE_URL` in `src/utils/apiHelpers.ts`:

```typescript
const BASE_URL = 'http://localhost:8080/api';
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Creating a Task

1. Navigate to the home page and click "Create New Task"
2. Fill in the task details:
   - **Title**: Brief, descriptive name for the task
   - **Description**: Detailed explanation of the task requirements
   - **Skills**: Select one or more required skills from the dropdown
3. Optionally add subtasks by clicking "Add Subtask"
4. Click "Create Task" to save

### Managing Tasks

#### Viewing Tasks
- The task list displays all tasks with their current status and assigned developers
- Use the "Display Only Top-Level Parent Tasks" toggle to filter the view
- Navigate through pages using the pagination controls at the bottom

#### Updating Status
- Click the status dropdown in the "Update Status" column
- Select the new status from the available options
- The change is saved immediately

#### Assigning Developers
- Click the assignee dropdown in the "Update Assignee" column
- Developers with matching skills appear at the top of the list
- Select a developer to assign them to the task
- Select "Unassign" to remove the current assignment

### Understanding the Interface

#### Status Colors
- **Blue**: To Do
- **Yellow**: In Progress
- **Purple**: In Review
- **Green**: Completed
- **Gray**: Cancelled

#### Skill Badges
- Skills are displayed as colored badges
- Each skill has a unique color for easy identification
- Skills are shown for both tasks and developers

## API Integration

The application communicates with a RESTful backend API. All API calls are centralized in `src/utils/apiHelpers.ts` for easy maintenance and testing.

### API Endpoints Used

- `GET /tasks`: Fetch tasks with pagination and filtering
- `POST /tasks`: Create a new task
- `PATCH /tasks/:id`: Update task properties
- `GET /developers`: Fetch all developers
- `GET /skills`: Fetch all available skills

### Error Handling

The application includes comprehensive error handling:
- Network errors are caught and displayed to users
- Invalid responses trigger appropriate error messages
- Loading states prevent duplicate submissions
- Validation occurs before API calls

## Development

### Code Style

This project uses ESLint for code quality:

```bash
npm run lint
```

### Component Architecture

- **Functional Components**: All components use React hooks
- **Context API**: Global state managed through TaskContext
- **Type Safety**: Full TypeScript coverage with strict typing
- **Separation of Concerns**: UI, business logic, and API calls are properly separated

### State Management

The application uses React Context API for global state:
- **TaskContext**: Manages tasks, developers, skills, and loading states
- **Local State**: Page-specific state (pagination, filters) managed with useState
- **Optimistic Updates**: UI updates immediately with server synchronization

## Configuration

### Tailwind CSS

Tailwind is configured in `tailwind.config.js` with custom color schemes and design tokens. The configuration includes:
- Custom primary color palette
- Responsive breakpoints
- Custom utility classes

### Vite Configuration

Vite is configured for optimal development experience:
- Fast Hot Module Replacement (HMR)
- Optimized build output
- React plugin with Fast Refresh

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

- Task deletion is not currently supported in the UI
- Bulk operations (multi-select) are not available
- No offline support or caching
- Real-time updates require manual refresh

## Future Enhancements

Potential improvements for future iterations:
- Task search and advanced filtering
- Drag-and-drop task reordering
- Developer availability calendars
- Task time tracking
- Export to CSV/PDF
- Real-time notifications using WebSockets
- Dark mode support
- Accessibility improvements (WCAG 2.1 AA compliance)

## Troubleshooting

### Common Issues

**Tasks not loading:**
- Ensure the backend API is running on port 8080
- Check browser console for network errors
- Verify CORS is properly configured on the backend

**Styles not rendering:**
- Clear browser cache
- Rebuild the project: `npm run build`
- Check that Tailwind CSS is properly configured

**TypeScript errors:**
- Ensure all dependencies are installed: `npm install`
- Check that TypeScript version matches package.jso