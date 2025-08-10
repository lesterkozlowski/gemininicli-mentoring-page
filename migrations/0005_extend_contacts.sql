-- Extend contacts table with company relationship
-- Based on TECHNICAL_SPECIFICATION.md section 2.2

-- Add company_id column to link contacts with partner companies
ALTER TABLE contacts ADD COLUMN company_id INTEGER REFERENCES partner_companies(id);

-- Add index for performance
CREATE INDEX idx_contacts_company ON contacts(company_id);

-- Extend activities table to support new parent types
-- Update CHECK constraint to include new parent types
-- Note: SQLite doesn't support ALTER TABLE for CHECK constraints,
-- so this would need to be done by recreating the table in production
