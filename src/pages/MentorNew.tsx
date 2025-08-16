import { useNavigate } from 'react-router-dom'
import { MentorForm } from '../components/mentors/MentorForm'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function MentorNew() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/mentors')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mentors')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do listy</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Dodaj nowego mentora</h1>
          <p className="text-muted-foreground">Wprowadź dane nowego mentora do systemu</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <MentorForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
