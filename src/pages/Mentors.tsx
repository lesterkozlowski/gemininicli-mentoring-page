import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Contact } from '../types/entities';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface ApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Mentor extends Contact {
  specialization?: string;
  years_experience?: number;
  company_name?: string;
}

export default function Mentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [specializations, setSpecializations] = useState<string[]>([]);
  
  const { data, loading, error } = useApi<ApiResponse<Mentor>>(
    `/api/contacts/mentors?page=${currentPage}&limit=12&search=${searchTerm}&status=${statusFilter}&specialization=${specializationFilter}`
  );

  const { data: specializationsData } = useApi<string[]>('/api/contacts/mentors/specializations');

  useEffect(() => {
    if (data) {
      setMentors(data.data || []);
    }
  }, [data]);

  useEffect(() => {
    if (specializationsData) {
      setSpecializations(specializationsData);
    }
  }, [specializationsData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSpecializationFilter = (value: string) => {
    setSpecializationFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'new_lead':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'completed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new_lead':
        return 'Nowe zgłoszenie';
      case 'in_progress':
        return 'W procesie';
      case 'active':
        return 'Aktywny';
      case 'completed':
        return 'Zakończony';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie mentorów...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Błąd podczas ładowania mentorów</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mentorzy</h1>
        <Link to="/mentors/new">
          <Button>Dodaj mentora</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Szukaj po imieniu, emailu lub specjalizacji..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Wszystkie statusy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie</SelectItem>
            <SelectItem value="new_lead">Nowe zgłoszenie</SelectItem>
            <SelectItem value="in_progress">W procesie</SelectItem>
            <SelectItem value="active">Aktywny</SelectItem>
            <SelectItem value="completed">Zakończony</SelectItem>
          </SelectContent>
        </Select>

        <Select value={specializationFilter} onValueChange={handleSpecializationFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Wszystkie specjalizacje" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {data?.pagination?.total} mentorów
      </div>

      {/* Mentors grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
              <CardDescription>{mentor.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadgeVariant(mentor.status)}>
                    {getStatusLabel(mentor.status)}
                  </Badge>
                </div>
                
                {mentor.specialization && (
                  <div>
                    <span className="text-sm text-muted-foreground">Specjalizacja:</span>
                    <p className="text-sm font-medium">{mentor.specialization}</p>
                  </div>
                )}
                
                {mentor.years_experience && (
                  <div>
                    <span className="text-sm text-muted-foreground">Doświadczenie:</span>
                    <p className="text-sm font-medium">{mentor.years_experience} lat</p>
                  </div>
                )}
                
                {mentor.company_name && (
                  <div>
                    <span className="text-sm text-muted-foreground">Firma:</span>
                    <p className="text-sm font-medium">{mentor.company_name}</p>
                  </div>
                )}
                
                {mentor.summary_comment && (
                  <div>
                    <span className="text-sm text-muted-foreground">Opis:</span>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mentor.summary_comment}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Link to={`/mentors/${mentor.id}`}>
                  <Button variant="outline" className="w-full">
                    Szczegóły
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Poprzednia
          </Button>
          
          <span className="text-sm">
            Strona {currentPage} z {data.pagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(data.pagination!.pages, prev + 1))}
            disabled={currentPage === data.pagination.pages}
          >
            Następna
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {mentors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold mb-2">Brak mentorów</h3>
          <p className="text-muted-foreground mb-4">
            Nie znaleziono mentorów spełniających kryteria wyszukiwania.
          </p>
          <Link to="/mentors/new">
            <Button>Dodaj pierwszego mentora</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
