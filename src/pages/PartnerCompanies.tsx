import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { PartnerCompany } from '../types/entities';
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

export default function PartnerCompanies() {
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const { data, loading } = useApi<ApiResponse<PartnerCompany>>('/api/companies');

  useEffect(() => {
    if (data) {
      setCompanies(data.data || []);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie firm partnerskich...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Firmy Partnerskie</h1>
        <Link to="/partner-companies/new">
          <Button>Dodaj firmę</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader>
              <CardTitle>{company.name}</CardTitle>
              <CardDescription>{company.industry}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                    {company.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {company.contact_person}
                </div>
                <div className="text-sm text-muted-foreground">
                  {company.email}
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/partner-companies/${company.id}`}>
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
