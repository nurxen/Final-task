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
  trainings?: Training[]; // opcional si quieres enlazar entrenamientos al cliente
}

export interface Training {
  id?: number;
  date: string;
  duration: number;
  activity: string;
  customer?: Customer | string; // puede ser solo el href o un objeto completo
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
export type SortableTrainingField = keyof Omit<Training, 'id' | 'customer' | '_links'>;
