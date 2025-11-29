import React, { useState, useEffect } from 'react';
import type { Customer, SortableCustomerField } from '../types';
import { customerService } from '../services/api';
import { extractIdFromUrl } from '../types';
import CustomerForm from './CustomerForm';
import './CustomerList.css';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortableCustomerField>('lastname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getAll();
      const customersData = response.data._embedded.customers;
      
      const customersWithIds = customersData.map(customer => {
      let customerId: number | undefined = customer.id;
      
      if (!customerId && customer._links?.self?.href) {
          const extractedId = extractIdFromUrl(customer._links.self.href);
          customerId = extractedId ?? undefined; // Convierte null a undefined
      }
      
      return {
          ...customer,
          id: customerId // Ya es number | undefined
      };
      });
      
      setCustomers(customersWithIds);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    let customerId: number | undefined = customer.id; // Explícitamente define el tipo
    
    if (!customerId && customer._links?.self?.href) {
        const extractedId = extractIdFromUrl(customer._links.self.href);
        customerId = extractedId ?? undefined; // Convierte null a undefined
    }
    
    if (!customerId) {
        console.error('Customer ID is missing and cannot be extracted from URL');
        alert('Cannot delete customer: ID is missing');
        return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to delete customer ${customer.firstname} ${customer.lastname}?`
    );
    
    if (confirmed) {
      try {
        setError(null);
        console.log('Deleting customer with ID:', customerId);
        await customerService.delete(customerId);
        await loadCustomers(); // Reload the list
        alert('Customer deleted successfully');
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        
        // Si falla con el ID, intentar con la URL
        if (customer._links?.self?.href) {
          try {
            console.log('Trying to delete using URL:', customer._links.self.href);
            // Hacer DELETE directamente a la URL
            await fetch(customer._links.self.href, { method: 'DELETE' });
            await loadCustomers(); // Reload the list
            alert('Customer deleted successfully');
            return;
          } catch (secondError) {
            console.error('Error deleting customer with URL:', secondError);
          }
        }
        
        const errorMessage = error.response?.data?.message || 'Error deleting customer';
        setError(errorMessage);
        alert(`Failed to delete customer: ${errorMessage}`);
      }
    }
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      setError(null);
      if (editingCustomer && editingCustomer.id) {
        await customerService.update(editingCustomer.id, customerData);
        alert('Customer updated successfully');
      } else {
        await customerService.create(customerData);
        alert('Customer added successfully');
      }
      setShowForm(false);
      setEditingCustomer(null);
      await loadCustomers(); // Reload the list
    } catch (error: any) {
      console.error('Error saving customer:', error);
      const errorMessage = error.response?.data?.message || 'Error saving customer';
      setError(errorMessage);
      alert(`Failed to save customer: ${errorMessage}`);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleResetDatabase = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the database? This will delete all current data and restore demo data.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/reset', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Database reset successfully! Loading demo data...');
        // Recargar la página después de un breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert('Error resetting database');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error resetting database');
    }
  };

  // Función para exportar a CSV
  const handleExportCSV = () => {
    // Filtrar solo los datos que queremos exportar (sin columnas de acciones)
    const dataToExport = customers.map(customer => ({
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phone: customer.phone,
      streetaddress: customer.streetaddress,
      postcode: customer.postcode,
      city: customer.city
    }));

    // Crear cabeceras CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Street Address', 'Postcode', 'City'];
    const csvHeaders = headers.join(',');

    // Crear filas CSV
    const csvRows = dataToExport.map(customer => 
      [
        `"${customer.firstname}"`,
        `"${customer.lastname}"`,
        `"${customer.email}"`,
        `"${customer.phone}"`,
        `"${customer.streetaddress}"`,
        `"${customer.postcode}"`,
        `"${customer.city}"`
      ].join(',')
    );

    // Combinar cabeceras y filas
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Customers exported to CSV successfully!');
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
    if (field === sortField) {
      return sortDirection === 'asc' ? '↑' : '↓';
    } else {
      return '↑↓';
    }
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customer-list">
      <h2>Customers</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary" onClick={handleAddCustomer}>
            Add Customer
          </button>
          
          <button className="btn btn-export" onClick={handleExportCSV}>
            Export to CSV
          </button>
          
          <button className="btn btn-reset" onClick={handleResetDatabase}>
            Reset Database
          </button>
        </div>
        
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCustomers.length === 0 ? (
            <tr>
              <td colSpan={6} className="no-data">
                No customers found
              </td>
            </tr>
          ) : (
            sortedCustomers.map(customer => (
              <tr key={customer.id || customer._links?.self.href}>
                <td>{customer.firstname}</td>
                <td>{customer.lastname}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.city}</td>
                <td className="actions">
                  <button 
                    className="btn btn-edit"
                    onClick={() => handleEditCustomer(customer)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDeleteCustomer(customer)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Formulario de cliente */}
      <CustomerForm
        customer={editingCustomer || undefined}
        onSave={handleSaveCustomer}
        onCancel={handleCancelForm}
        isOpen={showForm}
      />
    </div>
  );
};

export default CustomerList;