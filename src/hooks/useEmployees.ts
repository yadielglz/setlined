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
import type { Employee, EmployeeForm } from '../types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  // Fetch all employees for user's location
  const fetchEmployees = async () => {
    if (!userProfile?.locationId) return;

    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, 'employees'),
        where('locationId', '==', userProfile.locationId),
        orderBy('firstName', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const employeesData: Employee[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Employee);
      });

      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for employees
  useEffect(() => {
    if (!userProfile?.locationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'employees'),
      where('locationId', '==', userProfile.locationId),
      orderBy('firstName', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const employeesData: Employee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Employee);
      });
      setEmployees(employeesData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      console.error('Error in employees listener:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.locationId]);

  // Get single employee
  const getEmployee = async (id: string): Promise<Employee | null> => {
    try {
      const docRef = doc(db, 'employees', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Employee;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting employee:', err);
      return null;
    }
  };

  // Create employee
  const createEmployee = async (employeeData: EmployeeForm): Promise<string> => {
    if (!userProfile?.locationId) {
      throw new Error('User location not found');
    }

    try {
      const docData = {
        ...employeeData,
        hireDate: convertToTimestamp(employeeData.hireDate),
        locationId: userProfile.locationId,
        createdBy: userProfile.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'employees'), docData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating employee:', err);
      throw err;
    }
  };

  // Update employee
  const updateEmployee = async (id: string, employeeData: Partial<EmployeeForm>): Promise<void> => {
    try {
      const updateData: any = {
        ...employeeData,
        updatedAt: Timestamp.now(),
      };

      if (employeeData.hireDate !== undefined) {
        updateData.hireDate = convertToTimestamp(employeeData.hireDate);
      }

      await updateDoc(doc(db, 'employees', id), updateData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating employee:', err);
      throw err;
    }
  };

  // Delete employee
  const deleteEmployee = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting employee:', err);
      throw err;
    }
  };

  // Get employee by employee ID
  const getEmployeeByEmployeeId = async (employeeId: string): Promise<Employee | null> => {
    if (!userProfile?.locationId) return null;

    try {
      const q = query(
        collection(db, 'employees'),
        where('employeeId', '==', employeeId),
        where('locationId', '==', userProfile.locationId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          hireDate: convertTimestamp(data.hireDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Employee;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting employee by employee ID:', err);
      return null;
    }
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
    getEmployeeByEmployeeId,
  };
};