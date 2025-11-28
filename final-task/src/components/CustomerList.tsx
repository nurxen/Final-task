import React, { useState, useEffect } from 'react';
import type { Customer, SortableCustomerField } from '../types';
import { customerService } from '../services/api';
import './CustomerList.css';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortableCustomerField>('lastname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
      // En un entorno real, mostraríamos un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes basado en el término de búsqueda
  const filteredCustomers = customers.filter(customer =>
    customer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función de comparación para ordenamiento
  const compareValues = (a: Customer, b: Customer, field: SortableCustomerField): number => {
    let aValue = a[field];
    let bValue = b[field];

    // Manejar valores undefined o null
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  };

  // Ordenar clientes
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const comparison = compareValues(a, b, sortField);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortableCustomerField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortableCustomerField) => {
    if (field !== sortField) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customer-list">
      <h2>Customers</h2>
      
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search customers by name, email, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="search-info">
          Showing {sortedCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Tabla de clientes */}
      <table className="customers-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('firstname')}>
              First Name {getSortIcon('firstname')}
            </th>
            <th onClick={() => handleSort('lastname')}>
              Last Name {getSortIcon('lastname')}
            </th>
            <th onClick={() => handleSort('email')}>
              Email {getSortIcon('email')}
            </th>
            <th onClick={() => handleSort('phone')}>
              Phone {getSortIcon('phone')}
            </th>
            <th onClick={() => handleSort('city')}>
              City {getSortIcon('city')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCustomers.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-data">
                No customers found
              </td>
            </tr>
          ) : (
            sortedCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.firstname}</td>
                <td>{customer.lastname}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.city}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;