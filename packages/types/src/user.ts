export type UserRole = "customer" | "admin" | "operator";

export interface Profile {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  province?: string | null;
  postalCode?: string | null;
  isDefault: boolean;
  createdAt: Date;
}
