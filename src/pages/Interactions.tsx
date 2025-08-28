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
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useInteractions } from '../hooks/useInteractions';
import { useCustomers } from '../hooks/useCustomers';
import type { Interaction, InteractionForm } from '../types';

const Interactions = () => {
  const { interactions, loading, error, createInteraction, updateInteraction, deleteInteraction } = useInteractions();
  const { customers } = useCustomers();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [formData, setFormData] = useState<InteractionForm>({
    customerId: '',
    assignedTo: '',
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
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter interactions based on search and filters
  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = searchTerm === '' ||
      interaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || interaction.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || interaction.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: Interaction['status']) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'primary';
      case 'qualified': return 'secondary';
      case 'converted': return 'success';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Interaction['priority']) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const handleOpenDialog = (interaction?: Interaction) => {
    if (interaction) {
      setEditingInteraction(interaction);
      setFormData({
        customerId: interaction.customerId,
        assignedTo: interaction.assignedTo,
        status: interaction.status,
        source: interaction.source,
        priority: interaction.priority,
        estimatedValue: interaction.estimatedValue,
        notes: interaction.notes || '',
        nextFollowUp: interaction.nextFollowUp ? interaction.nextFollowUp.toISOString().split('T')[0] : '',
        tLife: interaction.tLife,
        upgrade: interaction.upgrade,
        newSale: interaction.newSale,
        appointment: interaction.appointment
      });
    } else {
      setEditingInteraction(null);
      setFormData({
        customerId: '',
        assignedTo: '',
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
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInteraction(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingInteraction) {
        await updateInteraction(editingInteraction.id, formData);
      } else {
        await createInteraction(formData);
      }
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await deleteInteraction(id);
      } catch (err: any) {
        console.error('Error deleting interaction:', err);
      }
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const getInteractionTypes = (interaction: Interaction) => {
    const types = [];
    if (interaction.tLife) types.push('T-Life');
    if (interaction.upgrade) types.push('Upgrade');
    if (interaction.newSale) types.push('New Sale');
    if (interaction.appointment) types.push('Appointment');
    return types;
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
          Customer Interactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Interaction
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search interactions..."
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
        </CardContent>
      </Card>

      {/* Interactions Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Interaction Types</TableCell>
                <TableCell>Estimated Value</TableCell>
                <TableCell>Next Follow-up</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInteractions.map((interaction) => (
                <TableRow key={interaction.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {getCustomerName(interaction.customerId)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={interaction.status}
                      color={getStatusColor(interaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={interaction.priority}
                      color={getPriorityColor(interaction.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{interaction.source}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {getInteractionTypes(interaction).map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>${interaction.estimatedValue.toLocaleString()}</TableCell>
                  <TableCell>
                    {interaction.nextFollowUp ? interaction.nextFollowUp.toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(interaction)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(interaction.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInteractions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No interactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Interaction FAB for mobile */}
      <Fab
        color="primary"
        aria-label="add interaction"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'flex', md: 'none' } }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Interaction Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInteraction ? 'Edit Interaction' : 'Add New Interaction'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customerId}
                  label="Customer"
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Interaction['status'] })}
                  required
                >
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
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Interaction['priority'] })}
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Source</InputLabel>
                <Select
                  value={formData.source}
                  label="Source"
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as Interaction['source'] })}
                  required
                >
                  <MenuItem value="walk-in">Walk-in</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="website">Website</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Estimated Value"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                sx={{ minWidth: 150 }}
                required
              />

              <TextField
                label="Next Follow-up"
                type="date"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Interaction Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.tLife}
                    onChange={(e) => setFormData({ ...formData, tLife: e.target.checked })}
                    color="primary"
                  />
                }
                label="T-Life"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.upgrade}
                    onChange={(e) => setFormData({ ...formData, upgrade: e.target.checked })}
                    color="primary"
                  />
                }
                label="Upgrade"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.newSale}
                    onChange={(e) => setFormData({ ...formData, newSale: e.target.checked })}
                    color="primary"
                  />
                }
                label="New Sale"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.appointment}
                    onChange={(e) => setFormData({ ...formData, appointment: e.target.checked })}
                    color="primary"
                  />
                }
                label="Appointment"
              />
            </Box>

            <TextField
              label="Notes"
              multiline
              rows={3}
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
            {formLoading ? <CircularProgress size={20} /> : (editingInteraction ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Interactions;