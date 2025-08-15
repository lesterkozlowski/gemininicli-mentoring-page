import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Relations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relacje Mentor-Mentee</h1>
          <p className="text-muted-foreground">
            Zarządzaj relacjami mentoringowymi
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nowa relacja
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktywne relacje</CardTitle>
          <CardDescription>Lista wszystkich aktywnych relacji mentoringowych</CardDescription>
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

export default Relations;
