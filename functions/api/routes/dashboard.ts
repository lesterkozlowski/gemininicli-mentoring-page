import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { formatTimeAgo } from '../utils/db'
import type { AppContext } from '../utils/types'

const dashboard = new Hono<AppContext>()

// Dashboard statistics endpoint
dashboard.get('/stats', authMiddleware, async (c) => {
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
dashboard.get('/monthly-growth', authMiddleware, async (c) => {
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
dashboard.get('/status-distribution', authMiddleware, async (c) => {
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
dashboard.get('/recent-activities', authMiddleware, async (c) => {
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

export default dashboard
