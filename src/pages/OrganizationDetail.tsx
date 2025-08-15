import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrganizationDetail: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/partner-organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Szczegóły organizacji</h1>
          <p className="text-muted-foreground">
            Szczegółowe informacje o organizacji partnerskiej
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o organizacji</CardTitle>
          <CardDescription>Szczegółowe dane organizacji partnerskiej</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Funkcja w trakcie implementacji</p>
            <Badge variant="outline" className="mt-2">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDetail;
