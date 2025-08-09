-- Sample data for development and testing
-- This migration can be applied separately for development environments

INSERT INTO contacts (type, name, email, status, summary_comment, details) VALUES
('mentor', 'Jan Kowalski', 'jan.kowalski@example.com', 'new_lead', 'Ekspert IT z 10-letnim doświadczeniem', '{"specialization": "Software Development", "experience_years": 10}'),
('mentee', 'Anna Nowak', 'anna.nowak@example.com', 'new_lead', 'Założycielka startupu e-commerce', '{"business_description": "Platforma e-commerce dla lokalnych producentów", "stage": "MVP"}'),
('supporter', 'Michał Wiśniewski', 'michal.wisniewski@example.com', 'active', 'Inwestor anioł', '{"support_area": "Finansowanie i strategia", "investment_range": "50k-200k PLN"}');

INSERT INTO organizations (name, contact_person, email, status, summary_comment) VALUES
('Fundacja Przedsiębiorczości', 'Katarzyna Zielińska', 'kontakt@fundacjaprzedsiebiorczosci.pl', 'active', 'Partner strategiczny - organizacja eventów'),
('Stowarzyszenie Młodych Biznesmenów', 'Tomasz Kowalczyk', 'biuro@smb.org.pl', 'new_lead', 'Potencjalny partner do rekrutacji mentorów');

INSERT INTO activities (parent_type, parent_id, activity_type, content, created_by) VALUES
('contact', 1, 'note', 'Pierwszy kontakt telefoniczny - bardzo zainteresowany programem', 'admin'),
('contact', 1, 'task', 'Przesłać materiały informacyjne o programie', 'admin'),
('contact', 2, 'note', 'Startup w fazie MVP, potrzebuje mentora z doświadczeniem w e-commerce', 'admin'),
('organization', 1, 'note', 'Ustalono współpracę przy organizacji eventu networkingowego', 'admin');