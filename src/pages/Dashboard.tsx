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

      {/* Metrics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ minWidth: 280, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Customers</Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {metrics.totalCustomers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registered customers
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 280, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Leads</Typography>
            </Box>
            <Typography variant="h3" color="secondary">
              {metrics.activeLeads}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In progress
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 280, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Upcoming Appointments</Typography>
            </Box>
            <Typography variant="h3" color="success">
              {metrics.upcomingAppointments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next 7 days
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 280, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Conversion Rate</Typography>
            </Box>
            <Typography variant="h3" color="warning">
              {metrics.conversionRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lead to customer
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activity and Quick Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Card sx={{ flex: 2, minWidth: 500 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {metrics.recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.main` }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.timestamp.toLocaleString()} • {activity.userName}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={activity.type.replace('_', ' ')}
                      size="small"
                      color={getActivityColor(activity.type)}
                      variant="outlined"
                    />
                  </ListItem>
                  {index < metrics.recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">New Customers (30 days)</Typography>
                <Typography variant="body2" color="primary">
                  {customers.filter(c =>
                    c.createdAt && (Date.now() - c.createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000
                  ).length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Qualified Interactions</Typography>
                <Typography variant="body2" color="secondary">
                  {interactions.filter(i => i.status === 'qualified').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Completed Appointments</Typography>
                <Typography variant="body2" color="success">
                  {appointments.filter(a => a.status === 'completed').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Loyalty Members</Typography>
                <Typography variant="body2" color="warning">
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