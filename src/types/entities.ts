// Business entity types for Mentoring CRM
// Based on TECHNICAL_SPECIFICATION.md section 2

export interface Contact {
  id: number;
  type: 'mentor' | 'mentee' | 'supporter';
  name: string;
  email: string;
  status: string;
  summary_comment?: string;
  details?: string; // JSON field
  company_id?: number;
  company?: PartnerCompany;
  created_at: string;
  updated_at?: string;
}

export interface PartnerCompany {
  id: number;
  name: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  cooperation_type?: string; // JSON array
  status: string;
  summary_comment?: string;
  created_at: string;
  updated_at?: string;
}

export interface Organization {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  status: string;
  summary_comment?: string;
  created_at: string;
}

export interface MentorMenteeRelation {
  id: number;
  mentor_id: number;
  mentee_id: number;
  mentor?: Contact;
  mentee?: Contact;
  status: 'zapytanie' | 'aktualna' | 'archiwalna';
  start_date?: string;
  end_date?: string;
  goals?: string; // JSON array
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Activity {
  id: number;
  parent_type: 'contact' | 'organization' | 'partner_company' | 'relation';
  parent_id: number;
  activity_type: 'note' | 'task' | 'call' | 'meeting' | 'email';
  title?: string;
  content: string;
  due_date?: string;
  is_completed: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}
