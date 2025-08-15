export interface DashboardStats {
  totalContacts: number
  organizations: number
  totalPartnerCompanies: number
  activeRelations: number
  pendingRelations: number
  activeTasks: number
  conversionRate: string
  contactsByType: Array<{
    type: string
    count: number
  }>
  mentorsCount: number
  menteesCount: number
  supportersCount: number
  partnerCompaniesCount: number
  partnerOrganizationsCount: number
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