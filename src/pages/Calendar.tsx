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
  Fab,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppointments } from '../hooks/useAppointments';
import { useCustomers } from '../hooks/useCustomers';
import { useInteractions } from '../hooks/useInteractions';
import type { Appointment, AppointmentForm } from '../types';

const Calendar = () => {
    const theme = useTheme();
    const { appointments, loading, error, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
    const { customers } = useCustomers();
    const { interactions } = useInteractions();

   const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
   const [formData, setFormData] = useState<AppointmentForm>({
     customerId: '',
     leadId: '',
     title: '',
     description: '',
     scheduledDate: new Date().toISOString(),
     durationMinutes: 60,
     status: 'scheduled',
     appointmentType: 'follow-up',
     location: '',
     notes: ''
   });

  // Get appointments for selected date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduledDate);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Get appointments for a specific date (for calendar indicators)
  const getAppointmentsForCalendarDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduledDate);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };


  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' ||
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.description && appointment.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        customerId: appointment.customerId || '',
        leadId: appointment.leadId || '',
        title: appointment.title,
        description: appointment.description || '',
        scheduledDate: appointment.scheduledDate.toISOString(),
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        appointmentType: appointment.appointmentType,
        location: appointment.location || '',
        notes: appointment.notes || ''
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        customerId: '',
        leadId: '',
        title: '',
        description: '',
        scheduledDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
        durationMinutes: 60,
        status: 'scheduled',
        appointmentType: 'follow-up',
        location: '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
    setFormData({
      customerId: '',
      leadId: '',
      title: '',
      description: '',
      scheduledDate: new Date().toISOString(),
      durationMinutes: 60,
      status: 'scheduled',
      appointmentType: 'follow-up',
      location: '',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(id);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'No customer';
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Appointment Calendar
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            color="primary"
          >
            New Appointment
          </Button>
        </Box>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
           {/* Calendar View */}
           <Box flex={{ xs: 1, md: 2 }}>
             <Card>
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   Calendar View
                 </Typography>
                 <Box display="flex" justifyContent="center">
                   <DateCalendar
                     value={selectedDate}
                     onChange={handleDateChange}
                     slots={{
                       day: (props: any) => {
                         const { day, ...other } = props;
                         const appointmentsForDay = getAppointmentsForCalendarDate(day);
                         const hasAppointments = appointmentsForDay.length > 0;

                         return (
                           <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                             <div {...other} />
                             {hasAppointments && (
                               <div
                                 style={{
                                   position: 'absolute',
                                   bottom: 2,
                                   left: '50%',
                                   transform: 'translateX(-50%)',
                                   width: 4,
                                   height: 4,
                                   borderRadius: '50%',
                                   backgroundColor: theme.palette.primary.main,
                                 }}
                               />
                             )}
                           </div>
                         );
                       }
                     }}
                     sx={{
                       '& .MuiPickersCalendarHeader-root': {
                         paddingLeft: 0,
                         paddingRight: 0,
                       },
                       '& .MuiDayCalendar-root': {
                         width: '100%'
                       }
                     }}
                   />
                 </Box>
               </CardContent>
             </Card>
           </Box>

           {/* Appointments for Selected Date */}
           <Box flex={{ xs: 1, md: 1 }}>
             <Card>
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                 </Typography>
                 {selectedDateAppointments.length === 0 ? (
                   <Typography variant="body2" color="text.secondary">
                     No appointments scheduled for this date.
                   </Typography>
                 ) : (
                   <Box>
                     {selectedDateAppointments.map((appointment) => (
                       <Box key={appointment.id} mb={2} p={2} border={1} borderRadius={1} borderColor="divider">
                         <Box display="flex" justifyContent="space-between" alignItems="start">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold">
                               {appointment.title}
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {new Date(appointment.scheduledDate).toLocaleTimeString([], {
                                 hour: '2-digit',
                                 minute: '2-digit'
                               })}
                             </Typography>
                             {appointment.description && (
                               <Typography variant="body2" color="text.secondary">
                                 {appointment.description}
                               </Typography>
                             )}
                           </Box>
                           <Box>
                             <Chip
                               label={appointment.status}
                               color={getStatusColor(appointment.status)}
                               size="small"
                             />
                           </Box>
                         </Box>
                         <Box mt={1} display="flex" gap={1}>
                           <IconButton
                             size="small"
                             onClick={() => handleOpenDialog(appointment)}
                             color="primary"
                           >
                             <EditIcon fontSize="small" />
                           </IconButton>
                           <IconButton
                             size="small"
                             onClick={() => handleDelete(appointment.id)}
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

         {/* All Appointments List */}
         <Box mt={3}>
           <Card>
             <CardContent>
               <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                 <Typography variant="h6">
                   All Appointments
                 </Typography>
                 <Box display="flex" gap={2}>
                   <TextField
                     size="small"
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
                   />
                   <FormControl size="small" sx={{ minWidth: 120 }}>
                     <InputLabel>Status</InputLabel>
                     <Select
                       value={statusFilter}
                       label="Status"
                       onChange={(e) => setStatusFilter(e.target.value)}
                     >
                       <MenuItem value="all">All</MenuItem>
                       <MenuItem value="scheduled">Scheduled</MenuItem>
                       <MenuItem value="confirmed">Confirmed</MenuItem>
                       <MenuItem value="completed">Completed</MenuItem>
                       <MenuItem value="cancelled">Cancelled</MenuItem>
                     </Select>
                   </FormControl>
                 </Box>
               </Box>

               {loading ? (
                 <Box display="flex" justifyContent="center" p={4}>
                   <CircularProgress color="primary" />
                 </Box>
               ) : error ? (
                 <Alert severity="error">{error}</Alert>
               ) : (
                 <TableContainer component={Paper}>
                   <Table>
                     <TableHead>
                       <TableRow>
                         <TableCell>Title</TableCell>
                         <TableCell>Date & Time</TableCell>
                         <TableCell>Customer</TableCell>
                         <TableCell>Status</TableCell>
                         <TableCell>Actions</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {filteredAppointments.map((appointment) => (
                         <TableRow key={appointment.id}>
                           <TableCell>
                             <Box>
                               <Typography variant="body2" fontWeight="bold">
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
                             <Typography variant="body2">
                               {new Date(appointment.scheduledDate).toLocaleDateString()}
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {new Date(appointment.scheduledDate).toLocaleTimeString([], {
                                 hour: '2-digit',
                                 minute: '2-digit'
                               })}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             {appointment.customerId && customers.find(c => c.id === appointment.customerId) ? (
                               <Typography variant="body2">
                                 {customers.find(c => c.id === appointment.customerId)?.firstName} {customers.find(c => c.id === appointment.customerId)?.lastName}
                               </Typography>
                             ) : (
                               <Typography variant="body2" color="text.secondary">
                                 No customer
                               </Typography>
                             )}
                           </TableCell>
                           <TableCell>
                             <Chip
                               label={appointment.status}
                               color={getStatusColor(appointment.status)}
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             <IconButton
                               size="small"
                               onClick={() => handleOpenDialog(appointment)}
                               color="primary"
                             >
                               <EditIcon fontSize="small" />
                             </IconButton>
                             <IconButton
                               size="small"
                               onClick={() => handleDelete(appointment.id)}
                               color="error"
                             >
                               <DeleteIcon fontSize="small" />
                             </IconButton>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
               )}
             </CardContent>
           </Card>
         </Box>

        {/* Appointment Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                  <Box flex={1}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Customer</InputLabel>
                      <Select
                        value={formData.customerId}
                        label="Customer"
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        <MenuItem value="">No customer</MenuItem>
                        {customers.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box flex={1}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Lead</InputLabel>
                      <Select
                        value={formData.leadId}
                        label="Lead"
                        onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      >
                        <MenuItem value="">No interaction</MenuItem>
                        {interactions.map((interaction) => (
                          <MenuItem key={interaction.id} value={interaction.id}>
                            {getCustomerName(interaction.customerId)} - {interaction.source}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                />
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Scheduled Date & Time"
                      type="datetime-local"
                      value={formData.scheduledDate.slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value).toISOString() })}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      required
                    />
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Duration (minutes)"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                      required
                    />
                  </Box>
                </Box>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                  <Box flex={1}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={2}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingAppointment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add appointment"
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </LocalizationProvider>
  );
};

export default Calendar;