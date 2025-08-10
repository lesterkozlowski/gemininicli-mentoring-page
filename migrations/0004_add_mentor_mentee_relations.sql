-- Add mentor-mentee relations table
-- Based on TECHNICAL_SPECIFICATION.md section 2.2

CREATE TABLE mentor_mentee_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER NOT NULL REFERENCES contacts(id),
    mentee_id INTEGER NOT NULL REFERENCES contacts(id),
    status TEXT NOT NULL DEFAULT 'zapytanie' CHECK (status IN ('zapytanie', 'aktualna', 'archiwalna')),
    start_date DATE,
    end_date DATE,
    goals TEXT, -- JSON array of goals
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentor_id, mentee_id)
);

-- Add indexes for performance
CREATE INDEX idx_relations_mentor ON mentor_mentee_relations(mentor_id);
CREATE INDEX idx_relations_mentee ON mentor_mentee_relations(mentee_id);
CREATE INDEX idx_relations_status ON mentor_mentee_relations(status);
