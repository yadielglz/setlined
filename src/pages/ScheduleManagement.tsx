import { Typography, Paper } from '@mui/material';
import ScheduleManager from '../components/ScheduleManager';

const ScheduleManagement = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Schedule Management
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage employee schedules, shifts, and work assignments. Only administrators and managers have access to this section.
        </Typography>

        <ScheduleManager />
      </Paper>
    </div>
  );
};

export default ScheduleManagement;