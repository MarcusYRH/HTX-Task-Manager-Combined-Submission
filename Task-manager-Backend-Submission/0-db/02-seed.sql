-- Task Assignment Database Seed Data (DML)
-- PostgreSQL seed data
-- This script runs after schema creation

-- ============================================
-- Seed Skills
-- ============================================
INSERT INTO skill (name) VALUES
    ('Frontend'),
    ('Backend');

-- ============================================
-- Seed Developers
-- ============================================
INSERT INTO developer (name) VALUES
    ('Alice'),
    ('Bob'),
    ('Carol'),
    ('Dave');

-- ============================================
-- Seed Developer-Skill Assignments
-- ============================================

-- Alice → Frontend
INSERT INTO developer_skills (developer_id, skill_id) VALUES
    (1, 1);

-- Bob → Backend
INSERT INTO developer_skills (developer_id, skill_id) VALUES
    (2, 2);

-- Carol → Frontend, Backend
INSERT INTO developer_skills (developer_id, skill_id) VALUES
    (3, 1),
    (3, 2);

-- Dave → Backend
INSERT INTO developer_skills (developer_id, skill_id) VALUES
    (4, 2);

-- ============================================
-- Seed Tasks (with 2-level nesting)
-- ============================================

-- Level 0: Parent Tasks (no parent_task_id)
INSERT INTO task (title, status, developer_id) VALUES
    ('As a visitor, I want to see a responsive homepage so that I can easily navigate on both desktop and mobile devices.', 'In Progress', 1),
    ('As a system administrator, I want audit logs of all data access and modifications so that I can ensure compliance with data protection regulations.', 'To-do', NULL),
    ('As a logged-in user, I want to update my profile information and upload a profile picture so that my account details are accurate and personalized.', 'To-do', NULL);

-- Level 1: Subtasks for Task 1 (Homepage - Frontend)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Design mobile-responsive navigation menu', 'Done', 1, 1),
    ('Implement CSS grid layout for homepage', 'In Progress', 1, 1),
    ('Add responsive images with srcset', 'To-do', NULL, 1);

-- Level 2: Sub-subtasks for Task 4 (Navigation menu)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Create hamburger menu icon SVG', 'Done', 1, 4),
    ('Implement mobile menu toggle logic', 'Done', 1, 4),
    ('Add smooth transition animations', 'Done', 1, 4);

-- Level 2: Sub-subtasks for Task 5 (CSS Grid)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Define grid breakpoints for responsive design', 'Done', 1, 5),
    ('Create grid container with 12-column layout', 'In Progress', 1, 5),
    ('Test grid layout on different screen sizes', 'To-do', NULL, 5);

-- Level 1: Subtasks for Task 2 (Audit Logs - Backend)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Create database schema for audit logs', 'To-do', NULL, 2),
    ('Implement logging middleware', 'To-do', NULL, 2),
    ('Build admin dashboard for log viewing', 'To-do', NULL, 2);

-- Level 2: Sub-subtasks for Task 13 (Database schema)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Design audit_logs table structure', 'To-do', NULL, 13),
    ('Add indexes for timestamp and user_id columns', 'To-do', NULL, 13),
    ('Create migration script for audit schema', 'To-do', NULL, 13);

-- Level 2: Sub-subtasks for Task 14 (Logging middleware)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Capture HTTP request details', 'To-do', NULL, 14),
    ('Log user actions and IP addresses', 'To-do', NULL, 14),
    ('Implement async logging to avoid blocking', 'To-do', NULL, 14);

-- Level 1: Subtasks for Task 3 (Profile Update - Full Stack)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Create profile update API endpoint', 'To-do', NULL, 3),
    ('Build profile form UI component', 'To-do', NULL, 3),
    ('Implement image upload service', 'To-do', NULL, 3);

-- Level 2: Sub-subtasks for Task 19 (API endpoint)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Add input validation for profile fields', 'To-do', NULL, 19),
    ('Implement authorization check for user ownership', 'To-do', NULL, 19),
    ('Write unit tests for update endpoint', 'To-do', NULL, 19);

-- Level 2: Sub-subtasks for Task 21 (Image upload)
INSERT INTO task (title, status, developer_id, parent_task_id) VALUES
    ('Validate image file types and size limits', 'To-do', NULL, 21),
    ('Integrate with cloud storage (S3/Cloudinary)', 'To-do', NULL, 21),
    ('Generate and store image thumbnails', 'To-do', NULL, 21);

