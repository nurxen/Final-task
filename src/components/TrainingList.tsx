import React, { useState, useEffect } from 'react';
import type { Training, Customer, SortableTrainingField } from '../types';
import { trainingService, customerService } from '../services/api';
import { extractIdFromUrl } from '../types';
import TrainingForm from './TrainingForm';
import dayjs from 'dayjs';
import './TrainingList.css';

const TrainingList: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortableTrainingField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [trainingsResponse, customersResponse] = await Promise.all([
        trainingService.getAll(),
        customerService.getAll()
      ]);

      const trainingsData = trainingsResponse.data._embedded.trainings;
      const customersData = customersResponse.data._embedded.customers;

      setCustomers(customersData);

      const enrichedTrainings = await Promise.all(
        trainingsData.map(async (training: any) => {
          let customerName = "Unknown Customer";

          // Extraer el ID del training de la URL si no está presente
          let trainingId = training.id;
          if (!trainingId && training._links?.self?.href) {
            trainingId = extractIdFromUrl(training._links.self.href);
          }

          if (training._links?.customer?.href) {
            const href = training._links.customer.href;
            try {
              const response = await fetch(href);
              if (response.ok) {
                const customer = await response.json();
                customerName = `${customer.firstname} ${customer.lastname}`;
              }
            } catch (error) {
              console.error("Error fetching customer data:", error);
            }
          }

          return {
            ...training,
            id: trainingId,
            customerName,
          };
        })
      );

      setTrainings(enrichedTrainings);
    } catch (error: any) {
      console.error("Error loading data:", error);
      const errorMessage = error.response?.data?.message || 'Error loading trainings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTraining = () => {
    setShowForm(true);
  };

  const handleDeleteTraining = async (training: Training) => {
    let trainingId: number | undefined = training.id;
    
    if (!trainingId && training._links?.self?.href) {
        const extractedId = extractIdFromUrl(training._links.self.href);
        trainingId = extractedId ?? undefined; // Convierte null a undefined
    }
    
    if (!trainingId) {
        console.error('Training ID is missing and cannot be extracted from URL');
        alert('Cannot delete training: ID is missing');
        return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to delete this training (${training.activity})?`
    );
    
    if (confirmed) {
      try {
        setError(null);
        console.log('Deleting training with ID:', trainingId);
        await trainingService.delete(trainingId);
        await loadData(); // Reload the list
        alert('Training deleted successfully');
      } catch (error: any) {
        console.error('Error deleting training:', error);
        
        // Si falla con el ID, intentar con la URL
        if (training._links?.self?.href) {
          try {
            console.log('Trying to delete using URL:', training._links.self.href);
            // Hacer DELETE directamente a la URL
            await fetch(training._links.self.href, { method: 'DELETE' });
            await loadData(); // Reload the list
            alert('Training deleted successfully');
            return;
          } catch (secondError) {
            console.error('Error deleting training with URL:', secondError);
          }
        }
        
        const errorMessage = error.response?.data?.message || 'Error deleting training';
        setError(errorMessage);
        alert(`Failed to delete training: ${errorMessage}`);
      }
    }
  };

  const handleSaveTraining = async (trainingData: Omit<Training, 'id'>) => {
    try {
      setError(null);
      await trainingService.create(trainingData);
      setShowForm(false);
      await loadData(); // Reload the list
      alert('Training added successfully');
    } catch (error: any) {
      console.error('Error saving training:', error);
      const errorMessage = error.response?.data?.message || 'Error saving training';
      setError(errorMessage);
      alert(`Failed to save training: ${errorMessage}`);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
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

  // Filtrar entrenamientos
  const filteredTrainings = trainings.filter(training =>
    training.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para ordenar
  const compareValues = (a: Training, b: Training, field: SortableTrainingField): number => {
    let aValue = a[field];
    let bValue = b[field];

    // Manejar fecha como timestamp
    if (field === 'date') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    // Evitar problemas con undefined
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  };

  // Lista ordenada
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
    if (field === sortField) {
      return sortDirection === 'asc' ? '↑' : '↓';
    } else {
      return '↑↓';
    }
  };

  const formatDate = (dateString: string) =>
    dayjs(dateString).format('DD.MM.YYYY HH:mm');

  if (loading) {
    return <div className="loading">Loading trainings...</div>;
  }

  return (
    <div className="training-list">
      <h2>Trainings</h2>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleAddTraining}>
          Add Training
        </button>
        
        <button className="btn btn-reset" onClick={handleResetDatabase}>
          Reset Database
        </button>
        
        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search trainings by activity or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-info">
            Showing {sortedTrainings.length} of {trainings.length} trainings
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="trainings-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
            <th onClick={() => handleSort('activity')}>Activity {getSortIcon('activity')}</th>
            <th onClick={() => handleSort('duration')}>Duration (min) {getSortIcon('duration')}</th>
            <th>Customer</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedTrainings.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-data">No trainings found</td>
            </tr>
          ) : (
            sortedTrainings.map(training => (
              <tr key={training.id || training._links?.self.href}>
                <td>{formatDate(training.date)}</td>
                <td>{training.activity}</td>
                <td>{training.duration}</td>
                <td>{training.customerName}</td>
                <td className="actions">
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDeleteTraining(training)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Training Form */}
      <TrainingForm
        onSave={handleSaveTraining}
        onCancel={handleCancelForm}
        isOpen={showForm}
      />
    </div>
  );
};

export default TrainingList;