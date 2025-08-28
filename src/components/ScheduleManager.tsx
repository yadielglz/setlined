import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fab,
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSchedule } from '../hooks/useSchedule';
import { useUsers } from '../hooks/useUsers';
import type { ScheduleEntry, ScheduleForm } from '../types';

const ScheduleManager: React.FC = () => {
  const { scheduleEntries, createScheduleEntry, updateScheduleEntry, deleteScheduleEntry, loading } = useSchedule();
  const { users } = useUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [formData, setFormData] = useState<ScheduleForm>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'custom',
    locationId: '',
    notes: '',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const activeUsers = users.filter(user => user.isActive);

  const handleOpenDialog = (entry?: ScheduleEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        employeeId: entry.employeeId,
        date: entry.date.toISOString().split('T')[0],
        startTime: entry.startTime,
        endTime: entry.endTime,
        shiftType: entry.shiftType,
        locationId: entry.locationId || '',
        notes: entry.notes || '',
        isActive: entry.isActive
      });
    } else {
      setEditingEntry(null);
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        shiftType: 'custom',
        locationId: '',
        notes: '',
        isActive: true
      });
    }
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEntry(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      // Validation
      if (!formData.employeeId) {
        throw new Error('Please select an employee');
      }

      if (formData.startTime >= formData.endTime) {
        throw new Error('End time must be after start time');
      }

      if (editingEntry) {
        await updateScheduleEntry(editingEntry.id, formData);
      } else {
        await createScheduleEntry(formData);
      }
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule entry?')) {
      try {
        await deleteScheduleEntry(id);
      } catch (err: any) {
        console.error('Error deleting schedule entry:', err);
      }
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const user = users.find(u => u.uid === employeeId);
    return user ? user.displayName : 'Unknown Employee';
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return 'success';
      case 'afternoon': return 'warning';
      case 'evening': return 'info';
      case 'night': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const sortedEntries = [...scheduleEntries].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Schedule Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Schedule Entry
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading schedule entries...
                    </TableCell>
                  </TableRow>
                ) : sortedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No schedule entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedEntries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="body2">{entry.employeeName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.date.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.shiftType}
                          size="small"
                          color={getShiftTypeColor(entry.shiftType)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={entry.isActive ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(entry)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(entry.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }} fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.employeeId}
                  label="Employee"
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  {activeUsers.map((user) => (
                    <MenuItem key={user.uid} value={user.uid}>
                      {user.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />

              <TextField
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 900 }} // 15 min steps
                required
                fullWidth
              />

              <TextField
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 900 }} // 15 min steps
                required
                fullWidth
              />

              <FormControl sx={{ minWidth: 150 }} fullWidth>
                <InputLabel>Shift Type</InputLabel>
                <Select
                  value={formData.shiftType}
                  label="Shift Type"
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                  required
                >
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="evening">Evening</MenuItem>
                  <MenuItem value="night">Night</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Location ID (Optional)"
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                sx={{ minWidth: 200 }}
                fullWidth
                helperText="Leave empty for default location"
              />

              <TextField
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
                sx={{ minWidth: 300 }}
                fullWidth
                helperText="Additional notes about this shift"
              />

              <FormControl sx={{ minWidth: 150 }} fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? 'Saving...' : (editingEntry ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleManager;