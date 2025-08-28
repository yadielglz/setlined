import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useCustomers } from '../hooks/useCustomers';
import { useInteractions } from '../hooks/useInteractions';
import { useAppointments } from '../hooks/useAppointments';
import { useSchedule } from '../hooks/useSchedule';
import ModernWidget from '../components/ModernWidget';
import type { DashboardMetrics, ActivityItem } from '../types';

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

      // Generate recent activity (mock data for now - in real app would come from communications log)
      const recentActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'lead_created',
          title: 'New lead created',
          description: 'John Smith inquired about iPhone upgrade',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          userId: 'user1',
          userName: 'Sarah Johnson'
        },
        {
          id: '2',
          type: 'customer_added',
          title: 'Customer profile created',
          description: 'Jane Doe joined loyalty program',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          userId: 'user2',
          userName: 'Mike Chen'
        },
        {
          id: '3',
          type: 'appointment_scheduled',
          title: 'Appointment scheduled',
          description: 'Device consultation with Bob Wilson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          userId: 'user1',
          userName: 'Sarah Johnson'
        }
      ];

      setMetrics({
        totalCustomers,
        activeLeads,
        upcomingAppointments,
        conversionRate: Math.round(conversionRate),
        recentActivity
      });
    }
  }, [customers, interactions, appointments, customersLoading, interactionsLoading, appointmentsLoading]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead_created':
        return <TrendingUpIcon color="primary" />;
      case 'customer_added':
        return <PersonIcon color="success" />;
      case 'appointment_scheduled':
        return <CalendarIcon color="secondary" />;
      case 'lead_converted':
        return <CheckCircleIcon color="success" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead_created':
        return 'primary';
      case 'customer_added':
        return 'success';
      case 'appointment_scheduled':
        return 'secondary';
      case 'lead_converted':
        return 'success';
      default:
        return 'default';
    }
  };

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

      {/* Compact Activity & Stats Section */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '2fr 1fr'
        },
        gap: 2,
        mt: 2
      }}>
        {/* Recent Activity */}
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
              Recent Activity
            </Typography>
            <List dense>
              {metrics.recentActivity.slice(0, 3).map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: `${getActivityColor(activity.type)}.main` }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{activity.title}</Typography>}
                      secondary={
                        <>
                          <Typography variant="caption" color="text.secondary" component="span" display="block">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span" display="block">
                            {activity.timestamp.toLocaleString()} • {activity.userName}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={activity.type.replace('_', ' ')}
                      size="small"
                      color={getActivityColor(activity.type)}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </ListItem>
                  {index < Math.min(metrics.recentActivity.length, 3) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Current Schedule */}
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
                  .slice(0, 4) // Show only first 4 entries to keep it compact
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
              {getTodaySchedule().entries.length > 4 && (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                  +{getTodaySchedule().entries.length - 4} more shifts
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Dashboard;