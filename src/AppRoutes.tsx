import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Leads from './pages/Leads.tsx';
import Customers from './pages/Customers.tsx';
import Calendar from './pages/Calendar.tsx';
import Layout from './components/Layout.tsx';
import Login from './components/Login.tsx';

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
          <Route path="/leads" element={<Leads />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </Box>
    </Layout>
  );
};

export default AppRoutes;