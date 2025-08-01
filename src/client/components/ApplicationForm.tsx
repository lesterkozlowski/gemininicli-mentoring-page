
// src/client/components/ApplicationForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import axios from 'axios';

interface ApplicationFormProps {
  type: 'mentors' | 'mentees' | 'supporters';
  fields: { name: string; label: string; type?: string; multiline?: boolean; rows?: number }[];
  title: string;
}

function ApplicationForm({ type, fields, title }: ApplicationFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await axios.post(`/api/applications/${type}`, formData);
      setStatus({ type: 'success', message: `Your ${type.slice(0, -1)} application has been submitted successfully!` });
      setFormData({}); // Clear form
    } catch (error: any) {
      console.error(`Error submitting ${type} application:`, error);
      setStatus({ type: 'error', message: error.response?.data?.error || `Failed to submit ${type.slice(0, -1)} application.` });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.message}</Alert>}
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} key={field.name}>
            <TextField
              fullWidth
              label={field.label}
              name={field.name}
              type={field.type || 'text'}
              multiline={field.multiline}
              rows={field.rows}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Submit Application
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ApplicationForm;
