export interface Customer {
  id?: number;
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
}

export interface Training {
  id?: number;
  date: string;
  duration: number;
  activity: string;
  customer: string;
  customerName?: string;
}

// Tipos auxiliares para ordenamiento
export type SortableCustomerField = keyof Omit<Customer, 'id'>;
export type SortableTrainingField = keyof Omit<Training, 'id' | 'customer'>;