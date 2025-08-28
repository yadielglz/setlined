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
import type { SchedulingEmployee, SchedulingEmployeeForm } from '../types';

export const useSchedulingEmployees = () => {
  const [employees, setEmployees] = useState<SchedulingEmployee[]>([]);
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

  // Fetch all scheduling employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, 'schedulingEmployees'), orderBy('lastName', 'asc'));

      // Apply location filter if user has a location
      if (userProfile?.locationId) {
        q = query(q, where('locationId', '==', userProfile.locationId));
      }

      const querySnapshot = await getDocs(q);
      const employeesData: SchedulingEmployee[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as SchedulingEmployee);
      });

      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching scheduling employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for scheduling employees
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'schedulingEmployees'),
      where('locationId', '==', userProfile.locationId),
      orderBy('lastName', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const employeesData: SchedulingEmployee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as SchedulingEmployee);
      });
      setEmployees(employeesData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in scheduling employees listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single scheduling employee
  const getEmployee = async (id: string): Promise<SchedulingEmployee | null> => {
    try {
      const docRef = doc(db, 'schedulingEmployees', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate) || new Date(),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date(),
        } as SchedulingEmployee;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting scheduling employee:', err);
      return null;
    }
  };

  // Create scheduling employee
  const createEmployee = async (employeeData: SchedulingEmployeeForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...employeeData,
        hireDate: convertToTimestamp(employeeData.hireDate),
        locationId: userProfile.locationId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'schedulingEmployees'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating scheduling employee:', err);
      throw err;
    }
  };

  // Update scheduling employee
  const updateEmployee = async (id: string, employeeData: SchedulingEmployeeForm): Promise<void> => {
    try {
      const updateData: any = {
        ...employeeData,
        hireDate: convertToTimestamp(employeeData.hireDate),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'schedulingEmployees', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating scheduling employee:', err);
      throw err;
    }
  };

  // Delete scheduling employee
  const deleteEmployee = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'schedulingEmployees', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting scheduling employee:', err);
      throw err;
    }
  };

  // Get active employees only
  const getActiveEmployees = (): SchedulingEmployee[] => {
    return employees.filter(employee => employee.isActive);
  };

  // Get employee by ID
  const getEmployeeById = (id: string): SchedulingEmployee | undefined => {
    return employees.find(employee => employee.id === id);
  };

  // Get employee full name
  const getEmployeeFullName = (id: string): string => {
    const employee = getEmployeeById(id);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getActiveEmployees,
    getEmployeeById,
    getEmployeeFullName,
  };
};