import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Contact } from '../types/entities';
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

export default function Supporters() {
  const [supporters, setSupporters] = useState<Contact[]>([]);
  const { data, loading } = useApi<ApiResponse<Contact>>('/api/contacts/supporters');

  useEffect(() => {
    if (data) {
      setSupporters(data.data || []);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie wspierających...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wspierający</h1>
        <Link to="/supporters/new">
          <Button>Dodaj wspierającego</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {supporters.map((supporter) => (
          <Card key={supporter.id}>
            <CardHeader>
              <CardTitle>{supporter.name}</CardTitle>
              <CardDescription>{supporter.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={supporter.status === 'active' ? 'default' : 'secondary'}>
                    {supporter.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {supporter.summary_comment}
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/supporters/${supporter.id}`}>
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
