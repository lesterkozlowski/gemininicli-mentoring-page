import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { AppContext } from '../utils/types'

const mentors = new Hono<AppContext>()

// Get all mentors with filtering, pagination, search
mentors.get('/', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const { page = 1, limit = 10, search, status, specialization } = c.req.query()
    const offset = (Number(page) - 1) * Number(limit)
    
    let whereClause = "WHERE type = 'mentor'"
    const params: any[] = []
    
    if (search) {
      whereClause += " AND (name LIKE ? OR email LIKE ? OR details LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += " AND status = ?"
      params.push(status)
    }
    
    if (specialization) {
      whereClause += " AND JSON_EXTRACT(details, '$.specialization') = ?"
      params.push(specialization)
    }
    
    // Get mentors with pagination
    const mentorsQuery = `
      SELECT 
        c.*,
        pc.name as company_name
      FROM contacts c
      LEFT JOIN partner_companies pc ON c.company_id = pc.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const mentorsResult = await db.prepare(mentorsQuery).bind(...params, Number(limit), offset).all()
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM contacts c ${whereClause}`
    const countResult = await db.prepare(countQuery).bind(...params).first()
    
    return c.json({
      data: mentorsResult.results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching mentors:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get distinct mentor specializations for filters
mentors.get('/specializations', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const query = `
      SELECT DISTINCT JSON_EXTRACT(details, '$.specialization') AS specialization
      FROM contacts
      WHERE type = 'mentor'
        AND details IS NOT NULL
        AND JSON_EXTRACT(details, '$.specialization') IS NOT NULL
      ORDER BY specialization
    `

    const result = await db.prepare(query).all()
    const values = (result.results || [])
      .map((r: any) => r.specialization)
      .filter((v: any) => typeof v === 'string' && v.trim().length > 0)

    return c.json({ data: values })
  } catch (error) {
    console.error('Error fetching mentor specializations:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single mentor by ID
mentors.get('/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const id = c.req.param('id')
    
    const mentorQuery = `
      SELECT 
        c.*,
        pc.name as company_name,
        pc.id as company_id
      FROM contacts c
      LEFT JOIN partner_companies pc ON c.company_id = pc.id
      WHERE c.id = ? AND c.type = 'mentor'
    `
    
    const mentorResult = await db.prepare(mentorQuery).bind(id).first()
    
    if (!mentorResult) {
      return c.json({ error: 'Mentor not found' }, 404)
    }
    
    // Get mentor's mentees (if mentor_mentee_relations table exists)
    let mentees = []
    try {
      const menteesQuery = `
        SELECT 
          c.id,
          c.name,
          c.email,
          JSON_EXTRACT(c.details, '$.specialization') as specialization,
          r.status as relation_status,
          r.start_date,
          r.goals
        FROM mentor_mentee_relations r
        JOIN contacts c ON r.mentee_id = c.id
        WHERE r.mentor_id = ? AND c.type = 'mentee'
        ORDER BY r.created_at DESC
      `
      
      const menteesResult = await db.prepare(menteesQuery).bind(id).all()
      mentees = menteesResult.results || []
    } catch (error) {
      // Table might not exist yet, that's ok
      console.log('mentor_mentee_relations table not found, skipping mentees')
    }
    
    return c.json({
      ...mentorResult,
      mentees: mentees
    })
  } catch (error) {
    console.error('Error fetching mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new mentor
mentors.post('/', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()
    
    const {
      name,
      email,
      specialization,
      years_experience,
      availability,
      mentoring_type,
      status = 'new_lead',
      summary_comment
    } = body
    
    // Validate required fields
    if (!name || !email) {
      return c.json({ error: 'Name and email are required' }, 400)
    }
    
    // Check if email already exists
    const emailCheck = await db.prepare('SELECT id FROM contacts WHERE email = ?').bind(email).first()
    if (emailCheck) {
      return c.json({ error: 'Email already exists' }, 409)
    }
    
    // Create details JSON object for mentor-specific data
    const details = JSON.stringify({
      specialization: specialization || null,
      years_experience: years_experience || null,
      availability: availability || null,
      mentoring_type: mentoring_type || null
    })
    
    const insertQuery = `
      INSERT INTO contacts (type, name, email, status, summary_comment, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    
    const result = await db.prepare(insertQuery).bind(
      'mentor',
      name,
      email,
      status,
      summary_comment || null,
      details
    ).run()
    
    const newMentor = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(result.lastRowId).first()
    
    return c.json(newMentor, 201)
  } catch (error) {
    console.error('Error creating mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update mentor
mentors.put('/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const {
      name,
      email,
      specialization,
      years_experience,
      availability,
      mentoring_type,
      status,
      summary_comment
    } = body
    
    // Validate required fields
    if (!name || !email) {
      return c.json({ error: 'Name and email are required' }, 400)
    }
    
    // Check if email already exists for different mentor
    const emailCheck = await db.prepare('SELECT id FROM contacts WHERE email = ? AND id != ?').bind(email, id).first()
    if (emailCheck) {
      return c.json({ error: 'Email already exists' }, 409)
    }
    
    // Create details JSON object for mentor-specific data
    const details = JSON.stringify({
      specialization: specialization || null,
      years_experience: years_experience || null,
      availability: availability || null,
      mentoring_type: mentoring_type || null
    })
    
    const updateQuery = `
      UPDATE contacts SET name = ?, email = ?, status = ?, summary_comment = ?, details = ?
      WHERE id = ? AND type = 'mentor'
    `
    
    const result = await db.prepare(updateQuery).bind(
      name,
      email,
      status,
      summary_comment || null,
      details,
      id
    ).run()
    
    if (result.changes === 0) {
      return c.json({ error: 'Mentor not found' }, 404)
    }
    
    const updatedMentor = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).first()
    
    return c.json(updatedMentor)
  } catch (error) {
    console.error('Error updating mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete mentor
mentors.delete('/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const id = c.req.param('id')
    
    const result = await db.prepare('DELETE FROM contacts WHERE id = ? AND type = ?').bind(id, 'mentor').run()
    
    if (result.changes === 0) {
      return c.json({ error: 'Mentor not found' }, 404)
    }
    
    return c.json({ message: 'Mentor deleted successfully' })
  } catch (error) {
    console.error('Error deleting mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default mentors
