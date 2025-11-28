import axios from 'axios';
import type { Customer, Training } from '../types';

const API_BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerService = {
  getAll: () => api.get<Customer[]>('customers'),
  getById: (id: number) => api.get<Customer>(`customers/${id}`),
  create: (customer: Customer) => api.post<Customer>('customers', customer),
  update: (id: number, customer: Customer) => api.put<Customer>(`customers/${id}`, customer),
  delete: (id: number) => api.delete(`customers/${id}`),
};

export const trainingService = {
  getAll: () => api.get<Training[]>('trainings'),
  getById: (id: number) => api.get<Training>(`trainings/${id}`),
  create: (training: Training) => api.post<Training>('trainings', training),
  update: (id: number, training: Training) => api.put<Training>(`trainings/${id}`, training),
  delete: (id: number) => api.delete(`trainings/${id}`),
};