-- Level 0: Additional standalone tasks
INSERT INTO task (title, status, developer_id) VALUES
    ('Setup CI/CD pipeline with GitHub Actions', 'Done', 2),
    ('Implement user authentication with JWT', 'In Progress', 3),
    ('Create API documentation with Swagger', 'Done', 3),
    ('Implement email notification system', 'To-do', NULL),
    ('Add search functionality with full-text indexing', 'To-do', NULL),
    ('Create admin panel for user management', 'In Progress', 3),
    ('Implement real-time chat feature with WebSockets', 'To-do', NULL),
    ('Add data export functionality (CSV, PDF)', 'To-do', NULL),
    ('Implement two-factor authentication', 'To-do', NULL),
    ('Create mobile-responsive dashboard', 'In Progress', 1),
    ('Add internationalization (i18n) support', 'To-do', NULL),
    ('Implement caching layer with Redis', 'To-do', NULL),
    ('Create automated backup system', 'Done', 2),
    ('Add API rate limiting and throttling', 'Done', 2),
    ('Implement role-based access control (RBAC)', 'In Progress', 4),
    ('Implement OAuth 2.0 authentication flow', 'To-do', NULL),
    ('Build user login form with validation', 'To-do', NULL),
    ('Create REST API for task management', 'To-do', NULL),
    ('Design responsive navigation bar', 'To-do', NULL);

-- ============================================
-- Seed Task-Skill Assignments
-- ============================================

-- Level 0: Parent tasks
INSERT INTO task_skills (task_id, skill_id) VALUES
    (1, 1),     -- Homepage → Frontend
    (2, 2),     -- Audit Logs → Backend
    (3, 1),     -- Profile Update → Frontend
    (3, 2);     -- Profile Update → Backend

-- Level 1: Subtasks (Task 1 children)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (4, 1),     -- Navigation → Frontend
    (5, 1),     -- CSS Grid → Frontend
    (6, 1);     -- Responsive Images → Frontend

-- Level 2: Sub-subtasks (Task 4 children - Navigation)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (7, 1),     -- Hamburger icon → Frontend
    (8, 1),     -- Toggle logic → Frontend
    (9, 1);     -- Animations → Frontend

-- Level 2: Sub-subtasks (Task 5 children - CSS Grid)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (10, 1),    -- Grid breakpoints → Frontend
    (11, 1),    -- 12-column layout → Frontend
    (12, 1);    -- Grid testing → Frontend

-- Level 1: Subtasks (Task 2 children)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (13, 2),    -- DB Schema → Backend
    (14, 2),    -- Middleware → Backend
    (15, 1),    -- Dashboard → Frontend
    (15, 2);    -- Dashboard → Backend

-- Level 2: Sub-subtasks (Task 13 children - DB Schema)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (16, 2),    -- Table structure → Backend
    (17, 2),    -- Indexes → Backend
    (18, 2);    -- Migration script → Backend

-- Level 2: Sub-subtasks (Task 14 children - Middleware)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (19, 2),    -- Capture requests → Backend
    (20, 2),    -- Log actions → Backend
    (21, 2);    -- Async logging → Backend

-- Level 1: Subtasks (Task 3 children)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (22, 2),    -- API endpoint → Backend
    (23, 1),    -- Form UI → Frontend
    (24, 2);    -- Image Upload → Backend

-- Level 2: Sub-subtasks (Task 22 children - API endpoint)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (25, 2),    -- Input validation → Backend
    (26, 2),    -- Authorization → Backend
    (27, 2);    -- Unit tests → Backend

-- Level 2: Sub-subtasks (Task 24 children - Image upload)
INSERT INTO task_skills (task_id, skill_id) VALUES
    (28, 2),    -- File validation → Backend
    (29, 2),    -- Cloud storage → Backend
    (30, 2);    -- Thumbnails → Backend

-- Level 0: Standalone tasks
INSERT INTO task_skills (task_id, skill_id) VALUES
    (31, 2),    -- CI/CD → Backend
    (32, 1),    -- JWT Auth → Frontend
    (32, 2),    -- JWT Auth → Backend
    (33, 2),    -- Swagger → Backend
    (34, 2),    -- Email notifications → Backend
    (35, 2),    -- Search functionality → Backend
    (36, 1),    -- Admin panel → Frontend
    (36, 2),    -- Admin panel → Backend
    (37, 1),    -- Real-time chat → Frontend
    (37, 2),    -- Real-time chat → Backend
    (38, 2),    -- Data export → Backend
    (39, 2),    -- Two-factor auth → Backend
    (40, 1),    -- Mobile dashboard → Frontend
    (41, 1),    -- i18n support → Frontend
    (41, 2),    -- i18n support → Backend
    (42, 2),    -- Redis caching → Backend
    (43, 2),    -- Backup system → Backend
    (44, 2),    -- Rate limiting → Backend
    (45, 2),    -- RBAC → Backend
    (46, 2),    -- OAuth 2.0 → Backend
    (47, 1),    -- Login form → Frontend
    (48, 2),    -- REST API → Backend
    (49, 1);    -- Navigation bar → Frontend
