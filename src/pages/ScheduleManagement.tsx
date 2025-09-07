import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  Chip,
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
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  ViewWeek as ViewWeekIcon,
  Today as TodayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSchedule } from '../hooks/useSchedule';
import { useSchedulingEmployees } from '../hooks/useSchedulingEmployees';
import type { ScheduleForm } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ScheduleManagement: React.FC = () => {
  const { 
    scheduleEntries, 
    loading, 
    error, 
    createScheduleEntry, 
    updateScheduleEntry, 
    deleteScheduleEntry 
  } = useSchedule();
  const { employees } = useSchedulingEmployees();
  
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState<ScheduleForm>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'open',
    isActive: true,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (entry?: any) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        employeeId: entry.employeeId,
        date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        shiftType: entry.shiftType,
        isActive: entry.isActive,
        notes: entry.notes || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        shiftType: 'open',
        isActive: true,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEntry(null);
    setFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'open',
      isActive: true,
      notes: ''
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (editingEntry) {
        await updateScheduleEntry(editingEntry.id, formData);
      } else {
        await createScheduleEntry(formData);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving schedule entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule entry?')) {
      try {
        await deleteScheduleEntry(id);
      } catch (error) {
        console.error('Error deleting schedule entry:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Calculate today's schedule
  const today = new Date();
  const todaySchedule = scheduleEntries.filter(entry => {
    const entryDate = entry.date instanceof Date ? entry.date : (entry.date as any).toDate();
    return entryDate.toDateString() === today.toDateString();
  });

  // Calculate weekly schedule
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weeklySchedule = scheduleEntries.filter(entry => {
    const entryDate = entry.date instanceof Date ? entry.date : (entry.date as any).toDate();
    return entryDate >= startOfWeek && entryDate <= endOfWeek;
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
      <Typography variant="h4" gutterBottom>
        Schedule Management
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage employee schedules and track work hours
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ height: 'fit-content' }}
        >
          Add Schedule
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {scheduleEntries.filter(e => e.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Shifts
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="secondary" sx={{ fontWeight: 700 }}>
                  {employees.filter(e => e.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Employees
                </Typography>
              </Box>
              <CalendarIcon sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {todaySchedule.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Shifts
                </Typography>
              </Box>
              <TodayIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                  {weeklySchedule.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week's Shifts
                </Typography>
              </Box>
              <ViewWeekIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="schedule management tabs">
              <Tab 
                label="Today's Schedule" 
                id="schedule-tab-0" 
                aria-controls="schedule-tabpanel-0"
                icon={<TodayIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Weekly View" 
                id="schedule-tab-1" 
                aria-controls="schedule-tabpanel-1"
                icon={<ViewWeekIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Today's Schedule
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                size="small"
              >
                Add Today's Shift
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todaySchedule.map((entry) => (
                <Card key={entry.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">
                          {getEmployeeName(entry.employeeId)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.startTime} - {entry.endTime} • {entry.shiftType}
                        </Typography>
                        {entry.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={entry.isActive ? 'Active' : 'Inactive'} 
                          color={entry.isActive ? 'success' : 'default'}
                          size="small"
                        />
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(entry)}
                            color="primary"
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
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {todaySchedule.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No shifts scheduled for today
                </Typography>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Weekly Schedule
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                size="small"
              >
                Add Shift
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {weeklySchedule.map((entry) => (
                <Card key={entry.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">
                          {getEmployeeName(entry.employeeId)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(entry.date instanceof Date ? entry.date : (entry.date as any).toDate()).toLocaleDateString()} - {entry.startTime} - {entry.endTime} • {entry.shiftType}
                        </Typography>
                        {entry.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={entry.isActive ? 'Active' : 'Inactive'} 
                          color={entry.isActive ? 'success' : 'default'}
                          size="small"
                        />
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(entry)}
                            color="primary"
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
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {weeklySchedule.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No shifts scheduled for this week
        </Typography>
              )}
            </Box>
          </TabPanel>
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
                {employees.filter(emp => emp.isActive).map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
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
                <MenuItem value="open">Opening Shift</MenuItem>
                <MenuItem value="close">Closing Shift</MenuItem>
                <MenuItem value="mid">Mid Shift</MenuItem>
                <MenuItem value="mgr">Manager Shift</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitting || !formData.employeeId || !formData.date}
          >
            {submitting ? <CircularProgress size={20} /> : (editingEntry ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScheduleManagement;