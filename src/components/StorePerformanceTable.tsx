import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useStorePerformance } from '../hooks/useStorePerformance';
import { useAuth } from '../contexts/AuthContext';
import type { StorePerformanceMetrics, StorePerformanceForm } from '../types';

const StorePerformanceTable: React.FC = () => {
  const { 
    performanceData, 
    loading, 
    error, 
    createPerformanceEntry, 
    updatePerformanceEntry, 
    deletePerformanceEntry,
    calculateTotals 
  } = useStorePerformance();
  const { userProfile } = useAuth();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StorePerformanceMetrics | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  
  const [formData, setFormData] = useState<StorePerformanceForm>({
    date: new Date().toISOString().split('T')[0],
    voiceLines: 0,
    bts: 0,
    t4b: 0,
    acc: 0,
    hint: 0
  });

  const handleOpenDialog = (entry?: StorePerformanceMetrics) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        date: entry.date.toISOString().split('T')[0],
        voiceLines: entry.voiceLines,
        bts: entry.bts,
        t4b: entry.t4b,
        acc: entry.acc,
        hint: entry.hint
      });
    } else {
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        voiceLines: 0,
        bts: 0,
        t4b: 0,
        acc: 0,
        hint: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEntry(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingEntry) {
        await updatePerformanceEntry(editingEntry.id, formData);
      } else {
        await createPerformanceEntry(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving performance entry:', error);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this performance entry?')) {
      try {
        await deletePerformanceEntry(entryId);
      } catch (error) {
        console.error('Error deleting performance entry:', error);
      }
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter data based on date filter
  const getFilteredData = () => {
    const now = new Date();
    let filteredData = performanceData;

    switch (dateFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = performanceData.filter(entry => entry.date && entry.date >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredData = performanceData.filter(entry => entry.date && entry.date >= monthAgo);
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredData = performanceData.filter(entry => entry.date && entry.date >= yearAgo);
        break;
    }

    return filteredData.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  };

  const filteredData = getFilteredData();
  const totals = calculateTotals();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading performance data...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon />
              Store Performance
            </Typography>
            {(userProfile?.role === 'admin' || userProfile?.role === 'manager') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Entry
              </Button>
            )}
          </Box>

          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: 150 }}>
              <Typography variant="h6" color="primary">
                {totals.totalVoiceLines}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Voice Lines
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: 150 }}>
              <Typography variant="h6" color="secondary">
                {totals.totalBTS}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                BTS
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: 150 }}>
              <Typography variant="h6" color="success.main">
                {totals.totalT4B}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                T4B
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: 150 }}>
              <Typography variant="h6" color="warning.main">
                {formatCurrency(totals.totalACC)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ACC Revenue
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: 150 }}>
              <Typography variant="h6" color="info.main">
                {totals.totalHINT}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                HINT
              </Typography>
            </Paper>
          </Box>

          {/* Filter Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={dateFilter}
                label="Time Period"
                onChange={(e) => setDateFilter(e.target.value as any)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
            <Chip
              icon={<DateRangeIcon />}
              label={`${filteredData.length} entries`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Performance Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Voice Lines</TableCell>
                  <TableCell align="right">BTS</TableCell>
                  <TableCell align="right">T4B</TableCell>
                  <TableCell align="right">ACC</TableCell>
                  <TableCell align="right">HINT</TableCell>
                  {(userProfile?.role === 'admin' || userProfile?.role === 'manager') && (
                    <TableCell align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entry.date ? formatDate(entry.date) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {entry.voiceLines}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {entry.bts}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {entry.t4b}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(entry.acc)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {entry.hint}
                        </Typography>
                      </TableCell>
                      {(userProfile?.role === 'admin' || userProfile?.role === 'manager') && (
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(entry)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(entry.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No performance data found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Performance Entry Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Edit Performance Entry' : 'Add Performance Entry'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Voice Lines"
                  type="number"
                  value={formData.voiceLines}
                  onChange={(e) => setFormData({ ...formData, voiceLines: parseInt(e.target.value) || 0 })}
                />
                <TextField
                  fullWidth
                  label="BTS"
                  type="number"
                  value={formData.bts}
                  onChange={(e) => setFormData({ ...formData, bts: parseInt(e.target.value) || 0 })}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="T4B"
                  type="number"
                  value={formData.t4b}
                  onChange={(e) => setFormData({ ...formData, t4b: parseInt(e.target.value) || 0 })}
                />
                <TextField
                  fullWidth
                  label="ACC ($)"
                  type="number"
                  value={formData.acc}
                  onChange={(e) => setFormData({ ...formData, acc: parseFloat(e.target.value) || 0 })}
                />
              </Box>
              <TextField
                fullWidth
                label="HINT"
                type="number"
                value={formData.hint}
                onChange={(e) => setFormData({ ...formData, hint: parseInt(e.target.value) || 0 })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEntry ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StorePerformanceTable;