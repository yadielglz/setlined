import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAppointments } from '../hooks/useAppointments';
import { useCustomers } from '../hooks/useCustomers';
import { useLeads } from '../hooks/useLeads';
import type { Appointment, AppointmentForm } from '../types';

const Calendar = () => {
  const { appointments, loading, error, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { customers } = useCustomers();
  const { leads } = useLeads();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentForm>({
    customerId: '',
    leadId: '',
    assignedTo: '',
    appointmentType: 'follow-up',
    title: '',
    description: '',
    scheduledDate: '',
    durationMinutes: 60,
    location: '',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' ||
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'confirmed': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getAppointmentTypeColor = (type: Appointment['appointmentType']) => {
    switch (type) {
      case 'follow-up': return 'primary';
      case 'consultation': return 'secondary';
      case 'sale': return 'success';
      default: return 'default';
    }
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        customerId: appointment.customerId || '',
        leadId: appointment.leadId || '',
        assignedTo: appointment.assignedTo,
        appointmentType: appointment.appointmentType,
        title: appointment.title,
        description: appointment.description || '',
        scheduledDate: appointment.scheduledDate ? appointment.scheduledDate.toISOString().split('T')[0] : '',
        durationMinutes: appointment.durationMinutes,
        location: appointment.location || '',
        notes: appointment.notes || ''
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        customerId: '',
        leadId: '',
        assignedTo: '',
        appointmentType: 'follow-up',
        title: '',
        description: '',
        scheduledDate: '',
        durationMinutes: 60,
        location: '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData);
      } else {
        await createAppointment(formData);
      }
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(id);
      } catch (err: any) {
        console.error('Error deleting appointment:', err);
      }
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'No Customer';
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const getLeadTitle = (leadId?: string) => {
    if (!leadId) return 'No Lead';
    const lead = leads.find(l => l.id === leadId);
    return lead ? `Lead: ${lead.source} - $${lead.estimatedValue}` : 'Unknown Lead';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Appointment Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Schedule Appointment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appointment</TableCell>
                <TableCell>Customer/Lead</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {appointment.title}
                      </Typography>
                      {appointment.description && (
                        <Typography variant="body2" color="text.secondary">
                          {appointment.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {getCustomerName(appointment.customerId)}
                        </Typography>
                      </Box>
                      {appointment.leadId && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {getLeadTitle(appointment.leadId)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.appointmentType}
                      color={getAppointmentTypeColor(appointment.appointmentType)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2">
                          {appointment.scheduledDate ? appointment.scheduledDate.toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.scheduledDate ? appointment.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {appointment.durationMinutes} min
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {appointment.location || 'TBD'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(appointment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(appointment.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No appointments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Appointment FAB for mobile */}
      <Fab
        color="primary"
        aria-label="add appointment"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'flex', md: 'none' } }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ minWidth: 300 }}
                required
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={formData.appointmentType}
                  label="Appointment Type"
                  onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value as Appointment['appointmentType'] })}
                  required
                >
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="sale">Sale</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Customer (Optional)</InputLabel>
                <Select
                  value={formData.customerId}
                  label="Customer (Optional)"
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

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Lead (Optional)</InputLabel>
                <Select
                  value={formData.leadId}
                  label="Lead (Optional)"
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                >
                  <MenuItem value="">No Lead</MenuItem>
                  {leads.map((lead) => (
                    <MenuItem key={lead.id} value={lead.id}>
                      {getCustomerName(lead.customerId)} - {lead.source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Scheduled Date & Time"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 250 }}
                required
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                sx={{ minWidth: 150 }}
                required
              />

              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                sx={{ minWidth: 200 }}
              />
            </Box>

            <TextField
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
            />

            <TextField
              label="Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : (editingAppointment ? 'Update' : 'Schedule')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Calendar;