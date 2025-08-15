import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApi } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const mentorSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki'),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().optional(),
  specialization: z.string().min(2, 'Specjalizacja jest wymagana'),
  experience_years: z.number().min(0, 'Lata doświadczenia muszą być liczbą dodatnią'),
  availability: z.enum(['full_time', 'part_time', 'evenings', 'weekends', 'flexible']),
  mentoring_areas: z.array(z.string()).min(1, 'Wybierz co najmniej jeden obszar mentoringu'),
  company_id: z.number().optional(),
  summary_comment: z.string().optional(),
  details: z.object({
    linkedin_url: z.string().url('Nieprawidłowy URL LinkedIn').optional().or(z.literal('')),
    bio: z.string().max(1000, 'Bio nie może przekraczać 1000 znaków').optional(),
    preferred_mentoring_type: z.enum(['1_on_1', 'group', 'online', 'offline', 'hybrid']).optional(),
    max_mentees: z.number().min(1).max(10).optional(),
  }).optional(),
});

type MentorFormData = z.infer<typeof mentorSchema>;

interface MentorFormProps {
  mentor?: any;
  onSuccess?: () => void;
}

export function MentorForm({ mentor, onSuccess }: MentorFormProps) {
  const { api } = useApi();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MentorFormData>({
    resolver: zodResolver(mentorSchema),
    defaultValues: mentor || {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience_years: 0,
      availability: 'flexible',
      mentoring_areas: [],
      company_id: undefined,
      summary_comment: '',
      details: {
        linkedin_url: '',
        bio: '',
        preferred_mentoring_type: '1_on_1',
        max_mentees: 3,
      },
    },
  });

  const onSubmit = async (data: MentorFormData) => {
    setIsSubmitting(true);
    try {
      const endpoint = mentor ? `/api/contacts/mentors/${mentor.id}` : '/api/contacts/mentors';
      const method = mentor ? 'PUT' : 'POST';
      
      const response = await api(endpoint, {
        method,
        body: JSON.stringify({
          ...data,
          type: 'mentor',
        }),
      });

      if (response.ok) {
        toast.success(mentor ? 'Mentor zaktualizowany' : 'Mentor dodany');
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/mentors');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas zapisywania');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mentoringAreas = [
    'Rozwój kariery',
    'Technologie IT',
    'Biznes i przedsiębiorczość',
    'Marketing',
    'Sprzedaż',
    'Zarządzanie zespołem',
    'Finanse osobiste',
    'Rozwój osobisty',
    'Komunikacja',
    'Leadership',
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię i nazwisko *</FormLabel>
                <FormControl>
                  <Input placeholder="Jan Kowalski" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jan@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="+48 123 456 789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specjalizacja *</FormLabel>
                <FormControl>
                  <Input placeholder="np. Software Development" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience_years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lata doświadczenia *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="50" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dostępność *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz dostępność" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full_time">Pełny etat</SelectItem>
                    <SelectItem value="part_time">Część etatu</SelectItem>
                    <SelectItem value="evenings">Wieczory</SelectItem>
                    <SelectItem value="weekends">Weekendy</SelectItem>
                    <SelectItem value="flexible">Elastycznie</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mentoring_areas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obszary mentoringu *</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mentoringAreas.map((area) => (
                    <label key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(area)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const newValue = checked
                            ? [...(field.value || []), area]
                            : (field.value || []).filter((v) => v !== area);
                          field.onChange(newValue);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary_comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Krótki opis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Krótki opis mentora i jego doświadczenia..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Maksymalnie 200 znaków. Pokaże się w podglądzie listy.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="details.linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/jankowalski" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details.max_mentees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksymalna liczba mentees</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 3)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="details.bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szczegółowy opis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Szczegółowy opis doświadczenia, osiągnięć i podejścia do mentoringu..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Maksymalnie 1000 znaków. Pokaże się w szczegółowym widoku.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : (mentor ? 'Zaktualizuj' : 'Dodaj mentora')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/mentors')}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </Form>
  );
}
