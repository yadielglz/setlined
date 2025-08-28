import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useSchedule } from '../hooks/useSchedule';
import type { DailySchedule } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ScheduleDisplay: React.FC = () => {
  const { getCurrentWeekSchedule, loading } = useSchedule();
  const [tabValue, setTabValue] = useState(0);

  const weeklySchedule = getCurrentWeekSchedule();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return 'success';
      case 'afternoon': return 'warning';
      case 'evening': return 'info';
      case 'night': return 'error';
      default: return 'default';
    }
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading schedule...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Current Schedule</Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="schedule tabs">
            {weeklySchedule.dailySchedules.map((day, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption">{getDayName(day.date)}</Typography>
                    <Typography variant="body2">{getDateDisplay(day.date)}</Typography>
                    <Chip
                      label={`${day.activeShifts} shifts`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {weeklySchedule.dailySchedules.map((day, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {day.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${day.totalEmployees} employees`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={`${day.activeShifts} shifts`}
                    color="secondary"
                    size="small"
                  />
                </Box>
              </Box>

              {day.entries.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    No shifts scheduled for this day
                  </Typography>
                </Paper>
              ) : (
                <List>
                  {day.entries
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((entry, entryIndex) => (
                      <React.Fragment key={entry.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {entry.employeeName}
                                </Typography>
                                <Chip
                                  label={entry.shiftType}
                                  size="small"
                                  color={getShiftTypeColor(entry.shiftType)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                  </Typography>
                                </Box>
                                {entry.locationId && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {entry.locationId}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {entry.notes && (
                          <Box sx={{ ml: 7, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Note: {entry.notes}
                            </Typography>
                          </Box>
                        )}
                        {entryIndex < day.entries.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                </List>
              )}
            </Box>
          </TabPanel>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScheduleDisplay;