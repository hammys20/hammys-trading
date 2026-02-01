// lib/data/orders.ts
import { client } from "@/lib/data";
import type { Order } from "@/lib/data/inventory";

function unwrapList(res: any): Order[] {
  const data = res?.data;
  return Array.isArray(data) ? (data as Order[]) : [];
}

export async function listOrdersAdmin(): Promise<Order[]> {
  const res = await (client as any).models.Order.list({ authMode: "userPool" });
  return unwrapList(res);
}

export async function updateOrderAdmin(input: Partial<Order> & { id: string }) {
  return (client as any).models.Order.update(input as any, { authMode: "userPool" });
}
