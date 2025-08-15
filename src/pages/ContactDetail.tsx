import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface ContactDetailProps {
  type: 'mentor' | 'mentee' | 'supporter';
}

const ContactDetail: React.FC<ContactDetailProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  
  const typeLabels = {
    mentor: 'Mentor',
    mentee: 'Mentee',
    supporter: 'Supporter'
  };

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
          <h1 className="text-3xl font-bold tracking-tight">
            Szczegóły {typeLabels[type]}
          </h1>
          <p className="text-muted-foreground">
            Szczegółowe informacje o {typeLabels[type].toLowerCase()}u
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o {typeLabels[type].toLowerCase()}u</CardTitle>
          <CardDescription>
            Szczegółowe dane {typeLabels[type].toLowerCase()}a
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Funkcja w trakcie implementacji</p>
            <Badge variant="outline" className="mt-2">Coming Soon</Badge>
            <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactDetail;
