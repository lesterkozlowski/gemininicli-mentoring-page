
// src/client/components/EditApplicationModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Grid } from '@mui/material';
import axios from 'axios';

interface EditApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  type: string;
  applicationId: number | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function EditApplicationModal({ open, onClose, onSave, type, applicationId }: EditApplicationModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open && applicationId) {
      axios.get(`/api/applications/${type}/${applicationId}`)
        .then(response => setFormData(response.data))
        .catch(error => console.error('Error fetching application details:', error));
    }
  }, [open, type, applicationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;

    try {
      await axios.put(`/api/applications/${type}/${applicationId}`, formData);
      onSave();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          Edit Application
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {Object.keys(formData).map((key) => (
            <Grid item xs={12} key={key}>
              <TextField
                fullWidth
                label={key.replace(/_/g, ' ').toUpperCase()}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                disabled={['id', 'created_at', 'status'].includes(key)}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained">Save Changes</Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

export default EditApplicationModal;
