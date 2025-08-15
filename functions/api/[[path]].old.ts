import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: any
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend
app.use('*', cors({
  origin: ['http://localhost:8788', 'http://localhost:3004', 'http://localhost:3000', 'http://127.0.0.1:8788', 'http://127.0.0.1:3004', 'http://127.0.0.1:3000'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Simple auth middleware - check for Bearer token
const authMiddleware = (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
}

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', authMiddleware, async (c) => {
  try {
    const db = c.env.DB

    // Get total contacts count by type
    const contactsQuery = `
      SELECT 
        type,
        COUNT(*) as count
      FROM contacts 
      GROUP BY type
    `
    const contactsResult = await db.prepare(contactsQuery).all()
    
    // Get total contacts count
    const totalContactsQuery = `SELECT COUNT(*) as total FROM contacts`
    const totalContactsResult = await db.prepare(totalContactsQuery).first()
    
    // Get organizations count
    const orgsQuery = `SELECT COUNT(*) as total FROM organizations`
    const orgsResult = await db.prepare(orgsQuery).first()
    
    // Get partner companies count
    const partnerCompaniesQuery = `SELECT COUNT(*) as total FROM partner_companies`
    const partnerCompaniesResult = await db.prepare(partnerCompaniesQuery).first()
    
    // Get relations count
    const activeRelationsQuery = `SELECT COUNT(*) as total FROM mentor_mentee_relations WHERE status = 'aktualna'`
    const activeRelationsResult = await db.prepare(activeRelationsQuery).first()
    
    const pendingRelationsQuery = `SELECT COUNT(*) as total FROM mentor_mentee_relations WHERE status = 'zapytanie'`
    const pendingRelationsResult = await db.prepare(pendingRelationsQuery).first()
    
    // Get active tasks count
    const tasksQuery = `
      SELECT COUNT(*) as total 
      FROM activities 
      WHERE activity_type = 'task' AND is_completed = 0
    `
    const tasksResult = await db.prepare(tasksQuery).first()
    
    // Calculate conversion rate (active contacts / total contacts * 100)
    const activeContactsQuery = `
      SELECT COUNT(*) as total 
      FROM contacts 
      WHERE status = 'active'
    `
    const activeContactsResult = await db.prepare(activeContactsQuery).first()
    
    const conversionRate = totalContactsResult?.total ? 
      Math.round((activeContactsResult?.total || 0) / (totalContactsResult.total as number) * 100) : 0

    // Get detailed breakdown per type
    const mentorsCount = contactsResult.results.find((r: any) => r.type === 'mentor')?.count || 0
    const menteesCount = contactsResult.results.find((r: any) => r.type === 'mentee')?.count || 0
    const supportersCount = contactsResult.results.find((r: any) => r.type === 'supporter')?.count || 0

    const stats = {
      totalContacts: totalContactsResult?.total || 0,
      organizations: orgsResult?.total || 0,
      totalPartnerCompanies: partnerCompaniesResult?.total || 0,
      activeRelations: activeRelationsResult?.total || 0,
      pendingRelations: pendingRelationsResult?.total || 0,
      activeTasks: tasksResult?.total || 0,
      conversionRate: `${conversionRate}%`,
      contactsByType: contactsResult.results,
      mentorsCount: mentorsCount,
      menteesCount: menteesCount,
      supportersCount: supportersCount,
      partnerCompaniesCount: partnerCompaniesResult?.total || 0,
      partnerOrganizationsCount: orgsResult?.total || 0
    }

    return c.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Monthly growth data endpoint
app.get('/api/dashboard/monthly-growth', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    // Get monthly contact creation data for last 6 months
    const monthlyQuery = `
      SELECT 
        strftime('%Y-%m', created_at) as month,
        type,
        COUNT(*) as count
      FROM contacts 
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at), type
      ORDER BY month ASC
    `
    
    const monthlyResult = await db.prepare(monthlyQuery).all()
    
    // Transform data into chart format
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru']
    
    // Group by month
    const dataByMonth: { [key: string]: any } = {}
    
    for (const row of monthlyResult.results) {
      const monthKey = row.month as string
      if (!dataByMonth[monthKey]) {
        const monthNum = parseInt(monthKey.split('-')[1]) - 1
        dataByMonth[monthKey] = {
          name: monthNames[monthNum],
          mentors: 0,
          mentees: 0,
          supporters: 0
        }
      }
      
      if (row.type === 'mentor') dataByMonth[monthKey].mentors = row.count
      else if (row.type === 'mentee') dataByMonth[monthKey].mentees = row.count
      else if (row.type === 'supporter') dataByMonth[monthKey].supporters = row.count
    }
    
    // Convert to array
    const sortedData = Object.values(dataByMonth)
    
    return c.json(sortedData)
  } catch (error) {
    console.error('Error fetching monthly growth data:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Status distribution endpoint
app.get('/api/dashboard/status-distribution', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const statusQuery = `
      SELECT 
        CASE 
          WHEN status = 'new_lead' THEN 'Nowe zgłoszenia'
          WHEN status = 'in_progress' THEN 'W procesie'
          WHEN status = 'active' THEN 'Aktywni'
          WHEN status = 'completed' THEN 'Zakończeni'
          ELSE 'Inne'
        END as name,
        COUNT(*) as value
      FROM contacts 
      GROUP BY status
    `
    
    const statusResult = await db.prepare(statusQuery).all()
    
    // Add colors for chart
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#6b7280']
    const statusData = statusResult.results.map((row: any, index: number) => ({
      ...row,
      color: colors[index % colors.length]
    }))
    
    return c.json(statusData)
  } catch (error) {
    console.error('Error fetching status distribution:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Recent activities endpoint
app.get('/api/dashboard/recent-activities', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const activitiesQuery = `
      SELECT 
        a.id,
        a.activity_type as type,
        a.created_at,
        c.name as user_name
      FROM activities a
      LEFT JOIN contacts c ON a.parent_type = 'contact' AND a.parent_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `
    
    const activitiesResult = await db.prepare(activitiesQuery).all()
    
    // Transform to frontend format
    const recentActivities = activitiesResult.results.map((row: any) => ({
      id: row.id,
      type: row.type,
      user: row.user_name || 'System',
      action: row.type === 'note' ? 'dodał notatkę' : 
              row.type === 'task' ? 'utworzył zadanie' : 
              'wykonał działanie',
      time: formatTimeAgo(row.created_at)
    }))
    
    return c.json(recentActivities)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'teraz'
  if (diffMins < 60) return `${diffMins} min temu`
  if (diffHours < 24) return `${diffHours} godz. temu`
  return `${diffDays} dni temu`
}

// CRUD API for Mentors
app.get('/api/contacts/mentors', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const { page = 1, limit = 10, search, status, specialization } = c.req.query()
    const offset = (Number(page) - 1) * Number(limit)
    
    let whereClause = "WHERE type = 'mentor'"
    const params: any[] = []
    
    if (search) {
      whereClause += " AND (name LIKE ? OR email LIKE ? OR specialization LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += " AND status = ?"
      params.push(status)
    }
    
    if (specialization) {
      whereClause += " AND specialization = ?"
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

app.get('/api/contacts/mentors/:id', authMiddleware, async (c) => {
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
    
    // Get mentor's mentees
    const menteesQuery = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.specialization,
        r.status as relation_status,
        r.start_date,
        r.goals
      FROM mentor_mentee_relations r
      JOIN contacts c ON r.mentee_id = c.id
      WHERE r.mentor_id = ? AND c.type = 'mentee'
      ORDER BY r.created_at DESC
    `
    
    const menteesResult = await db.prepare(menteesQuery).bind(id).all()
    
    return c.json({
      ...mentorResult,
      mentees: menteesResult.results
    })
  } catch (error) {
    console.error('Error fetching mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/contacts/mentors', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()
    
    const {
      name,
      email,
      phone,
      specialization,
      years_experience,
      availability,
      mentoring_type,
      status = 'new_lead',
      company_id,
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
    
    const insertQuery = `
      INSERT INTO contacts (
        type, name, email, phone, specialization, years_experience,
        availability, mentoring_type, status, company_id, summary_comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const result = await db.prepare(insertQuery).bind(
      'mentor',
      name,
      email,
      phone || null,
      specialization || null,
      years_experience || null,
      availability || null,
      mentoring_type || null,
      status,
      company_id || null,
      summary_comment || null
    ).run()
    
    const newMentor = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(result.lastRowId).first()
    
    return c.json(newMentor, 201)
  } catch (error) {
    console.error('Error creating mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.put('/api/contacts/mentors/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const {
      name,
      email,
      phone,
      specialization,
      years_experience,
      availability,
      mentoring_type,
      status,
      company_id,
      summary_comment
    } = body
    
    // Check if mentor exists
    const existing = await db.prepare('SELECT id FROM contacts WHERE id = ? AND type = "mentor"').bind(id).first()
    if (!existing) {
      return c.json({ error: 'Mentor not found' }, 404)
    }
    
    // Check if email is unique (excluding current mentor)
    if (email) {
      const emailCheck = await db.prepare('SELECT id FROM contacts WHERE email = ? AND id != ?').bind(email, id).first()
      if (emailCheck) {
        return c.json({ error: 'Email already exists' }, 409)
      }
    }
    
    const updateQuery = `
      UPDATE contacts SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        specialization = COALESCE(?, specialization),
        years_experience = COALESCE(?, years_experience),
        availability = COALESCE(?, availability),
        mentoring_type = COALESCE(?, mentoring_type),
        status = COALESCE(?, status),
        company_id = COALESCE(?, company_id),
        summary_comment = COALESCE(?, summary_comment),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND type = 'mentor'
    `
    
    await db.prepare(updateQuery).bind(
      name || null,
      email || null,
      phone || null,
      specialization || null,
      years_experience || null,
      availability || null,
      mentoring_type || null,
      status || null,
      company_id || null,
      summary_comment || null,
      id
    ).run()
    
    const updatedMentor = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).first()
    
    return c.json(updatedMentor)
  } catch (error) {
    console.error('Error updating mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.delete('/api/contacts/mentors/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const id = c.req.param('id')
    
    // Check if mentor exists
    const existing = await db.prepare('SELECT id FROM contacts WHERE id = ? AND type = "mentor"').bind(id).first()
    if (!existing) {
      return c.json({ error: 'Mentor not found' }, 404)
    }
    
    // Delete mentor (cascade will handle relations)
    await db.prepare('DELETE FROM contacts WHERE id = ? AND type = "mentor"').bind(id).run()
    
    return c.json({ message: 'Mentor deleted successfully' })
  } catch (error) {
    console.error('Error deleting mentor:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get specializations for filters
app.get('/api/contacts/mentors/specializations', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const query = `
      SELECT DISTINCT specialization 
      FROM contacts 
      WHERE type = 'mentor' AND specialization IS NOT NULL
      ORDER BY specialization
    `
    
    const result = await db.prepare(query).all()
    const specializations = result.results.map((row: any) => row.specialization)
    
    return c.json(specializations)
  } catch (error) {
    console.error('Error fetching specializations:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Export the handler for Cloudflare Pages Functions
// In Pages Functions, the handler receives a context object, not (request, env) directly.
// We forward the proper arguments to Hono's fetch handler to avoid runtime errors.
export const onRequest = (context: any) => {
  return app.fetch(context.request, context.env, context)
}
