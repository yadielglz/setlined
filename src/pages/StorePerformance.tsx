import { Typography, Paper } from '@mui/material';
import { useStorePerformance } from '../hooks/useStorePerformance';
import StorePerformanceTable from '../components/StorePerformanceTable';

const StorePerformance = () => {
  const { metrics, createMetric, updateMetric, deleteMetric, loading } = useStorePerformance();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Store Performance Management
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track and manage key store performance indicators. Only administrators and managers can add, edit, or delete performance records.
        </Typography>

        <StorePerformanceTable
          metrics={metrics}
          onAdd={createMetric}
          onUpdate={updateMetric}
          onDelete={deleteMetric}
          loading={loading}
        />
      </Paper>
    </div>
  );
};

export default StorePerformance;