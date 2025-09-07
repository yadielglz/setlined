import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useSchedule } from '../hooks/useSchedule';
import { useSchedulingEmployees } from '../hooks/useSchedulingEmployees';
import { useAuth } from '../contexts/AuthContext';
import type { ScheduleEntry, ScheduleForm } from '../types';

interface ScheduleDisplayProps {
  date?: Date;
  showActions?: boolean;
  compact?: boolean;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ 
  date, 
  showActions = false, 
  compact = false 
}) => {
  const { scheduleEntries, loading, error, createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } = useSchedule();
  const { employees, getEmployeeFullName } = useSchedulingEmployees();
  const { userProfile } = useAuth();
  
  const [selectedDate] = useState<Date>(date || new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [formData, setFormData] = useState<ScheduleForm>({
    employeeId: '',
    date: selectedDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'mid',
    notes: '',
    isActive: true
  });

  // Filter entries for selected date
  const getEntriesForDate = (targetDate: Date): ScheduleEntry[] => {
    return scheduleEntries.filter(entry => {
      if (!entry.date) return false;
      return entry.date.toDateString() === targetDate.toDateString() && entry.isActive;
    });
  };

  const handleOpenDialog = (entry?: ScheduleEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        employeeId: entry.employeeId,
        date: entry.date.toISOString().split('T')[0],
        startTime: entry.startTime,
        endTime: entry.endTime,
        shiftType: entry.shiftType,
        notes: entry.notes || '',
        isActive: entry.isActive
      });
    } else {
      setEditingEntry(null);
      setFormData({
        employeeId: '',
        date: selectedDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        shiftType: 'mid',
        notes: '',
        isActive: true
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
        await updateScheduleEntry(editingEntry.id, formData);
      } else {
        await createScheduleEntry(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving schedule entry:', error);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule entry?')) {
      try {
        await deleteScheduleEntry(entryId);
      } catch (error) {
        console.error('Error deleting schedule entry:', error);
      }
    }
  };

  const getShiftColor = (shiftType: string) => {
    switch (shiftType) {
      case 'open': return 'success';
      case 'close': return 'warning';
      case 'mgr': return 'secondary';
      default: return 'info';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const entries = getEntriesForDate(selectedDate);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading schedule...</Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon />
              Schedule for {selectedDate.toLocaleDateString()}
            </Typography>
            {showActions && (userProfile?.role === 'admin' || userProfile?.role === 'manager') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                size="small"
              >
                Add Entry
              </Button>
            )}
          </Box>

          {entries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No shifts scheduled for this date
              </Typography>
            </Box>
          ) : (
            <List dense={compact}>
              {entries
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {entry.employeeName}
                            </Typography>
                            <Chip
                              label={entry.shiftType.toUpperCase()}
                              size="small"
                              color={getShiftColor(entry.shiftType) as any}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </Typography>
                            {entry.notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                • {entry.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {showActions && (userProfile?.role === 'admin' || userProfile?.role === 'manager') && (
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleOpenDialog(entry)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleDelete(entry.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    {index < entries.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Schedule Entry Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={formData.employeeId}
                label="Employee"
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {getEmployeeFullName(employee.id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Shift Type</InputLabel>
              <Select
                value={formData.shiftType}
                label="Shift Type"
                onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="mid">Mid</MenuItem>
                <MenuItem value="close">Close</MenuItem>
                <MenuItem value="mgr">Manager</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
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

export default ScheduleDisplay;