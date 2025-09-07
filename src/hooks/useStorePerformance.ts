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
import type { StorePerformanceMetrics, StorePerformanceForm } from '../types';

export const useStorePerformance = () => {
  const [performanceData, setPerformanceData] = useState<StorePerformanceMetrics[]>([]);
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

  // Fetch all performance data for user's location
  const fetchPerformanceData = async () => {
    if (!userProfile?.locationId) return;

    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, 'storePerformance'),
        where('locationId', '==', userProfile.locationId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const performanceDataArray: StorePerformanceMetrics[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        performanceDataArray.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as StorePerformanceMetrics);
      });

      setPerformanceData(performanceDataArray);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for performance data
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'storePerformance'),
      where('locationId', '==', userProfile.locationId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const performanceDataArray: StorePerformanceMetrics[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        performanceDataArray.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as StorePerformanceMetrics);
      });
      setPerformanceData(performanceDataArray);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in performance data listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single performance entry
  const getPerformanceEntry = async (id: string): Promise<StorePerformanceMetrics | null> => {
    try {
      const docRef = doc(db, 'storePerformance', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as StorePerformanceMetrics;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting performance entry:', err);
      return null;
    }
  };

  // Create performance entry
  const createPerformanceEntry = async (entryData: StorePerformanceForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...entryData,
        date: convertToTimestamp(entryData.date),
        locationId: userProfile.locationId,
        createdBy: userProfile.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'storePerformance'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating performance entry:', err);
      throw err;
    }
  };

  // Update performance entry
  const updatePerformanceEntry = async (id: string, entryData: Partial<StorePerformanceForm>): Promise<void> => {
    try {
      const updateData: any = {
        ...entryData,
        updatedAt: Timestamp.now(),
      };

      if (entryData.date !== undefined) {
        updateData.date = convertToTimestamp(entryData.date);
      }

      await updateDoc(doc(db, 'storePerformance', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating performance entry:', err);
      throw err;
    }
  };

  // Delete performance entry
  const deletePerformanceEntry = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'storePerformance', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting performance entry:', err);
      throw err;
    }
  };

  // Get performance data by date range
  const getPerformanceByDateRange = async (startDate: Date, endDate: Date): Promise<StorePerformanceMetrics[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const q = query(
        collection(db, 'storePerformance'),
        where('locationId', '==', userProfile.locationId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const performanceDataArray: StorePerformanceMetrics[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        performanceDataArray.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as StorePerformanceMetrics);
      });

      return performanceDataArray;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting performance by date range:', err);
      return [];
    }
  };

  // Get performance data for a specific date
  const getPerformanceByDate = async (date: Date): Promise<StorePerformanceMetrics | null> => {
    if (!userProfile?.locationId) return null;

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'storePerformance'),
        where('locationId', '==', userProfile.locationId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as StorePerformanceMetrics;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting performance by date:', err);
      return null;
    }
  };

  // Calculate totals for a date range
  const calculateTotals = (startDate?: Date, endDate?: Date): {
    totalVoiceLines: number;
    totalBTS: number;
    totalT4B: number;
    totalACC: number;
    totalHINT: number;
  } => {
    let dataToCalculate = performanceData;

    if (startDate && endDate) {
      dataToCalculate = performanceData.filter(entry =>
        entry.date && entry.date >= startDate && entry.date <= endDate
      );
    }

    return dataToCalculate.reduce(
      (totals, entry) => ({
        totalVoiceLines: totals.totalVoiceLines + entry.voiceLines,
        totalBTS: totals.totalBTS + entry.bts,
        totalT4B: totals.totalT4B + entry.t4b,
        totalACC: totals.totalACC + entry.acc,
        totalHINT: totals.totalHINT + entry.hint,
      }),
      {
        totalVoiceLines: 0,
        totalBTS: 0,
        totalT4B: 0,
        totalACC: 0,
        totalHINT: 0,
      }
    );
  };

  return {
    performanceData,
    loading,
    error,
    fetchPerformanceData,
    getPerformanceEntry,
    createPerformanceEntry,
    updatePerformanceEntry,
    deletePerformanceEntry,
    getPerformanceByDateRange,
    getPerformanceByDate,
    calculateTotals,
  };
};