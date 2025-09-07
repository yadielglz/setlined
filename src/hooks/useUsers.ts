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
import type { AppUser, AppUserForm } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  // Convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };

  // Fetch all users for user's location (only admins and managers can see all users)
  const fetchUsers = async () => {
    if (!userProfile?.locationId || (userProfile.role !== 'admin' && userProfile.role !== 'manager')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, 'users'),
        where('locationId', '==', userProfile.locationId),
        orderBy('displayName', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const usersData: AppUser[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          locationId: data.locationId,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
          lastSignIn: convertTimestamp(data.lastSignIn),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt),
        } as AppUser);
      });

      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for users
  useEffect(() => {
    if (!userProfile?.locationId || (userProfile.role !== 'admin' && userProfile.role !== 'manager')) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('locationId', '==', userProfile.locationId),
      orderBy('displayName', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: AppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          locationId: data.locationId,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
          lastSignIn: convertTimestamp(data.lastSignIn),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt),
        } as AppUser);
      });
      setUsers(usersData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in users listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId, userProfile?.role]);

  // Get single user
  const getUser = async (id: string): Promise<AppUser | null> => {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          locationId: data.locationId,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
          lastSignIn: convertTimestamp(data.lastSignIn),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt),
        } as AppUser;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting user:', err);
      return null;
    }
  };

  // Create user (admin only)
  const createUser = async (userData: AppUserForm): Promise<string> => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Only administrators can create users');
    }

    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...userData,
        locationId: userProfile.locationId,
        createdBy: userProfile.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'users'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating user:', err);
      throw err;
    }
  };

  // Update user (admin and manager can update)
  const updateUser = async (id: string, userData: Partial<AppUserForm>): Promise<void> => {
    if (userProfile?.role !== 'admin' && userProfile?.role !== 'manager') {
      throw new Error('Only administrators and managers can update users');
    }

    try {
      const updateData: any = {
        ...userData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'users', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating user:', err);
      throw err;
    }
  };

  // Delete user (admin only)
  const deleteUser = async (id: string): Promise<void> => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Only administrators can delete users');
    }

    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  // Get users by role
  const getUsersByRole = async (role: 'rep' | 'manager' | 'admin'): Promise<AppUser[]> => {
    if (!userProfile?.locationId || (userProfile.role !== 'admin' && userProfile.role !== 'manager')) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'users'),
        where('locationId', '==', userProfile.locationId),
        where('role', '==', role),
        orderBy('displayName', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const usersData: AppUser[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          locationId: data.locationId,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
          lastSignIn: convertTimestamp(data.lastSignIn),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt),
        } as AppUser);
      });

      return usersData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting users by role:', err);
      return [];
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
  };
};