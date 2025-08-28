import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Employee, EmployeeForm } from '../types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        hireDate: doc.data().hireDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Employee[];
      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: EmployeeForm) => {
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...employeeData,
        hireDate: new Date(employeeData.hireDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await fetchEmployees();
      return docRef.id;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateEmployee = async (id: string, employeeData: EmployeeForm) => {
    try {
      const docRef = doc(db, 'employees', id);
      await updateDoc(docRef, {
        ...employeeData,
        hireDate: new Date(employeeData.hireDate),
        updatedAt: new Date(),
      });
      await fetchEmployees();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
      await fetchEmployees();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const toggleEmployeeStatus = async (id: string, currentStatus: Employee['status']) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const docRef = doc(db, 'employees', id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      await fetchEmployees();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    refetch: fetchEmployees,
  };
};