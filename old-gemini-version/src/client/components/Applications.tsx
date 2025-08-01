
// src/client/components/Applications.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Chip, Button, Menu, MenuItem, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditApplicationModal from './EditApplicationModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import axios from 'axios';

interface Application {
  id: number;
  name: string;
  email: string;
  status: 'new' | 'approved' | 'rejected';
  created_at: string;
}

function Applications() {
  const { type } = useParams<{ type: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchApplications = () => {
    if (type) {
      setLoading(true);
      axios.get(`/api/applications/${type}`)
        .then(response => {
          setApplications(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error(`Error fetching ${type}:`, error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [type]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, app: Application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedApp || !type) return;

    try {
      await axios.put(`/api/applications/${type}/${selectedApp.id}/status`, { status: newStatus });
      handleMenuClose();
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      handleMenuClose();
    }
  };

  const handleEditOpen = (app: Application) => {
    setSelectedApp(app);
    setEditModalOpen(true);
  };

  const handleDeleteOpen = (app: Application) => {
    setSelectedApp(app);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApp || !type) return;

    try {
      await axios.delete(`/api/applications/${type}/${selectedApp.id}`);
      setDeleteDialogOpen(false);
      setSelectedApp(null);
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error deleting application:', error);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusChip = (status: Application['status']) => {
    switch (status) {
      case 'new':
        return <Chip label="New" color="primary" />;
      case 'approved':
        return <Chip label="Approved" color="success" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {type?.charAt(0).toUpperCase() + type!.slice(1)} Applications
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.name}</TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>{getStatusChip(app.status)}</TableCell>
                <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(event) => handleMenuOpen(event, app)}
                  >
                    Actions
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl && selectedApp?.id === app.id)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleStatusUpdate('approved')}>Approve</MenuItem>
                    <MenuItem onClick={() => handleStatusUpdate('rejected')}>Reject</MenuItem>
                  </Menu>
                  <IconButton onClick={() => handleEditOpen(app)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteOpen(app)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditApplicationModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={() => {
          setEditModalOpen(false);
          fetchApplications();
        }}
        type={type!}
        applicationId={selectedApp?.id || null}
      />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default Applications;
