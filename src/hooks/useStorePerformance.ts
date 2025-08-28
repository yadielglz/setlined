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
  const [metrics, setMetrics] = useState<StorePerformanceMetrics[]>([]);
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

  // Fetch all store performance metrics for user's location
  const fetchMetrics = async () => {
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
      const metricsData: StorePerformanceMetrics[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        metricsData.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as StorePerformanceMetrics);
      });

      setMetrics(metricsData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching store performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for store performance metrics
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
      const metricsData: StorePerformanceMetrics[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        metricsData.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as StorePerformanceMetrics);
      });
      setMetrics(metricsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in store performance listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single metric
  const getMetric = async (id: string): Promise<StorePerformanceMetrics | null> => {
    try {
      const docRef = doc(db, 'storePerformance', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: convertTimestamp(data.date) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as StorePerformanceMetrics;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting store performance metric:', err);
      return null;
    }
  };

  // Create store performance metric
  const createMetric = async (metricData: StorePerformanceForm): Promise<void> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...metricData,
        date: convertToTimestamp(metricData.date),
        locationId: userProfile.locationId,
        createdBy: userProfile.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'storePerformance'), docData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating store performance metric:', err);
      throw err;
    }
  };

  // Update store performance metric
  const updateMetric = async (id: string, metricData: StorePerformanceForm): Promise<void> => {
    try {
      const updateData: any = {
        ...metricData,
        date: convertToTimestamp(metricData.date),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'storePerformance', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating store performance metric:', err);
      throw err;
    }
  };

  // Delete store performance metric
  const deleteMetric = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'storePerformance', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting store performance metric:', err);
      throw err;
    }
  };

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    getMetric,
    createMetric,
    updateMetric,
    deleteMetric,
  };
};