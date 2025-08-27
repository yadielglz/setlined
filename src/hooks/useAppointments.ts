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
import type { Appointment, AppointmentForm, AppointmentFilters } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

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

  // Fetch all appointments for user's location
  const fetchAppointments = async (filters?: AppointmentFilters) => {
    if (!userProfile?.locationId) return;

    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'appointments'),
        where('locationId', '==', userProfile.locationId),
        orderBy('scheduledDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: Appointment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          ...data,
          scheduledDate: convertTimestamp(data.scheduledDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Appointment);
      });

      // Apply filters
      let filteredAppointments = appointmentsData;
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredAppointments = filteredAppointments.filter(appointment =>
            appointment.title.toLowerCase().includes(searchTerm) ||
            appointment.description?.toLowerCase().includes(searchTerm) ||
            appointment.notes?.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.status) {
          filteredAppointments = filteredAppointments.filter(appointment =>
            appointment.status === filters.status
          );
        }
        if (filters.assignedTo) {
          filteredAppointments = filteredAppointments.filter(appointment =>
            appointment.assignedTo === filters.assignedTo
          );
        }
      }

      setAppointments(filteredAppointments);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for appointments
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('locationId', '==', userProfile.locationId),
      orderBy('scheduledDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          ...data,
          scheduledDate: convertTimestamp(data.scheduledDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Appointment);
      });
      setAppointments(appointmentsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in appointments listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single appointment
  const getAppointment = async (id: string): Promise<Appointment | null> => {
    try {
      const docRef = doc(db, 'appointments', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          scheduledDate: convertTimestamp(data.scheduledDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Appointment;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting appointment:', err);
      return null;
    }
  };

  // Create appointment
  const createAppointment = async (appointmentData: AppointmentForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...appointmentData,
        scheduledDate: convertToTimestamp(appointmentData.scheduledDate),
        locationId: userProfile.locationId,
        status: 'scheduled',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'appointments'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating appointment:', err);
      throw err;
    }
  };

  // Update appointment
  const updateAppointment = async (id: string, appointmentData: Partial<AppointmentForm>): Promise<void> => {
    try {
      const updateData: any = {
        ...appointmentData,
        updatedAt: Timestamp.now(),
      };

      if (appointmentData.scheduledDate !== undefined) {
        updateData.scheduledDate = convertToTimestamp(appointmentData.scheduledDate);
      }

      await updateDoc(doc(db, 'appointments', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating appointment:', err);
      throw err;
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting appointment:', err);
      throw err;
    }
  };

  // Get appointments by date range
  const getAppointmentsByDateRange = async (startDate: Date, endDate: Date): Promise<Appointment[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const q = query(
        collection(db, 'appointments'),
        where('locationId', '==', userProfile.locationId),
        where('scheduledDate', '>=', startTimestamp),
        where('scheduledDate', '<=', endTimestamp),
        orderBy('scheduledDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: Appointment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          ...data,
          scheduledDate: convertTimestamp(data.scheduledDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Appointment);
      });

      return appointmentsData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting appointments by date range:', err);
      return [];
    }
  };

  // Get appointments by assigned user
  const getAppointmentsByAssignedUser = async (userId: string): Promise<Appointment[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const q = query(
        collection(db, 'appointments'),
        where('assignedTo', '==', userId),
        where('locationId', '==', userProfile.locationId),
        orderBy('scheduledDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: Appointment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          ...data,
          scheduledDate: convertTimestamp(data.scheduledDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Appointment);
      });

      return appointmentsData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting appointments by assigned user:', err);
      return [];
    }
  };

  // Get upcoming appointments (next 7 days)
  const getUpcomingAppointments = async (days: number = 7): Promise<Appointment[]> => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return getAppointmentsByDateRange(startDate, endDate);
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDateRange,
    getAppointmentsByAssignedUser,
    getUpcomingAppointments,
  };
};