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
import type { Lead, LeadForm, LeadFilters } from '../types';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
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

  // Fetch all leads for user's location
  const fetchLeads = async (filters?: LeadFilters) => {
    if (!userProfile?.locationId) return;

    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'leads'),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leadsData: Lead[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leadsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Lead);
      });

      // Apply filters
      let filteredLeads = leadsData;
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredLeads = filteredLeads.filter(lead =>
            lead.notes?.toLowerCase().includes(searchTerm) ||
            lead.source.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.status) {
          filteredLeads = filteredLeads.filter(lead =>
            lead.status === filters.status
          );
        }
        if (filters.priority) {
          filteredLeads = filteredLeads.filter(lead =>
            lead.priority === filters.priority
          );
        }
        if (filters.assignedTo) {
          filteredLeads = filteredLeads.filter(lead =>
            lead.assignedTo === filters.assignedTo
          );
        }
      }

      setLeads(filteredLeads);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for leads
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'leads'),
      where('locationId', '==', userProfile.locationId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leadsData: Lead[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leadsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Lead);
      });
      setLeads(leadsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in leads listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single lead
  const getLead = async (id: string): Promise<Lead | null> => {
    try {
      const docRef = doc(db, 'leads', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Lead;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting lead:', err);
      return null;
    }
  };

  // Create lead
  const createLead = async (leadData: LeadForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...leadData,
        nextFollowUp: convertToTimestamp(leadData.nextFollowUp),
        locationId: userProfile.locationId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'leads'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating lead:', err);
      throw err;
    }
  };

  // Update lead
  const updateLead = async (id: string, leadData: Partial<LeadForm>): Promise<void> => {
    try {
      const updateData: any = {
        ...leadData,
        updatedAt: Timestamp.now(),
      };

      if (leadData.nextFollowUp !== undefined) {
        updateData.nextFollowUp = convertToTimestamp(leadData.nextFollowUp);
      }

      await updateDoc(doc(db, 'leads', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating lead:', err);
      throw err;
    }
  };

  // Delete lead
  const deleteLead = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  // Get leads by customer
  const getLeadsByCustomer = async (customerId: string): Promise<Lead[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const q = query(
        collection(db, 'leads'),
        where('customerId', '==', customerId),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leadsData: Lead[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leadsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Lead);
      });

      return leadsData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting leads by customer:', err);
      return [];
    }
  };

  // Get leads by assigned user
  const getLeadsByAssignedUser = async (userId: string): Promise<Lead[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const q = query(
        collection(db, 'leads'),
        where('assignedTo', '==', userId),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leadsData: Lead[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leadsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Lead);
      });

      return leadsData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting leads by assigned user:', err);
      return [];
    }
  };

  return {
    leads,
    loading,
    error,
    fetchLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    getLeadsByCustomer,
    getLeadsByAssignedUser,
  };
};