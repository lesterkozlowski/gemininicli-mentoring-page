export interface DashboardStats {
  totalContacts: number
  organizations: number
  activeTasks: number
  conversionRate: string
  contactsByType: Array<{
    type: string
    count: number
  }>
}

export interface MonthlyGrowthData {
  name: string
  mentors: number
  mentees: number
  supporters: number
}

export interface StatusDistribution {
  name: string
  value: number
  color: string
}

export interface RecentActivity {
  id: number
  type: string
  user: string
  action: string
  time: string
}