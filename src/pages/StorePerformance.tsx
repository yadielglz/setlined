import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useStorePerformance } from '../hooks/useStorePerformance';
import StorePerformanceTable from '../components/StorePerformanceTable';

const StorePerformance: React.FC = () => {
  const { performanceData, loading, error } = useStorePerformance();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="info">Loading performance data...</Alert>
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

  // Calculate summary metrics
  const totalRevenue = performanceData.reduce((sum, entry) => sum + (entry.acc || 0), 0);
  const totalUnits = performanceData.reduce((sum, entry) => sum + (entry.voiceLines || 0) + (entry.bts || 0) + (entry.t4b || 0), 0);
  const totalHints = performanceData.reduce((sum, entry) => sum + (entry.hint || 0), 0);
  const avgConversionRate = performanceData.length > 0 
    ? performanceData.reduce((sum, entry) => sum + ((entry.voiceLines || 0) / Math.max(entry.hint || 1, 1) * 100), 0) / performanceData.length 
    : 0;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Store Performance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and analyze store performance metrics
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  ${totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="secondary" sx={{ fontWeight: 700 }}>
                  {totalUnits.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Units Sold
                </Typography>
              </Box>
              <BarChartIcon sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {avgConversionRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Conversion Rate
                </Typography>
              </Box>
              <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                  {totalHints.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total HINT Units
                </Typography>
              </Box>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Details
          </Typography>
          <StorePerformanceTable />
        </CardContent>
      </Card>
    </>
  );
};

export default StorePerformance;