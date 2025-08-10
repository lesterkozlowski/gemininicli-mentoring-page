-- Add partner companies table
-- Based on TECHNICAL_SPECIFICATION.md section 2.2

CREATE TABLE partner_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    contact_person TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    website TEXT,
    cooperation_type TEXT, -- JSON array: ['sponsorship', 'jobs', 'expertise', 'mentors']
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_partner_companies_status ON partner_companies(status);
CREATE INDEX idx_partner_companies_industry ON partner_companies(industry);
CREATE INDEX idx_partner_companies_size ON partner_companies(size);
