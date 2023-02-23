import { PurchaseOrderItem } from './purchaseorder-item';
/**
 * PurchaseOrder - interface for purchase order
 */
export interface PurchaseOrder {
  id: number;
  vendorid: number;
  amount: number;
  podate?: string;
  items: PurchaseOrderItem[];
}
