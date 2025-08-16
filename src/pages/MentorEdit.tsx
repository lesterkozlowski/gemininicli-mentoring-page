import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { MentorForm } from '../components/mentors/MentorForm'
import { Button } from '../components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function MentorEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const { data: mentor, loading, error } = useApi(`/api/contacts/mentors/${id}`)

  const handleSuccess = () => {
    navigate(`/mentors/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Ładowanie danych mentora...</span>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Błąd podczas ładowania danych mentora</p>
          <p className="text-muted-foreground text-sm">{error || 'Mentor nie został znaleziony'}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mentors')}
            className="mt-4"
          >
            Powrót do listy
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/mentors/${id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do szczegółów</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edytuj mentora</h1>
          <p className="text-muted-foreground">Aktualizuj dane mentora: {mentor?.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <MentorForm mentor={mentor} onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
