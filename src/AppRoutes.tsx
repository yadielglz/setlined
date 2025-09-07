import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Interactions from './pages/Interactions';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Calendar from './pages/Calendar';
import StorePerformance from './pages/StorePerformance';
import ScheduleManagement from './pages/ScheduleManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import Layout from './components/Layout';
import Login from './components/Login';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
           <Route path="/" element={<Dashboard />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/interactions" element={<Interactions />} />
           <Route path="/customers" element={<Customers />} />
           <Route path="/employees" element={<Employees />} />
           <Route path="/calendar" element={<Calendar />} />
           <Route path="/store-performance" element={<StorePerformance />} />
           <Route path="/schedule-management" element={<ScheduleManagement />} />
           <Route path="/employee-management" element={<EmployeeManagement />} />
         </Routes>
      </Box>
    </Layout>
  );
};

export default AppRoutes;