import React, { useState, useEffect } from 'react';
import type { Training, Customer, SortableTrainingField } from '../types';
import { trainingService, customerService } from '../services/api';
import dayjs from 'dayjs';
import './TrainingList.css';

const TrainingList: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortableTrainingField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trainingsResponse, customersResponse] = await Promise.all([
        trainingService.getAll(),
        customerService.getAll()
      ]);

      const trainingsData = trainingsResponse.data;
      const customersData = customersResponse.data;

      setCustomers(customersData);

      // Enriquecer los entrenamientos con los nombres de los clientes
      const enrichedTrainings = trainingsData.map(training => {
        const customerId = training.customer.split('/').pop();
        const customer = customersData.find(c => c.id?.toString() === customerId);
        return {
          ...training,
          customerName: customer ? `${customer.firstname} ${customer.lastname}` : 'Unknown Customer'
        };
      });

      setTrainings(enrichedTrainings);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading trainings');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar entrenamientos
  const filteredTrainings = trainings.filter(training =>
    training.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función de comparación para ordenamiento
  const compareValues = (a: Training, b: Training, field: SortableTrainingField): number => {
    let aValue = a[field];
    let bValue = b[field];

    // Convertir fechas a timestamps para comparación
    if (field === 'date') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    // Manejar valores undefined o null
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  };

  // Ordenar entrenamientos
  const sortedTrainings = [...filteredTrainings].sort((a, b) => {
    const comparison = compareValues(a, b, sortField);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortableTrainingField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortableTrainingField) => {
    if (field !== sortField) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD.MM.YYYY HH:mm');
  };

  if (loading) {
    return <div className="loading">Loading trainings...</div>;
  }

  return (
    <div className="training-list">
      <h2>Trainings</h2>
      
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search trainings by activity or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabla de entrenamientos */}
      <table className="trainings-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('date')}>
              Date {getSortIcon('date')}
            </th>
            <th onClick={() => handleSort('activity')}>
              Activity {getSortIcon('activity')}
            </th>
            <th onClick={() => handleSort('duration')}>
              Duration (min) {getSortIcon('duration')}
            </th>
            <th onClick={() => handleSort('customerName')}>
              Customer {getSortIcon('customerName')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTrainings.length === 0 ? (
            <tr>
              <td colSpan={4} className="no-data">
                No trainings found
              </td>
            </tr>
          ) : (
            sortedTrainings.map(training => (
              <tr key={training.id}>
                <td>{formatDate(training.date)}</td>
                <td>{training.activity}</td>
                <td>{training.duration}</td>
                <td>{training.customerName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TrainingList;