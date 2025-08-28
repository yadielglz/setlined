import { Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EmployeeManager from '../components/EmployeeManager';

const EmployeeManagement = () => {
  const { userProfile } = useAuth();

  // Check if user has permission to access this page
  const canAccess = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  if (!canAccess) {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          You don't have permission to access this page. Only administrators and managers can manage employees.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage scheduling employees, their positions, departments, and contact information.
          These employees can be assigned to shifts in the schedule management section.
        </Typography>

        <EmployeeManager />
      </Paper>
    </div>
  );
};

export default EmployeeManagement;