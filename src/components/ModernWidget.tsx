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

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

const ModernWidget: React.FC = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>({
    icon: <SunnyIcon sx={{ fontSize: 48 }} />,
    label: 'Loading...',
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

  // Fetch real weather data
  const fetchWeather = async (latitude: number, longitude: number) => {
    const apiKey = import.meta.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setWeatherError('Weather API key not configured');
      setWeatherLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        location: data.name,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed)
      };

      setWeatherData(weatherData);
      setWeatherError(null);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeatherError('Failed to load weather data');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Get user's location and fetch weather - only on user interaction
  const requestLocation = () => {
    if (navigator.geolocation) {
      setWeatherLoading(true);
      setWeatherError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setWeatherError('Location access denied - using default location');
          // Fallback to a default location (New York City)
          fetchWeather(40.7128, -74.0060);
        }
      );
    } else {
      setWeatherError('Geolocation not supported - using default location');
      // Fallback to a default location (New York City)
      fetchWeather(40.7128, -74.0060);
    }
  };

  // Try to get location on mount, but handle permission gracefully
  useEffect(() => {
    // Use a timeout to avoid immediate geolocation request on page load
    const timer = setTimeout(() => {
      requestLocation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update weather condition based on real weather data
  useEffect(() => {
    if (!weatherData) return;

    const hour = currentTime.getHours();
    let condition: WeatherCondition;

    // Map OpenWeatherMap conditions to our icons and colors
    switch (weatherData.condition.toLowerCase()) {
      case 'clear':
        condition = {
          icon: <SunnyIcon sx={{ fontSize: 48 }} />,
          label: hour >= 6 && hour < 18 ? 'Sunny' : 'Clear Night',
          color: '#FFA500',
          bgColor: 'rgba(255, 165, 0, 0.15)'
        };
        break;
      case 'clouds':
        condition = {
          icon: <CloudIcon sx={{ fontSize: 48 }} />,
          label: 'Cloudy',
          color: '#87CEEB',
          bgColor: 'rgba(135, 206, 235, 0.15)'
        };
        break;
      case 'rain':
      case 'drizzle':
        condition = {
          icon: <RainIcon sx={{ fontSize: 48 }} />,
          label: 'Rainy',
          color: '#4169E1',
          bgColor: 'rgba(65, 105, 225, 0.15)'
        };
        break;
      case 'snow':
        condition = {
          icon: <SnowIcon sx={{ fontSize: 48 }} />,
          label: 'Snowy',
          color: '#F0F8FF',
          bgColor: 'rgba(240, 248, 255, 0.15)'
        };
        break;
      case 'thunderstorm':
        condition = {
          icon: <RainIcon sx={{ fontSize: 48 }} />,
          label: 'Stormy',
          color: '#4B0082',
          bgColor: 'rgba(75, 0, 130, 0.15)'
        };
        break;
      case 'mist':
      case 'fog':
        condition = {
          icon: <CloudIcon sx={{ fontSize: 48 }} />,
          label: 'Foggy',
          color: '#A9A9A9',
          bgColor: 'rgba(169, 169, 169, 0.15)'
        };
        break;
      default:
        condition = {
          icon: <SunnyIcon sx={{ fontSize: 48 }} />,
          label: weatherData.condition,
          color: '#FFA500',
          bgColor: 'rgba(255, 165, 0, 0.15)'
        };
    }

    setWeatherCondition(condition);
  }, [weatherData, currentTime]);

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
                animation: weatherLoading ? 'none' : 'pulse 2s ease-in-out infinite'
              }}
            >
              {weatherLoading ? (
                <Typography variant="h6" sx={{ fontSize: '2rem' }}>...</Typography>
              ) : (
                weatherCondition.icon
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {weatherLoading ? 'Loading...' : weatherError ? 'Weather Error' : weatherCondition.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {weatherLoading ? 'Getting location...' :
                   weatherError ? weatherError :
                   weatherData ? weatherData.location : 'Local Weather'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Chip
            label={weatherLoading ? '...' :
                   weatherError ? 'N/A' :
                   weatherData ? `${weatherData.temperature}°F` : 'N/A'}
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