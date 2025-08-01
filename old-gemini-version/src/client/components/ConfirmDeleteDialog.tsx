
// src/client/components/ConfirmDeleteDialog.tsx
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteDialog({ open, onClose, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this application? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
