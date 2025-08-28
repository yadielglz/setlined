import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import type { StorePerformanceMetrics, StorePerformanceForm } from '../types';

interface StorePerformanceTableProps {
  metrics: StorePerformanceMetrics[];
  onAdd: (data: StorePerformanceForm) => Promise<void>;
  onUpdate: (id: string, data: StorePerformanceForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

const StorePerformanceTable: React.FC<StorePerformanceTableProps> = ({
  metrics,
  onAdd,
  onUpdate,
  onDelete,
  loading = false
}) => {
  const { userProfile } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<StorePerformanceMetrics | null>(null);
  const [formData, setFormData] = useState<StorePerformanceForm>({
    date: new Date().toISOString().split('T')[0],
    voiceLines: 0,
    bts: 0,
    t4b: 0,
    acc: 0,
    hint: 0
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  const handleOpenDialog = (metric?: StorePerformanceMetrics) => {
    if (metric) {
      setEditingMetric(metric);
      setFormData({
        date: metric.date.toISOString().split('T')[0],
        voiceLines: metric.voiceLines,
        bts: metric.bts,
        t4b: metric.t4b,
        acc: metric.acc,
        hint: metric.hint
      });
    } else {
      setEditingMetric(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        voiceLines: 0,
        bts: 0,
        t4b: 0,
        acc: 0,
        hint: 0
      });
    }
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMetric(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      voiceLines: 0,
      bts: 0,
      t4b: 0,
      acc: 0,
      hint: 0
    });
    setFormError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (formData.voiceLines < 0 || formData.bts < 0 || formData.t4b < 0 || formData.hint < 0) {
      setFormError('All quantity fields must be non-negative');
      return;
    }

    if (formData.acc < 0) {
      setFormError('Accessories amount must be non-negative');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingMetric) {
        await onUpdate(editingMetric.id, formData);
      } else {
        await onAdd(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving performance metrics:', error);
      setFormError('Failed to save performance metrics');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this performance record?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting performance metrics:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const sortedMetrics = [...metrics].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Store Performance Metrics</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Record
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Voice Lines</TableCell>
              <TableCell align="right">BTS</TableCell>
              <TableCell align="right">T4B</TableCell>
              <TableCell align="right">Accessories</TableCell>
              <TableCell align="right">HINT</TableCell>
              {canEdit && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedMetrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} align="center">
                  No performance metrics found
                </TableCell>
              </TableRow>
            ) : (
              sortedMetrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell>
                    {metric.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">{metric.voiceLines}</TableCell>
                  <TableCell align="right">{metric.bts}</TableCell>
                  <TableCell align="right">{metric.t4b}</TableCell>
                  <TableCell align="right">{formatCurrency(metric.acc)}</TableCell>
                  <TableCell align="right">{metric.hint}</TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(metric)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(metric.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMetric ? 'Edit Performance Metrics' : 'Add Performance Metrics'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Voice Lines"
              type="number"
              value={formData.voiceLines}
              onChange={(e) => setFormData({ ...formData, voiceLines: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="BTS"
              type="number"
              value={formData.bts}
              onChange={(e) => setFormData({ ...formData, bts: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="T4B"
              type="number"
              value={formData.t4b}
              onChange={(e) => setFormData({ ...formData, t4b: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Accessories ($)"
              type="number"
              value={formData.acc}
              onChange={(e) => setFormData({ ...formData, acc: parseFloat(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="HINT"
              type="number"
              value={formData.hint}
              onChange={(e) => setFormData({ ...formData, hint: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (editingMetric ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StorePerformanceTable;