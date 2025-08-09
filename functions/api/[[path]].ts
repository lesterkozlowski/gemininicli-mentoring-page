import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
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
app.get('/dashboard/stats', authMiddleware, async (c) => {
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
    
    // Get active tasks count
    const tasksQuery = `
      SELECT COUNT(*) as total 
      FROM activities 
      WHERE type = 'task' AND (details->>'completed' IS NULL OR details->>'completed' = 'false')
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

    const stats = {
      totalContacts: totalContactsResult?.total || 0,
      organizations: orgsResult?.total || 0,
      activeTasks: tasksResult?.total || 0,
      conversionRate: `${conversionRate}%`,
      contactsByType: contactsResult.results
    }

    return c.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Monthly growth data endpoint
app.get('/dashboard/monthly-growth', authMiddleware, async (c) => {
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
    const chartData = []
    
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
app.get('/dashboard/status-distribution', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const statusQuery = `
      SELECT 
        CASE 
          WHEN status = 'new' THEN 'Nowe zgłoszenia'
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
    const statusData = statusResult.results.map((row, index) => ({
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
app.get('/dashboard/recent-activities', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const activitiesQuery = `
      SELECT 
        a.id,
        a.type,
        a.title,
        a.created_at,
        c.first_name || ' ' || c.last_name as user_name
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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Export the handler for Cloudflare Pages Functions
export const onRequest = app.fetch