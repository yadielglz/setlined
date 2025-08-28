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
import type { Interaction, InteractionForm, InteractionFilters } from '../types';

export const useInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
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

  // Fetch all interactions for user's location
  const fetchInteractions = async (filters?: InteractionFilters) => {
    if (!userProfile?.locationId) return;

    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'interactions'),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const interactionsData: Interaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interactionsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Interaction);
      });

      // Apply filters
      let filteredInteractions = interactionsData;
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredInteractions = filteredInteractions.filter(interaction =>
            interaction.notes?.toLowerCase().includes(searchTerm) ||
            interaction.source.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.status) {
          filteredInteractions = filteredInteractions.filter(interaction =>
            interaction.status === filters.status
          );
        }
        if (filters.priority) {
          filteredInteractions = filteredInteractions.filter(interaction =>
            interaction.priority === filters.priority
          );
        }
        if (filters.assignedTo) {
          filteredInteractions = filteredInteractions.filter(interaction =>
            interaction.assignedTo === filters.assignedTo
          );
        }
      }

      setInteractions(filteredInteractions);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching interactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for interactions
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'interactions'),
      where('locationId', '==', userProfile.locationId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const interactionsData: Interaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interactionsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Interaction);
      });
      setInteractions(interactionsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in interactions listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single interaction
  const getInteraction = async (id: string): Promise<Interaction | null> => {
    try {
      const docRef = doc(db, 'interactions', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Interaction;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting interaction:', err);
      return null;
    }
  };

  // Create interaction
  const createInteraction = async (interactionData: InteractionForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...interactionData,
        nextFollowUp: convertToTimestamp(interactionData.nextFollowUp),
        locationId: userProfile.locationId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'interactions'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating interaction:', err);
      throw err;
    }
  };

  // Update interaction
  const updateInteraction = async (id: string, interactionData: Partial<InteractionForm>): Promise<void> => {
    try {
      const updateData: any = {
        ...interactionData,
        updatedAt: Timestamp.now(),
      };

      if (interactionData.nextFollowUp !== undefined) {
        updateData.nextFollowUp = convertToTimestamp(interactionData.nextFollowUp);
      }

      await updateDoc(doc(db, 'interactions', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating interaction:', err);
      throw err;
    }
  };

  // Delete interaction
  const deleteInteraction = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'interactions', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting interaction:', err);
      throw err;
    }
  };

  // Get interactions by customer
  const getInteractionsByCustomer = async (customerId: string): Promise<Interaction[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const q = query(
        collection(db, 'interactions'),
        where('customerId', '==', customerId),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const interactionsData: Interaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interactionsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Interaction);
      });

      return interactionsData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting interactions by customer:', err);
      return [];
    }
  };

  // Get interactions by assigned user
  const getInteractionsByAssignedUser = async (userId: string): Promise<Interaction[]> => {
    if (!userProfile?.locationId) return [];

    try {
      const q = query(
        collection(db, 'interactions'),
        where('assignedTo', '==', userId),
        where('locationId', '==', userProfile.locationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const interactionsData: Interaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interactionsData.push({
          id: doc.id,
          ...data,
          nextFollowUp: convertTimestamp(data.nextFollowUp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Interaction);
      });

      return interactionsData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting interactions by assigned user:', err);
      return [];
    }
  };

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    getInteraction,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionsByCustomer,
    getInteractionsByAssignedUser,
  };
};