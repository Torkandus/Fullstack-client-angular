/**
 * PurchaseOrderItem - container class for purchase order item
 */
export interface PurchaseOrderItem {
  id: number;
  poid: number;
  productid: string;
  qty: number;
  price: number;
}
