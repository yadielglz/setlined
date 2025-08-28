import { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useCustomers } from '../hooks/useCustomers';
import { useInteractions } from '../hooks/useInteractions';
import { useAppointments } from '../hooks/useAppointments';
import { useSchedule } from '../hooks/useSchedule';
import ModernWidget from '../components/ModernWidget';
import type { DashboardMetrics } from '../types';

const Dashboard = () => {
    const { customers, loading: customersLoading } = useCustomers();
    const { interactions, loading: interactionsLoading } = useInteractions();
    const { appointments, loading: appointmentsLoading } = useAppointments();
    const { getTodaySchedule } = useSchedule();

   const [metrics, setMetrics] = useState<DashboardMetrics>({
     totalCustomers: 0,
     activeLeads: 0,
     upcomingAppointments: 0,
     conversionRate: 0,
     recentActivity: []
   });

   // Note: recentActivity is kept for type compatibility but no longer used in UI

   useEffect(() => {
     if (!customersLoading && !interactionsLoading && !appointmentsLoading) {
       // Calculate metrics
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       const tomorrow = new Date(today);
       tomorrow.setDate(tomorrow.getDate() + 1);

       // Total customers created today only
       const totalCustomers = customers.filter(customer =>
         customer.createdAt &&
         customer.createdAt >= today &&
         customer.createdAt < tomorrow
       ).length;
       const activeLeads = interactions.filter(interaction =>
         interaction.status === 'new' || interaction.status === 'contacted' || interaction.status === 'qualified'
       ).length;

       const now = new Date();
       const nextWeek = new Date();
       nextWeek.setDate(now.getDate() + 7);

       const upcomingAppointments = appointments.filter(appointment =>
         appointment.scheduledDate &&
         appointment.scheduledDate >= now &&
         appointment.scheduledDate <= nextWeek &&
         appointment.status !== 'cancelled'
       ).length;

       const convertedLeads = interactions.filter(interaction => interaction.status === 'converted').length;
       const conversionRate = interactions.length > 0 ? (convertedLeads / interactions.length) * 100 : 0;

      setMetrics({
        totalCustomers,
        activeLeads,
        upcomingAppointments,
        conversionRate: Math.round(conversionRate),
        recentActivity: [] // No longer used in UI
      });
    }
  }, [customers, interactions, appointments, customersLoading, interactionsLoading, appointmentsLoading]);


  if (customersLoading || interactionsLoading || appointmentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Modern Clock Widget */}
      <Box sx={{ mb: 2 }}>
        <ModernWidget />
      </Box>

      {/* Metrics Cards - Optimized for Mobile */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 2,
        mb: 3
      }}>
        <Card sx={{ minHeight: 120 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.9rem' }}>Today's Customers</Typography>
            </Box>
            <Typography variant="h4" color="primary" sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {metrics.totalCustomers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Created Today
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 120 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="secondary" sx={{ mr: 1, fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.9rem' }}>Active Leads</Typography>
            </Box>
            <Typography variant="h4" color="secondary" sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {metrics.activeLeads}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              In progress
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 120 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon color="success" sx={{ mr: 1, fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.9rem' }}>Appointments</Typography>
            </Box>
            <Typography variant="h4" color="success" sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {metrics.upcomingAppointments}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Next 7 days
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 120 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon color="warning" sx={{ mr: 1, fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.9rem' }}>Conversion</Typography>
            </Box>
            <Typography variant="h4" color="warning" sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {metrics.conversionRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lead to customer
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Today's Schedule - Full Width */}
      <Box sx={{ mt: 2 }}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
              Today's Schedule
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(() => {
                const todaySchedule = getTodaySchedule();
                if (todaySchedule.entries.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      No shifts scheduled for today
                    </Typography>
                  );
                }
                return todaySchedule.entries
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((entry) => (
                    <Box key={entry.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={entry.shiftType}
                          size="small"
                          color={
                            entry.shiftType === 'open' ? 'success' :
                            entry.shiftType === 'close' ? 'warning' :
                            entry.shiftType === 'mgr' ? 'secondary' : 'info'
                          }
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                          {entry.employeeName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {entry.startTime} - {entry.endTime}
                      </Typography>
                    </Box>
                  ));
              })()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Dashboard;