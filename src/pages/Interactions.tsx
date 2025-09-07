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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Autocomplete,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useInteractions } from '../hooks/useInteractions';
import { useCustomers } from '../hooks/useCustomers';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import type { Interaction, InteractionForm } from '../types';

const Interactions: React.FC = () => {
  const { interactions, loading, error, createInteraction, updateInteraction, deleteInteraction } = useInteractions();
  const { customers } = useCustomers();
  const { users } = useUsers();
  const { userProfile } = useAuth();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<InteractionForm>({
    customerId: '',
    customerName: '',
    assignedTo: userProfile?.uid || '',
    status: 'new',
    source: 'walk-in',
    priority: 'medium',
    estimatedValue: 0,
    notes: '',
    nextFollowUp: '',
    tLife: false,
    upgrade: false,
    newSale: false,
    appointment: false
  });

  const handleOpenDialog = (interaction?: Interaction) => {
    if (interaction) {
      setEditingInteraction(interaction);
      setFormData({
        customerId: interaction.customerId || '',
        customerName: interaction.customerName || '',
        assignedTo: interaction.assignedTo,
        status: interaction.status,
        source: interaction.source,
        priority: interaction.priority,
        estimatedValue: interaction.estimatedValue,
        notes: interaction.notes || '',
        nextFollowUp: interaction.nextFollowUp?.toISOString().split('T')[0] || '',
        tLife: interaction.tLife,
        upgrade: interaction.upgrade,
        newSale: interaction.newSale,
        appointment: interaction.appointment
      });
    } else {
      setEditingInteraction(null);
      setFormData({
        customerId: '',
        customerName: '',
        assignedTo: userProfile?.uid || '',
        status: 'new',
        source: 'walk-in',
        priority: 'medium',
        estimatedValue: 0,
        notes: '',
        nextFollowUp: '',
        tLife: false,
        upgrade: false,
        newSale: false,
        appointment: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInteraction(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingInteraction) {
        await updateInteraction(editingInteraction.id, formData);
      } else {
        await createInteraction(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  };

  const handleDelete = async (interactionId: string) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await deleteInteraction(interactionId);
      } catch (error) {
        console.error('Error deleting interaction:', error);
      }
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'info';
      case 'qualified': return 'warning';
      case 'converted': return 'success';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'phone': return <PhoneIcon fontSize="small" />;
      case 'email': return <EmailIcon fontSize="small" />;
      case 'walk-in': return <PersonIcon fontSize="small" />;
      case 'website': return <TrendingUpIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter interactions
  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = !searchTerm || 
      interaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interaction.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || interaction.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading interactions...</Typography>
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
          Interactions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage customer interactions and track sales opportunities
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              All Interactions ({filteredInteractions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Interaction
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes, customer name, or source..."
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Interactions Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Next Follow-up</TableCell>
                  <TableCell>Types</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInteractions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((interaction) => (
                    <TableRow key={interaction.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {interaction.customerName || 'Unknown Customer'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSourceIcon(interaction.source)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {interaction.source}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={interaction.status}
                          size="small"
                          color={getStatusColor(interaction.status) as any}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={interaction.priority}
                          size="small"
                          color={getPriorityColor(interaction.priority) as any}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(interaction.estimatedValue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {users.find(u => u.uid === interaction.assignedTo)?.displayName || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {interaction.nextFollowUp ? formatDate(interaction.nextFollowUp) : 'Not set'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {interaction.tLife && <Chip label="T-Life" size="small" color="primary" />}
                          {interaction.upgrade && <Chip label="Upgrade" size="small" color="secondary" />}
                          {interaction.newSale && <Chip label="New Sale" size="small" color="success" />}
                          {interaction.appointment && <Chip label="Appointment" size="small" color="warning" />}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(interaction)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(interaction.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredInteractions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No interactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInteractions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Interaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInteraction ? 'Edit Interaction' : 'Add Interaction'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Autocomplete
                  freeSolo
                  options={customers.map(customer => `${customer.firstName} ${customer.lastName}`)}
                  value={formData.customerName}
                  onChange={(_event, newValue) => {
                    setFormData({ ...formData, customerName: newValue || '' });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer Name"
                      placeholder="Type customer name or select from list"
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ flex: 1 }}>
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
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="contacted">Contacted</MenuItem>
                    <MenuItem value="qualified">Qualified</MenuItem>
                    <MenuItem value="converted">Converted</MenuItem>
                    <MenuItem value="lost">Lost</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={formData.source}
                    label="Source"
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                  >
                    <MenuItem value="walk-in">Walk-in</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="website">Website</MenuItem>
                    <MenuItem value="referral">Referral</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Estimated Value"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                />
                <TextField
                  fullWidth
                  label="Next Follow-up"
                  type="date"
                  value={formData.nextFollowUp}
                  onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Interaction Types
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.tLife}
                        onChange={(e) => setFormData({ ...formData, tLife: e.target.checked })}
                      />
                    }
                    label="T-Life"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.upgrade}
                        onChange={(e) => setFormData({ ...formData, upgrade: e.target.checked })}
                      />
                    }
                    label="Upgrade"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.newSale}
                        onChange={(e) => setFormData({ ...formData, newSale: e.target.checked })}
                      />
                    }
                    label="New Sale"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.appointment}
                        onChange={(e) => setFormData({ ...formData, appointment: e.target.checked })}
                      />
                    }
                    label="Appointment"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInteraction ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Interactions;