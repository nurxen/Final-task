import React, { useState, useEffect } from 'react';
import type { Training, Customer } from '../types';
import { customerService } from '../services/api';
import './TrainingForm.css';

interface TrainingFormProps {
  onSave: (training: Omit<Training, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ onSave, onCancel, isOpen }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<Omit<Training, 'id'>>({
    date: new Date().toISOString().slice(0, 16),
    duration: 60,
    activity: '',
    customer: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      setFormData({
        date: new Date().toISOString().slice(0, 16),
        duration: 60,
        activity: '',
        customer: ''
      });
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data._embedded.customers);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('Error loading customers');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer) {
      alert('Please select a customer');
      return;
    }

    // Convert date to ISO string format expected by API
    const trainingData = {
      ...formData,
      date: new Date(formData.date).toISOString()
    };

    onSave(trainingData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Training</h2>
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <label htmlFor="customer">Customer *</label>
            <select
              id="customer"
              name="customer"
              value={formData.customer as string}
              onChange={handleChange}
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option 
                  key={customer.id} 
                  value={customer._links?.self.href}
                >
                  {customer.firstname} {customer.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date and Time *</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="activity">Activity *</label>
            <input
              type="text"
              id="activity"
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              placeholder="e.g., Running, Swimming, Gym"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Training
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingForm;