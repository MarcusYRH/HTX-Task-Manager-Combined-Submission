-- Task Assignment Database Schema (DDL)
-- PostgreSQL schema definition
-- This script runs automatically when the PostgreSQL container starts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- Table: developer
-- Stores developer information
-- ============================================
CREATE TABLE developer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: skill
-- Stores available skills (Frontend, Backend, etc.)
-- ============================================
CREATE TABLE skill (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: task
-- Stores task information
-- parent_task_id allows for subtask hierarchies
-- ============================================
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'To-do' CHECK (status IN ('To-do', 'In Progress', 'Done')),
    developer_id INTEGER REFERENCES developer(id) ON DELETE SET NULL,
    parent_task_id INTEGER REFERENCES task(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: developer_skills (Many-to-Many)
-- Links developers to their skills
-- ============================================
CREATE TABLE developer_skills (
    developer_id INTEGER NOT NULL REFERENCES developer(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
    PRIMARY KEY (developer_id, skill_id)
);

-- ============================================
-- Table: task_skills (Many-to-Many)
-- Links tasks to required skills
-- ============================================
CREATE TABLE task_skills (
    task_id INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, skill_id)
);

-- ============================================
-- Indexes for better query performance
-- ============================================
CREATE INDEX idx_task_developer_id ON task(developer_id);
CREATE INDEX idx_task_parent_task_id ON task(parent_task_id);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_task_title_trgm ON task USING gin (title gin_trgm_ops);
CREATE INDEX idx_developer_skills_developer ON developer_skills(developer_id);
CREATE INDEX idx_developer_skills_skill ON developer_skills(skill_id);
CREATE INDEX idx_task_skills_task ON task_skills(task_id);
CREATE INDEX idx_task_skills_skill ON task_skills(skill_id);

-- ============================================
-- Trigger: Update updated_at timestamp automatically
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_developer_updated_at
    BEFORE UPDATE ON developer
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
