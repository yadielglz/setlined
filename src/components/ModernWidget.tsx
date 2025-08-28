import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  Today as CalendarIcon
} from '@mui/icons-material';

const ModernWidget: React.FC = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,255,255,0.95) 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ClockIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {getGreeting()}!
          </Typography>
        </Box>

        {/* Clock */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              color: theme.palette.primary.main,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              mb: 1
            }}
          >
            {formatTime(currentTime)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {formatDate(currentTime)}
            </Typography>
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Time Zone: EST
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated: Live
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModernWidget;