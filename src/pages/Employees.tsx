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
  Avatar
} from '@mui/material';
import {
   Add as AddIcon,
   Search as SearchIcon,
   Edit as EditIcon,
   Delete as DeleteIcon,
   Phone as PhoneIcon,
   Email as EmailIcon,
   Work as WorkIcon,
   PowerSettingsNew as PowerIcon
} from '@mui/icons-material';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../contexts/AuthContext';
import type { Employee, EmployeeForm } from '../types';

const Employees = () => {
   const { employees, loading, error, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus } = useEmployees();
   const { userProfile } = useAuth();

   // Check if user has admin/manager privileges
   const canManageEmployees = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    hireDate: '',
    salary: 0,
    status: 'active'
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      fullName.includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getEmployeeStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on-leave': return 'warning';
      default: return 'default';
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        employeeId: employee.employeeId,
        position: employee.position,
        department: employee.department,
        hireDate: employee.hireDate.toISOString().split('T')[0],
        salary: employee.salary || 0,
        status: employee.status,
        managerId: employee.managerId || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        position: '',
        department: '',
        hireDate: '',
        salary: 0,
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
      } catch (err: any) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    if (!canManageEmployees) return;

    const action = employee.status === 'active' ? 'disable' : 'enable';
    if (window.confirm(`Are you sure you want to ${action} this employee account?`)) {
      try {
        await toggleEmployeeStatus(employee.id, employee.status);
      } catch (err: any) {
        console.error('Error toggling employee status:', err);
      }
    }
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
          Employee Management
        </Typography>
        {canManageEmployees && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!canManageEmployees && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need Admin or Manager privileges to manage employee accounts.
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search employees..."
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on-leave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {employee.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{employee.email}</Typography>
                      </Box>
                      {employee.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{employee.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{employee.position}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.department}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {employee.hireDate.toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status}
                      color={getEmployeeStatusColor(employee.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(employee)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    {canManageEmployees && (
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(employee)}
                        color={employee.status === 'active' ? 'warning' : 'success'}
                        title={employee.status === 'active' ? 'Disable Account' : 'Enable Account'}
                      >
                        <PowerIcon />
                      </IconButton>
                    )}
                    {canManageEmployees && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(employee.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No employees found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Employee FAB for mobile */}
      <Fab
        color="primary"
        aria-label="add employee"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'flex', md: 'none' } }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                sx={{ minWidth: 200 }}
                required
              />

              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                sx={{ minWidth: 200 }}
                required
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ minWidth: 250 }}
                required
              />

              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ minWidth: 200 }}
              />

              <TextField
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                sx={{ minWidth: 150 }}
                required
              />

              <TextField
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                sx={{ minWidth: 200 }}
                required
              />

              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                sx={{ minWidth: 200 }}
                required
              />

              <TextField
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
                required
              />

              <TextField
                label="Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                sx={{ minWidth: 150 }}
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on-leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : (editingEmployee ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Employees;