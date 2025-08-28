import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
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

  // Fetch all users from Firestore (user profiles)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const usersData: AppUser[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: doc.id,
          email: data.email,
          displayName: data.displayName || '',
          role: data.role || 'rep',
          locationId: data.locationId,
          isActive: data.isActive !== false, // Default to active
          emailVerified: data.emailVerified || false,
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

  // Create a new Firebase Auth user and their profile
  const createUser = async (userData: AppUserForm): Promise<string> => {
    if (!userData.password) {
      throw new Error('Password is required for new users');
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: userData.displayName,
      });

      // Create user profile in Firestore
      const userProfileData = {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        locationId: userData.locationId,
        isActive: userData.isActive,
        emailVerified: user.emailVerified,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'users'), userProfileData);

      await fetchUsers();
      return user.uid;
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw new Error(err.message);
    }
  };

  // Update user profile and role
  const updateUser = async (uid: string, userData: Partial<AppUserForm>): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', uid);

      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (userData.displayName !== undefined) updateData.displayName = userData.displayName;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.locationId !== undefined) updateData.locationId = userData.locationId;
      if (userData.isActive !== undefined) updateData.isActive = userData.isActive;

      await updateDoc(userDocRef, updateData);

      // If email is being updated, we would need admin privileges
      // This is a simplified version - in production you'd use Firebase Admin SDK

      await fetchUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      throw new Error(err.message);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (uid: string, currentStatus: boolean): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        isActive: !currentStatus,
        updatedAt: Timestamp.now(),
      });

      await fetchUsers();
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      throw new Error(err.message);
    }
  };

  // Send password reset email
  const resetUserPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Error sending password reset:', err);
      throw new Error(err.message);
    }
  };

  // Delete user (both Auth and Firestore)
  const deleteAppUser = async (uid: string): Promise<void> => {
    try {
      // Note: Deleting Firebase Auth users requires Admin SDK in production
      // This is a simplified version for development

      // Delete from Firestore first
      const userDocRef = doc(db, 'users', uid);
      await deleteDoc(userDocRef);

      // In production, you'd use Firebase Admin SDK to delete the Auth user
      // For now, we'll just remove the profile

      await fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      throw new Error(err.message);
    }
  };

  // Get users by role
  const getUsersByRole = (role: 'rep' | 'manager' | 'admin'): AppUser[] => {
    return users.filter(user => user.role === role);
  };

  // Get users by location
  const getUsersByLocation = (locationId: string): AppUser[] => {
    return users.filter(user => user.locationId === locationId);
  };

  // Get active users only
  const getActiveUsers = (): AppUser[] => {
    return users.filter(user => user.isActive);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    deleteAppUser,
    getUsersByRole,
    getUsersByLocation,
    getActiveUsers,
    refetch: fetchUsers,
  };
};