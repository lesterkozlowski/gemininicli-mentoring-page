-- Initial database schema for Mentoring CRM
-- Based on specification in docs/crm_functional_spec.md

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS organizations;  
DROP TABLE IF EXISTS contacts;

-- Unified contacts table for all person types (mentors, mentees, supporters)
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('mentor', 'mentee', 'supporter')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    details TEXT, -- JSON field for type-specific data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table for partner NGOs
CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activities table for notes and tasks
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_type TEXT NOT NULL CHECK (parent_type IN ('contact', 'organization')),
    parent_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'task')),
    content TEXT NOT NULL,
    due_date DATETIME,
    is_completed INTEGER DEFAULT 0 CHECK (is_completed IN (0, 1)),
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_activities_parent ON activities(parent_type, parent_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_due_date ON activities(due_date);