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
import ModernWidget from '../components/ModernWidget';
import type { DashboardMetrics, ActivityItem } from '../types';

const Dashboard = () => {
    const { customers, loading: customersLoading } = useCustomers();
    const { interactions, loading: interactionsLoading } = useInteractions();
    const { appointments, loading: appointmentsLoading } = useAppointments();

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
       const totalCustomers = customers.length;
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
              <Typography variant="subtitle1" sx={{ fontSize: '0.9rem' }}>Total Customers</Typography>
            </Box>
            <Typography variant="h4" color="primary" sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {metrics.totalCustomers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registered
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

        {/* Quick Stats */}
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>New Customers (30d)</Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  {customers.filter(c =>
                    c.createdAt && (Date.now() - c.createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000
                  ).length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Qualified Leads</Typography>
                <Typography variant="body2" color="secondary" sx={{ fontWeight: 600 }}>
                  {interactions.filter(i => i.status === 'qualified').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Completed Appts</Typography>
                <Typography variant="body2" color="success" sx={{ fontWeight: 600 }}>
                  {appointments.filter(a => a.status === 'completed').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Loyalty Members</Typography>
                <Typography variant="body2" color="warning" sx={{ fontWeight: 600 }}>
                  {customers.filter(c => c.customerType === 'loyalty').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Dashboard;