import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Organization } from '../types/entities';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

interface ApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function PartnerOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { data, loading } = useApi<ApiResponse<Organization>>('/api/organizations');

  useEffect(() => {
    if (data) {
      setOrganizations(data.data || []);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie organizacji partnerskich...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Organizacje Partnerskie</h1>
        <Link to="/partner-organizations/new">
          <Button>Dodaj organizację</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
              <CardDescription>{org.summary_comment || 'Organizacja partnerska'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                    {org.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {org.contact_person}
                </div>
                <div className="text-sm text-muted-foreground">
                  {org.email}
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/partner-organizations/${org.id}`}>
                  <Button variant="outline" className="w-full">
                    Szczegóły
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
