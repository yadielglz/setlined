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
import type { Customer, CustomerForm, CustomerFilters } from '../types';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  // Fetch all customers for user's location
  const fetchCustomers = async (filters?: CustomerFilters) => {
    if (!userProfile?.locationId) return;

    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'customers'),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const customersData: Customer[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        customersData.push({
          id: doc.id,
          ...data,
          dateOfBirth: convertTimestamp(data.dateOfBirth),
          lastVisitDate: convertTimestamp(data.lastVisitDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Customer);
      });

      // Apply filters
      let filteredCustomers = customersData;
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredCustomers = filteredCustomers.filter(customer =>
            customer.firstName.toLowerCase().includes(searchTerm) ||
            customer.lastName.toLowerCase().includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm) ||
            customer.phone?.includes(searchTerm)
          );
        }
        if (filters.customerType) {
          filteredCustomers = filteredCustomers.filter(customer =>
            customer.customerType === filters.customerType
          );
        }
      }

      setCustomers(filteredCustomers);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for customers
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'customers'),
      where('locationId', '==', userProfile.locationId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData: Customer[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        customersData.push({
          id: doc.id,
          ...data,
          dateOfBirth: convertTimestamp(data.dateOfBirth),
          lastVisitDate: convertTimestamp(data.lastVisitDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Customer);
      });
      setCustomers(customersData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in customers listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single customer
  const getCustomer = async (id: string): Promise<Customer | null> => {
    try {
      const docRef = doc(db, 'customers', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          dateOfBirth: convertTimestamp(data.dateOfBirth),
          lastVisitDate: convertTimestamp(data.lastVisitDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Customer;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting customer:', err);
      return null;
    }
  };

  // Create customer
  const createCustomer = async (customerData: CustomerForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...customerData,
        dateOfBirth: convertToTimestamp(customerData.dateOfBirth),
        lastVisitDate: null,
        loyaltyPoints: 0,
        totalPurchases: 0,
        createdBy: userProfile.uid,
        locationId: userProfile.locationId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'customers'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  // Update customer
  const updateCustomer = async (id: string, customerData: Partial<CustomerForm>): Promise<void> => {
    try {
      const updateData: any = {
        ...customerData,
        updatedAt: Timestamp.now(),
      };

      if (customerData.dateOfBirth !== undefined) {
        updateData.dateOfBirth = convertToTimestamp(customerData.dateOfBirth);
      }

      await updateDoc(doc(db, 'customers', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};