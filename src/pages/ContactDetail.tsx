import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Trash2, Pencil } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApi, api } from '@/hooks/useApi';
import type { Contact } from '@/types/entities';

interface ContactDetailProps {
  type: 'mentor' | 'mentee' | 'supporter';
}

const ContactDetail: React.FC<ContactDetailProps> = ({ type }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const typeLabels = {
    mentor: 'Mentor',
    mentee: 'Mentee',
    supporter: 'Supporter'
  } as const;

  // Only implement mentor details in this module; others remain placeholder
  const isMentor = type === 'mentor';

  const { data: mentor, loading, error } = useApi<(Contact & { company_name?: string; mentees?: any[] }) | { error: string }>(
    isMentor ? `/contacts/mentors/${id}` : ''
  );

  const parsedDetails = useMemo(() => {
    if (!isMentor || !mentor || (mentor as any).error) return {} as any;
    try {
      return (mentor as any).details ? JSON.parse((mentor as any).details as string) : {};
    } catch {
      return {} as any;
    }
  }, [mentor, isMentor]);

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm('Na pewno usunąć tego mentora? Tej operacji nie można cofnąć.');
    if (!confirmed) return;
    try {
      setDeleting(true);
      const res = await api(`/contacts/mentors/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error((msg && (msg.error || msg.message)) || 'Delete failed');
      }
      navigate('/mentors');
    } catch (e) {
      alert('Nie udało się usunąć mentora.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isMentor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/${type}s`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Szczegóły {typeLabels[type]}</h1>
            <p className="text-muted-foreground">Funkcja w przygotowaniu</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informacje</CardTitle>
            <CardDescription>Widok zostanie uzupełniony w ramach modułu {typeLabels[type]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Badge variant="outline">Coming Soon</Badge>
              <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Ładowanie danych...</span>
      </div>
    );
  }

  if (error || !mentor || (mentor as any).error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/mentors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Szczegóły Mentora</h1>
            <p className="text-muted-foreground">Nie udało się załadować danych mentora</p>
          </div>
        </div>
      </div>
    );
  }

  const m = mentor as Contact & { company_name?: string; mentees?: any[] };
  const statusVariant = (s: string) => (s === 'active' ? 'default' : s === 'in_progress' ? 'outline' : 'secondary');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/mentors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{m.name}</h1>
          <p className="text-muted-foreground">Szczegóły Mentora</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/mentors/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edytuj
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" /> {deleting ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacje podstawowe</CardTitle>
          <CardDescription>Szczegółowe dane mentora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{m.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
            </div>
            {parsedDetails.specialization && (
              <div>
                <div className="text-sm text-muted-foreground">Specjalizacja</div>
                <div className="font-medium">{parsedDetails.specialization}</div>
              </div>
            )}
            {parsedDetails.years_experience != null && (
              <div>
                <div className="text-sm text-muted-foreground">Doświadczenie</div>
                <div className="font-medium">{parsedDetails.years_experience} lat</div>
              </div>
            )}
            {m.company_name && (
              <div>
                <div className="text-sm text-muted-foreground">Firma</div>
                <div className="font-medium">{m.company_name}</div>
              </div>
            )}
            {m.summary_comment && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Opis</div>
                <div className="text-sm text-muted-foreground">{m.summary_comment}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!!m.mentees && Array.isArray(m.mentees) && m.mentees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Powiązani Mentees</CardTitle>
            <CardDescription>Relacje mentoringowe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {m.mentees.map((me: any) => (
                <div key={me.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{me.name}</div>
                    <div className="text-xs text-muted-foreground">{me.email}</div>
                  </div>
                  {me.relation_status && (
                    <Badge variant="outline">{me.relation_status}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactDetail;
