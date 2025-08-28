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
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import type { AppUser, AppUserForm } from '../types';

const Employees = () => {
    const { users, loading, error, createUser, updateUser, deleteAppUser, toggleUserStatus, resetUserPassword } = useUsers();
    const { userProfile } = useAuth();

    // Check if user has admin/manager privileges
    const canManageEmployees = userProfile?.role === 'admin' || userProfile?.role === 'manager';

   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingUser, setEditingUser] = useState<AppUser | null>(null);
   const [formData, setFormData] = useState<AppUserForm>({
     email: '',
     displayName: '',
     role: 'rep',
     locationId: '',
     isActive: true,
     password: ''
   });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const displayName = user.displayName.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      displayName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  const getUserStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const handleOpenDialog = (user?: AppUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        locationId: user.locationId || '',
        isActive: user.isActive
        // Note: password is not included for editing
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        displayName: '',
        role: 'rep',
        locationId: '',
        isActive: true,
        password: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingUser) {
        await updateUser(editingUser.uid, {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          locationId: formData.locationId,
          isActive: formData.isActive
        });
      } else {
        if (!formData.password) {
          throw new Error('Password is required for new users');
        }
        await createUser(formData);
      }
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteAppUser(uid);
      } catch (err: any) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleToggleStatus = async (user: AppUser) => {
    if (!canManageEmployees) return;

    const action = user.isActive ? 'disable' : 'enable';
    if (window.confirm(`Are you sure you want to ${action} this user account?`)) {
      try {
        await toggleUserStatus(user.uid, user.isActive);
      } catch (err: any) {
        console.error('Error toggling user status:', err);
      }
    }
  };

  const handleResetPassword = async (email: string) => {
    if (window.confirm(`Send password reset email to ${email}?`)) {
      try {
        await resetUserPassword(email);
        alert('Password reset email sent successfully!');
      } catch (err: any) {
        console.error('Error sending password reset:', err);
        alert('Error sending password reset email');
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
          User Management
        </Typography>
        {canManageEmployees && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!canManageEmployees && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need Admin or Manager privileges to manage user accounts.
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
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {user.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {user.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          UID: {user.uid.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                    {user.emailVerified && (
                      <Chip
                        label="Verified"
                        size="small"
                        color="success"
                        sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.locationId || 'No Location'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={getUserStatusColor(user.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.createdAt.toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                      title="Edit User"
                    >
                      <EditIcon />
                    </IconButton>
                    {canManageEmployees && (
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(user)}
                        color={user.isActive ? 'warning' : 'success'}
                        title={user.isActive ? 'Disable Account' : 'Enable Account'}
                      >
                        <PowerIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleResetPassword(user.email)}
                      color="info"
                      title="Send Password Reset"
                    >
                      <EmailIcon />
                    </IconButton>
                    {canManageEmployees && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.uid)}
                        color="error"
                        title="Delete User"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add User FAB for mobile */}
      <Fab
        color="primary"
        aria-label="add user"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'flex', md: 'none' } }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ minWidth: 250 }}
                required
                fullWidth
              />

              <TextField
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                sx={{ minWidth: 200 }}
                required
                fullWidth
              />

              {!editingUser && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ minWidth: 200 }}
                  required={!editingUser}
                  fullWidth
                  helperText="Minimum 8 characters with uppercase, lowercase, number, and special character"
                />
              )}

              <FormControl sx={{ minWidth: 150 }} fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'rep' | 'manager' | 'admin' })}
                  required
                >
                  <MenuItem value="rep">Representative</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Location ID (Optional)"
                value={formData.locationId || ''}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                sx={{ minWidth: 200 }}
                fullWidth
                helperText="Leave empty for no location assignment"
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : (editingUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Employees;