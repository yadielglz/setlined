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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSchedulingEmployees } from '../hooks/useSchedulingEmployees';
import type { SchedulingEmployee, SchedulingEmployeeForm } from '../types';

const EmployeeManager: React.FC = () => {
  const {
    employees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    loading
  } = useSchedulingEmployees();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<SchedulingEmployee | null>(null);
  const [formData, setFormData] = useState<SchedulingEmployeeForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    locationId: '',
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0]
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenDialog = (employee?: SchedulingEmployee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email || '',
        phone: employee.phone || '',
        position: employee.position,
        department: employee.department,
        locationId: employee.locationId || '',
        isActive: employee.isActive,
        hireDate: employee.hireDate.toISOString().split('T')[0]
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        locationId: '',
        isActive: true,
        hireDate: new Date().toISOString().split('T')[0]
      });
    }
    setFormError('');
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
      // Validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required');
      }
      if (!formData.position.trim()) {
        throw new Error('Position is required');
      }
      if (!formData.department.trim()) {
        throw new Error('Department is required');
      }

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

  const handleDelete = async (id: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      try {
        await deleteEmployee(id);
      } catch (err: any) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const sortedEmployees = [...employees].sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
  );

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Employee Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Employee
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Hire Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        Loading employees...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : sortedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedEmployees.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {getInitials(employee.firstName, employee.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {employee.id.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{employee.position}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{employee.department}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{employee.email || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{employee.phone || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.hireDate.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={employee.isActive ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(employee)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
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
          {editingEmployee ? 'Edit Employee' : 'Add Employee'}
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
                fullWidth
              />

              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                sx={{ minWidth: 200 }}
                required
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ minWidth: 250 }}
                fullWidth
              />

              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ minWidth: 200 }}
                fullWidth
              />

              <TextField
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                sx={{ minWidth: 200 }}
                required
                fullWidth
              />

              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                sx={{ minWidth: 200 }}
                required
                fullWidth
              />

              <TextField
                label="Location ID"
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                sx={{ minWidth: 200 }}
                fullWidth
                helperText="Optional: Leave empty for default location"
              />

              <TextField
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
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
            {formLoading ? 'Saving...' : (editingEmployee ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeManager;