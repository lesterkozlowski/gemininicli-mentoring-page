import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Users, Building2, CheckSquare, TrendingUp, UserPlus, Calendar, MessageSquare, Clock, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useApi } from '../hooks/useApi'
import { DashboardStats, MonthlyGrowthData, StatusDistribution, RecentActivity } from '../types/api'

const Dashboard: React.FC = () => {
  // Fetch data from API
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useApi<DashboardStats>('/dashboard/stats')
  const { data: monthlyData, loading: monthlyLoading, error: monthlyError } = useApi<MonthlyGrowthData[]>('/dashboard/monthly-growth')
  const { data: statusData, loading: statusLoading, error: statusError } = useApi<StatusDistribution[]>('/dashboard/status-distribution')
  const { data: recentActivities, loading: activitiesLoading, error: activitiesError } = useApi<RecentActivity[]>('/dashboard/recent-activities')

  // Show loading state
  if (statsLoading || monthlyLoading || statusLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Ładowanie danych...</span>
      </div>
    )
  }

  // Show error state
  if (statsError || monthlyError || statusError || activitiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Błąd podczas ładowania danych</p>
          <p className="text-muted-foreground text-sm">
            {statsError || monthlyError || statusError || activitiesError}
          </p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Mentorzy',
      value: dashboardStats?.mentorsCount?.toString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Mentees',
      value: dashboardStats?.menteesCount?.toString() || '0',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Supporterzy',
      value: dashboardStats?.supportersCount?.toString() || '0',
      change: '+5%',
      changeType: 'positive',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Firmy Partnerskie',
      value: dashboardStats?.partnerCompaniesCount?.toString() || '0',
      change: '+3',
      changeType: 'positive',
      icon: Building2,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Organizacje Partnerskie',
      value: dashboardStats?.partnerOrganizationsCount?.toString() || '0',
      change: '+2',
      changeType: 'positive',
      icon: Building2,
      color: 'from-secondary to-secondary/90'
    },
    {
      title: 'Aktywne Relacje',
      value: dashboardStats?.activeRelations?.toString() || '0',
      change: '+6',
      changeType: 'positive',
      icon: CheckSquare,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Oczekujące Relacje',
      value: dashboardStats?.pendingRelations?.toString() || '0',
      change: '+4',
      changeType: 'positive',
      icon: Clock,
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Współczynnik konwersji',
      value: dashboardStats?.conversionRate || '0%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-primary to-primary/90'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Przegląd działalności programu mentoringowego</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs flex items-center ${
                stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} od ostatniego miesiąca
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Growth Chart */}
        <Card className="xl:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              Miesięczny wzrost kontaktów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="stroke-muted-foreground" />
                <YAxis className="stroke-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="mentors" fill="hsl(var(--primary))" name="Mentorzy" radius={[2, 2, 0, 0]} />
                <Bar dataKey="mentees" fill="hsl(var(--secondary))" name="Mentees" radius={[2, 2, 0, 0]} />
                <Bar dataKey="supporters" fill="hsl(var(--accent))" name="Wspierający" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-secondary" />
              Rozkład statusów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(statusData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {(statusData || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Ostatnie aktywności
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(recentActivities || []).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{activity.user}</span>
                    <span className="text-muted-foreground"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            {(!recentActivities || recentActivities.length === 0) && (
              <p className="text-muted-foreground text-center py-8">Brak ostatnich aktywności</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-secondary" />
              Szybkie akcje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-4 text-left rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-semibold">Dodaj nowy kontakt</p>
                  <p className="text-sm opacity-90">Mentor, Mentee lub Supporter</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-200">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-semibold">Dodaj organizację</p>
                  <p className="text-sm opacity-90">Nowy partner programu</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-semibold">Zaplanuj zadanie</p>
                  <p className="text-sm opacity-90">Dodaj nowe zadanie do wykonania</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard