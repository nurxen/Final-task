import axios from 'axios';
import type { Customer, Training, CustomersResponse, TrainingsResponse } from '../types';
import { extractIdFromUrl } from '../types';

const API_BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerService = {
  getAll: () => api.get<CustomersResponse>('/api/customers'),
  getById: (id: number) => api.get<Customer>(`/api/customers/${id}`),
  create: (customer: Omit<Customer, 'id'>) => api.post<Customer>('/api/customers', customer),
  update: (id: number, customer: Omit<Customer, 'id'>) => api.put<Customer>(`/api/customers/${id}`, customer),
  delete: (id: number) => api.delete(`/api/customers/${id}`),
};

export const trainingService = {
  getAll: () => api.get<TrainingsResponse>('/api/trainings'),
  getById: (id: number) => api.get<Training>(`/api/trainings/${id}`),
  create: (training: Omit<Training, 'id'>) => api.post<Training>('/api/trainings', training),
  update: (id: number, training: Omit<Training, 'id'>) => api.put<Training>(`/api/trainings/${id}`, training),
  delete: (id: number) => api.delete(`/api/trainings/${id}`),
  
  // Nueva función para eliminar usando la URL completa
  deleteByUrl: (url: string) => {
    const id = extractIdFromUrl(url);
    if (id) {
      return api.delete(`/api/trainings/${id}`);
    }
    throw new Error('Invalid training URL');
  }
};

export const resetService = {
  reset: () => api.post<string>('/reset')
};