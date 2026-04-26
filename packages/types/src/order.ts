export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "stripe" | "bank_transfer" | "cash_on_delivery";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingDistrict: string;
  shippingProvince?: string | null;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string | null;
  bankTransferReference?: string | null;
  paidAt?: Date | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: Date | null;
  deliveredAt?: Date | null;
  customerNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingProvince?: string;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    sku?: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
  }[];
  customerNote?: string;
}
