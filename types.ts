
export enum UserRoleType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  roleType: UserRoleType;
  roleId: string | null; // null for admins
}

export interface Customer {
  id: string;
  roleId: string;
  name: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string;
  roleId: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
}

export enum SaleStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID'
}

export interface Sale {
  id: string;
  roleId: string;
  customerId: string;
  productItems: {
    productId: string;
    quantity: number;
    priceAtSale: number;
  }[];
  date: string;
  discount: number;
  status: SaleStatus;
  totalCost: number;
  totalPrice: number;
}
