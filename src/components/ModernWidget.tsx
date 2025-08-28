import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Grain as RainIcon,
  AcUnit as SnowIcon,
  WbTwilight as TwilightIcon,
  NightsStay as NightIcon,
  AccessTime as ClockIcon,
  Today as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface WeatherCondition {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const ModernWidget: React.FC = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>({
    icon: <SunnyIcon sx={{ fontSize: 48 }} />,
    label: 'Sunny',
    color: '#FFA500',
    bgColor: 'rgba(255, 165, 0, 0.1)'
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate weather changes based on time of day and season
  useEffect(() => {
    const hour = currentTime.getHours();
    const month = currentTime.getMonth();

    // Seasonal weather patterns
    const isWinter = month >= 11 || month <= 2;
    const isSummer = month >= 6 && month <= 8;

    // Time-based weather simulation
    let condition: WeatherCondition;

    if (hour >= 6 && hour < 12) {
      // Morning
      if (isSummer) {
        condition = {
          icon: <SunnyIcon sx={{ fontSize: 48 }} />,
          label: 'Sunny Morning',
          color: '#FFA500',
          bgColor: 'rgba(255, 165, 0, 0.15)'
        };
      } else if (isWinter) {
        condition = {
          icon: <CloudIcon sx={{ fontSize: 48 }} />,
          label: 'Cloudy Morning',
          color: '#87CEEB',
          bgColor: 'rgba(135, 206, 235, 0.15)'
        };
      } else {
        condition = {
          icon: <TwilightIcon sx={{ fontSize: 48 }} />,
          label: 'Pleasant Morning',
          color: '#98FB98',
          bgColor: 'rgba(152, 251, 152, 0.15)'
        };
      }
    } else if (hour >= 12 && hour < 18) {
      // Afternoon
      if (isSummer) {
        condition = {
          icon: <SunnyIcon sx={{ fontSize: 48 }} />,
          label: 'Hot & Sunny',
          color: '#FF6347',
          bgColor: 'rgba(255, 99, 71, 0.15)'
        };
      } else if (isWinter) {
        condition = {
          icon: <CloudIcon sx={{ fontSize: 48 }} />,
          label: 'Cool Afternoon',
          color: '#4682B4',
          bgColor: 'rgba(70, 130, 180, 0.15)'
        };
      } else {
        condition = {
          icon: <SunnyIcon sx={{ fontSize: 48 }} />,
          label: 'Warm Afternoon',
          color: '#FFD700',
          bgColor: 'rgba(255, 215, 0, 0.15)'
        };
      }
    } else if (hour >= 18 && hour < 22) {
      // Evening
      condition = {
        icon: <TwilightIcon sx={{ fontSize: 48 }} />,
        label: 'Beautiful Evening',
        color: '#FF69B4',
        bgColor: 'rgba(255, 105, 180, 0.15)'
      };
    } else {
      // Night
      condition = {
        icon: <NightIcon sx={{ fontSize: 48 }} />,
        label: 'Peaceful Night',
        color: '#4B0082',
        bgColor: 'rgba(75, 0, 130, 0.15)'
      };
    }

    // Random weather events (simulated)
    const randomEvent = Math.random();
    if (randomEvent < 0.1 && (hour >= 8 && hour <= 20)) {
      // 10% chance of rain during daytime
      condition = {
        icon: <RainIcon sx={{ fontSize: 48 }} />,
        label: 'Light Rain',
        color: '#4169E1',
        bgColor: 'rgba(65, 105, 225, 0.15)'
      };
    } else if (randomEvent < 0.05 && isWinter) {
      // 5% chance of snow in winter
      condition = {
        icon: <SnowIcon sx={{ fontSize: 48 }} />,
        label: 'Snowy',
        color: '#F0F8FF',
        bgColor: 'rgba(240, 248, 255, 0.15)'
      };
    }

    setWeatherCondition(condition);
  }, [currentTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ClockIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {getGreeting()}!
          </Typography>
        </Box>

        {/* Clock */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h2"
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
            <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {formatDate(currentTime)}
            </Typography>
          </Box>
        </Box>

        {/* Weather Widget */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 2,
            background: weatherCondition.bgColor,
            border: `1px solid ${weatherCondition.color}20`,
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                color: weatherCondition.color,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              {weatherCondition.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {weatherCondition.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Local Weather
                </Typography>
              </Box>
            </Box>
          </Box>

          <Chip
            label={`${Math.floor(Math.random() * 20) + 60}°F`}
            sx={{
              bgcolor: weatherCondition.color,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: 60
            }}
          />
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Time Zone: EST
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Updated: Live
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModernWidget;