import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSchedulingEmployees } from './useSchedulingEmployees';
import type { ScheduleEntry, ScheduleForm, ScheduleFilters, DailySchedule, WeeklySchedule } from '../types';

export const useSchedule = () => {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { getEmployeeFullName, employees } = useSchedulingEmployees();

  // Convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };

  // Convert Date to Firestore timestamp
  const convertToTimestamp = (date: Date | string | undefined): Timestamp | null => {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return Timestamp.fromDate(dateObj);
  };

  // Fetch all schedule entries
  const fetchScheduleEntries = async (filters?: ScheduleFilters) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, 'schedule'), orderBy('date', 'asc'));

      // Apply location filter if user has a location
      if (userProfile?.locationId) {
        q = query(q, where('locationId', '==', userProfile.locationId));
      }

      const querySnapshot = await getDocs(q);
      const entriesData: ScheduleEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Resolve employee name with better fallback
        let employeeName = 'Unknown Employee';
        if (data.employeeId) {
          const resolvedName = getEmployeeFullName(data.employeeId);
          if (resolvedName !== 'Unknown Employee') {
            employeeName = resolvedName;
          } else if (data.employeeName) {
            // Fallback to stored employee name if available
            employeeName = data.employeeName;
          }
        }

        entriesData.push({
          id: doc.id,
          ...data,
          employeeName,
          date: convertTimestamp(data.date) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as ScheduleEntry);
      });

      // Apply additional filters
      let filteredEntries = entriesData;
      if (filters) {
        if (filters.employeeId) {
          filteredEntries = filteredEntries.filter(entry => entry.employeeId === filters.employeeId);
        }
        if (filters.dateRange) {
          filteredEntries = filteredEntries.filter(entry =>
            entry.date >= filters.dateRange!.start && entry.date <= filters.dateRange!.end
          );
        }
        if (filters.shiftType) {
          filteredEntries = filteredEntries.filter(entry => entry.shiftType === filters.shiftType);
        }
        if (filters.locationId) {
          filteredEntries = filteredEntries.filter(entry => entry.locationId === filters.locationId);
        }
      }

      setScheduleEntries(filteredEntries);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching schedule entries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for schedule entries
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'schedule'),
      where('locationId', '==', userProfile.locationId),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: ScheduleEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Resolve employee name with better fallback
        let employeeName = 'Unknown Employee';
        if (data.employeeId) {
          const resolvedName = getEmployeeFullName(data.employeeId);
          if (resolvedName !== 'Unknown Employee') {
            employeeName = resolvedName;
          } else if (data.employeeName) {
            // Fallback to stored employee name if available
            employeeName = data.employeeName;
          }
        }

        entriesData.push({
          id: doc.id,
          ...data,
          employeeName,
          date: convertTimestamp(data.date) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as ScheduleEntry);
      });
      setScheduleEntries(entriesData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in schedule listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId, employees, getEmployeeFullName]);

  // Get single schedule entry
  const getScheduleEntry = async (id: string): Promise<ScheduleEntry | null> => {
    try {
      const docRef = doc(db, 'schedule', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Resolve employee name with better fallback
        let employeeName = 'Unknown Employee';
        if (data.employeeId) {
          const resolvedName = getEmployeeFullName(data.employeeId);
          if (resolvedName !== 'Unknown Employee') {
            employeeName = resolvedName;
          } else if (data.employeeName) {
            // Fallback to stored employee name if available
            employeeName = data.employeeName;
          }
        }

        return {
          id: docSnap.id,
          ...data,
          employeeName,
          date: convertTimestamp(data.date) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as ScheduleEntry;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting schedule entry:', err);
      return null;
    }
  };

  // Create schedule entry
  const createScheduleEntry = async (entryData: ScheduleForm): Promise<void> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...entryData,
        employeeName: getEmployeeFullName(entryData.employeeId),
        date: convertToTimestamp(entryData.date),
        locationId: userProfile.locationId,
        createdBy: userProfile.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'schedule'), docData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating schedule entry:', err);
      throw err;
    }
  };

  // Update schedule entry
  const updateScheduleEntry = async (id: string, entryData: ScheduleForm): Promise<void> => {
    try {
      const updateData: any = {
        ...entryData,
        employeeName: getEmployeeFullName(entryData.employeeId),
        date: convertToTimestamp(entryData.date),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'schedule', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating schedule entry:', err);
      throw err;
    }
  };

  // Delete schedule entry
  const deleteScheduleEntry = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'schedule', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting schedule entry:', err);
      throw err;
    }
  };

  // Get current week's schedule
  const getCurrentWeekSchedule = (): WeeklySchedule => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    const dailySchedules: DailySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const dayEntries = scheduleEntries.filter(entry =>
        entry.date.toDateString() === date.toDateString() && entry.isActive
      );

      dailySchedules.push({
        date,
        entries: dayEntries,
        totalEmployees: new Set(dayEntries.map(e => e.employeeId)).size,
        activeShifts: dayEntries.length
      });
    }

    return {
      weekStart,
      weekEnd,
      dailySchedules
    };
  };

  // Get today's schedule
  const getTodaySchedule = (): DailySchedule => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = scheduleEntries.filter(entry =>
      entry.date.toDateString() === today.toDateString() && entry.isActive
    );

    return {
      date: today,
      entries: todayEntries,
      totalEmployees: new Set(todayEntries.map(e => e.employeeId)).size,
      activeShifts: todayEntries.length
    };
  };

  return {
    scheduleEntries,
    loading,
    error,
    fetchScheduleEntries,
    getScheduleEntry,
    createScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    getCurrentWeekSchedule,
    getTodaySchedule,
  };
};