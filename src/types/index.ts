export interface Link {
  href: string;
}

export interface CustomerLinks {
  self: Link;
  customer: Link;
  trainings: Link;
}

export interface TrainingLinks {
  self: Link;
  training: Link;
  customer: Link;
}

export interface Customer {
  id?: number;
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  _links?: CustomerLinks;
  trainings?: Training[];
}

export interface Training {
  id?: number;
  date: string;
  duration: number;
  activity: string;
  customer?: Customer | string;
  customerName?: string;
  _links?: TrainingLinks;
}

export interface CustomersResponse {
  _embedded: {
    customers: Customer[];
  };
  _links: {
    self: Link;
    profile: Link;
  };
}

export interface TrainingsResponse {
  _embedded: {
    trainings: Training[];
  };
  _links: {
    self: Link;
    profile: Link;
  };
}

// Tipos auxiliares para ordenamiento
export type SortableCustomerField = keyof Omit<Customer, 'id' | 'trainings' | '_links'>;
export type SortableTrainingField = keyof Omit<Training, 'id' | 'customer' | '_links' | 'customerName'>;

// Función helper para extraer ID de la URL
export const extractIdFromUrl = (url: string): number | null => {
  try {
    const parts = url.split('/');
    const id = parseInt(parts[parts.length - 1]);
    return isNaN(id) ? null : id;
  } catch {
    return null;
  }
};