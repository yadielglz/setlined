import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Chip,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAppointments } from '../hooks/useAppointments';
import { useCustomers } from '../hooks/useCustomers';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, AppointmentForm } from '../types';

const Calendar: React.FC = () => {
  const { appointments, loading, error, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { customers } = useCustomers();
  const { users } = useUsers();
  const { userProfile } = useAuth();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<AppointmentForm>({
    customerId: '',
    assignedTo: userProfile?.uid || '',
    appointmentType: 'consultation',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    durationMinutes: 60,
    status: 'scheduled',
    location: '',
    notes: ''
  });

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        customerId: appointment.customerId || '',
        assignedTo: appointment.assignedTo,
        appointmentType: appointment.appointmentType,
        title: appointment.title,
        description: appointment.description || '',
        scheduledDate: appointment.scheduledDate.toISOString().split('T')[0],
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        location: appointment.location || '',
        notes: appointment.notes || ''
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        customerId: '',
        assignedTo: userProfile?.uid || '',
        appointmentType: 'consultation',
        title: '',
        description: '',
        scheduledDate: selectedDate.toISOString().split('T')[0],
        durationMinutes: 60,
        status: 'scheduled',
        location: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData);
      } else {
        await createAppointment(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <ScheduleIcon fontSize="small" />;
      case 'confirmed': return <CheckCircleIcon fontSize="small" />;
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'follow-up': return 'primary';
      case 'consultation': return 'secondary';
      case 'sale': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.scheduledDate.toDateString() === selectedDate.toDateString();
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  // Group appointments by time
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const time = formatTime(appointment.scheduledDate);
    if (!groups[time]) {
      groups[time] = [];
    }
    groups[time].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Sort times
  const sortedTimes = Object.keys(groupedAppointments).sort((a, b) => {
    const timeA = new Date(`2000-01-01 ${a}`);
    const timeB = new Date(`2000-01-01 ${b}`);
    return timeA.getTime() - timeB.getTime();
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading appointments...</Typography>
      </Box>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage appointments and schedule meetings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Calendar Controls */}
        <Box sx={{ flex: { xs: '1', md: '0 0 300px' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Calendar Controls
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Select Date"
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Appointment
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Appointments List */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointments for {formatDate(selectedDate)}
              </Typography>
              
              {filteredAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No appointments scheduled for this date
                  </Typography>
                </Box>
              ) : (
                <List>
                  {sortedTimes.map((time, timeIndex) => (
                    <React.Fragment key={time}>
                      <Typography variant="subtitle2" sx={{ mt: timeIndex > 0 ? 2 : 0, mb: 1, fontWeight: 600 }}>
                        {time}
                      </Typography>
                      {groupedAppointments[time].map((appointment, index) => (
                        <React.Fragment key={appointment.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <EventIcon fontSize="small" color="action" />
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {appointment.title}
                                  </Typography>
                                  <Chip
                                    label={appointment.status}
                                    size="small"
                                    color={getStatusColor(appointment.status) as any}
                                    icon={getStatusIcon(appointment.status)}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                  <Chip
                                    label={appointment.appointmentType}
                                    size="small"
                                    color={getAppointmentTypeColor(appointment.appointmentType) as any}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                      {users.find(u => u.uid === appointment.assignedTo)?.displayName || 'Unknown'}
                                    </Typography>
                                  </Box>
                                  {appointment.customerId && (
                                    <Typography variant="body2" color="text.secondary">
                                      Customer: {customers.find(c => c.id === appointment.customerId)?.firstName} {customers.find(c => c.id === appointment.customerId)?.lastName}
                                    </Typography>
                                  )}
                                  {appointment.location && (
                                    <Typography variant="body2" color="text.secondary">
                                      Location: {appointment.location}
                                    </Typography>
                                  )}
                                  {appointment.description && (
                                    <Typography variant="body2" color="text.secondary">
                                      {appointment.description}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Duration: {appointment.durationMinutes} minutes
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(appointment)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(appointment.id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < groupedAppointments[time].length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={formData.appointmentType}
                    label="Appointment Type"
                    onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value as any })}
                  >
                    <MenuItem value="follow-up">Follow-up</MenuItem>
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="sale">Sale</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={formData.customerId}
                    label="Customer"
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <MenuItem value="">No Customer</MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={formData.assignedTo}
                    label="Assigned To"
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.uid} value={user.uid}>
                        {user.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAppointment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Calendar;