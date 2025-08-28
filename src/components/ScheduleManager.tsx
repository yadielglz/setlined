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
  Avatar,
  Fab,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarViewMonth as MonthIcon,
  ViewList as ListIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useSchedule } from '../hooks/useSchedule';
import { useSchedulingEmployees } from '../hooks/useSchedulingEmployees';
import type { ScheduleEntry, ScheduleForm } from '../types';

const ScheduleManager: React.FC = () => {
  const theme = useTheme();
  const { scheduleEntries, createScheduleEntry, updateScheduleEntry, deleteScheduleEntry, loading } = useSchedule();
  const { getActiveEmployees } = useSchedulingEmployees();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [formData, setFormData] = useState<ScheduleForm>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'open',
    locationId: '',
    notes: '',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // New state for improved UX
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [quickScheduleOpen, setQuickScheduleOpen] = useState(false);
  const [selectedEmployeeForQuick, setSelectedEmployeeForQuick] = useState('');

  const activeEmployees = getActiveEmployees();

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
        shiftType: 'open',
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


  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'open': return 'success';
      case 'close': return 'warning';
      case 'mid': return 'info';
      case 'mgr': return 'secondary';
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

  // Helper function to compare dates by local date components
  const datesEqual = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Get schedule entries for selected date
  const getScheduleEntriesForDate = (date: Date) => {
    return scheduleEntries.filter(entry => {
      return datesEqual(entry.date, date) && entry.isActive;
    });
  };

  // Get schedule entries for calendar date (for indicators)
  const getScheduleEntriesForCalendarDate = (date: Date) => {
    return scheduleEntries.filter(entry => {
      return datesEqual(entry.date, date) && entry.isActive;
    });
  };

  // Quick schedule presets
  const quickSchedulePresets = [
    { label: 'Open Shift', startTime: '08:00', endTime: '16:00', shiftType: 'open' },
    { label: 'Close Shift', startTime: '14:00', endTime: '22:00', shiftType: 'close' },
    { label: 'Mid Shift', startTime: '12:00', endTime: '20:00', shiftType: 'mid' },
    { label: 'Manager Shift', startTime: '09:00', endTime: '17:00', shiftType: 'mgr' }
  ];

  // Handle quick scheduling
  const handleQuickSchedule = async (preset: typeof quickSchedulePresets[0]) => {
    if (!selectedEmployeeForQuick || !selectedDate) return;

    try {
      await createScheduleEntry({
        employeeId: selectedEmployeeForQuick,
        date: selectedDate.toISOString().split('T')[0],
        startTime: preset.startTime,
        endTime: preset.endTime,
        shiftType: preset.shiftType as any,
        locationId: '',
        notes: `Quick scheduled: ${preset.label}`,
        isActive: true
      });
      setQuickScheduleOpen(false);
      setSelectedEmployeeForQuick('');
    } catch (error) {
      console.error('Error quick scheduling:', error);
    }
  };

  const sortedEntries = [...scheduleEntries].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const selectedDateEntries = selectedDate ? getScheduleEntriesForDate(selectedDate) : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header with View Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Schedule Management</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tabs value={viewMode} onChange={(_, newValue) => setViewMode(newValue)}>
              <Tab icon={<MonthIcon />} label="Calendar" value="calendar" />
              <Tab icon={<ListIcon />} label="List" value="list" />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Schedule Entry
            </Button>
          </Box>
        </Box>

        {viewMode === 'calendar' ? (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Calendar View */}
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Calendar View
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <DateCalendar
                      value={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      slots={{
                        day: (props: any) => {
                          const { day, ...other } = props;
                          const entriesForDay = getScheduleEntriesForCalendarDate(day);
                          const hasEntries = entriesForDay.length > 0;

                          return (
                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div {...other} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }} />
                              {hasEntries && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.primary.main,
                                  }}
                                />
                              )}
                            </div>
                          );
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Schedule for Selected Date */}
            <Box sx={{ flex: { xs: 1, md: 1 } }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={() => setQuickScheduleOpen(true)}
                      disabled={!selectedDate}
                    >
                      Quick Schedule
                    </Button>
                  </Box>

                  {selectedDateEntries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No shifts scheduled for this date.
                    </Typography>
                  ) : (
                    <Box>
                      {selectedDateEntries.map((entry) => (
                        <Box key={entry.id} sx={{ mb: 2, p: 2, border: 1, borderRadius: 1, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {entry.employeeName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </Typography>
                              {entry.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  {entry.notes}
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <Chip
                                label={entry.shiftType}
                                size="small"
                                color={getShiftTypeColor(entry.shiftType)}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(entry)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(entry.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        ) : (
          /* List View (Original Table) */
          <Card>
            <CardContent>
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
        )}

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
                  {activeEmployees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {`${employee.firstName} ${employee.lastName}`}
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
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="close">Close</MenuItem>
                  <MenuItem value="mid">Mid</MenuItem>
                  <MenuItem value="mgr">Manager</MenuItem>
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

      {/* Quick Schedule Dialog */}
      <Dialog open={quickScheduleOpen} onClose={() => setQuickScheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Schedule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an employee and choose a shift preset for {selectedDate?.toLocaleDateString()}
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployeeForQuick}
              label="Employee"
              onChange={(e) => setSelectedEmployeeForQuick(e.target.value)}
            >
              {activeEmployees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {`${employee.firstName} ${employee.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 2 }}>Shift Presets:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {quickSchedulePresets.map((preset) => (
              <Button
                key={preset.label}
                variant="outlined"
                onClick={() => handleQuickSchedule(preset)}
                disabled={!selectedEmployeeForQuick}
                sx={{ justifyContent: 'flex-start' }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="bold">{preset.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(preset.startTime)} - {formatTime(preset.endTime)}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickScheduleOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="quick schedule"
        onClick={() => setQuickScheduleOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
      >
        <ScheduleIcon />
      </Fab>
    </Box>
  </LocalizationProvider>
  );
};

export default ScheduleManager;