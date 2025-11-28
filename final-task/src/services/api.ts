import axios from 'axios';
import type { Customer, Training } from '../types';

const API_BASE_URL = 'https://customerrestservice-personaltraining.rahtiapp.fi';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerService = {
  getAll: () => api.get<Customer[]>('/api/customers'),
  getById: (id: number) => api.get<Customer>(`/api/customers/${id}`),
  create: (customer: Customer) => api.post<Customer>('/api/customers', customer),
  update: (id: number, customer: Customer) => api.put<Customer>(`/api/customers/${id}`, customer),
  delete: (id: number) => api.delete(`/api/customers/${id}`),
};

export const trainingService = {
  getAll: () => api.get<Training[]>('/api/trainings'),
  getById: (id: number) => api.get<Training>(`/api/trainings/${id}`),
  create: (training: Training) => api.post<Training>('/api/trainings', training),
  update: (id: number, training: Training) => api.put<Training>(`/api/trainings/${id}`, training),
  delete: (id: number) => api.delete(`/api/trainings/${id}`),
};