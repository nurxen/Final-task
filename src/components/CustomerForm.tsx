import React, { useState, useEffect } from 'react';
import type { Customer } from '../types';
import './CustomerForm.css';

interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Omit<Customer, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    firstname: '',
    lastname: '',
    streetaddress: '',
    postcode: '',
    city: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstname: customer.firstname,
        lastname: customer.lastname,
        streetaddress: customer.streetaddress,
        postcode: customer.postcode,
        city: customer.city,
        email: customer.email,
        phone: customer.phone,
      });
    } else {
      setFormData({
        firstname: '',
        lastname: '',
        streetaddress: '',
        postcode: '',
        city: '',
        email: '',
        phone: '',
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">First Name *</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastname">Last Name *</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="streetaddress">Street Address *</label>
            <input
              type="text"
              id="streetaddress"
              name="streetaddress"
              value={formData.streetaddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="postcode">Postcode *</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {customer ? 'Update' : 'Add'} Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;