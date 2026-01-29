import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

// Public client (read-only storefront)
const publicClient = generateClient<Schema>({ authMode: "apiKey" });

// Admin client (writes + admin reads)
const adminClient = generateClient<Schema>({ authMode: "userPool" });

function throwIfErrors(op: string, errors?: any[]) {
  if (errors && errors.length) {
    const msg = errors.map((e) => e?.message ?? String(e)).join(" | ");
    throw new Error(`${op} failed: ${msg}`);
  }
}

/** Public storefront inventory list (read-only) */
export async function listInventoryPublic() {
  const res = await publicClient.models.InventoryItem.list({ limit: 500 });
  throwIfErrors("listInventoryPublic", (res as any).errors);
  return res.data;
}

/** Backwards compatible alias so existing imports don't break */
export const listInventory = listInventoryPublic;

/** Admin list (uses userPool tokens) */
export async function listInventoryAdmin() {
  const res = await adminClient.models.InventoryItem.list({ limit: 500 });
  throwIfErrors("listInventoryAdmin", (res as any).errors);
  return res.data;
}

/** Admin create */
export async function createInventoryItem(input: {
  name: string;
  price?: number;
  status?: string;
  image?: string;
  description?: string;
}) {
  const res = await adminClient.models.InventoryItem.create({
    ...input,
    status: input.status ?? "Available",
  });
  throwIfErrors("createInventoryItem", (res as any).errors);
  if (!res.data) throw new Error("createInventoryItem failed: no data returned");
  return res.data;
}

/** Admin update */
export async function updateInventoryItem(
  id: string,
  updates: Partial<{
    status: string;
    price: number;
    image: string;
    description: string;
    name: string;
  }>
) {
  const res = await adminClient.models.InventoryItem.update({ id, ...updates });
  throwIfErrors("updateInventoryItem", (res as any).errors);
  if (!res.data) throw new Error("updateInventoryItem failed: no data returned");
  return res.data;
}

/** Admin delete */
export async function deleteInventoryItem(id: string) {
  const res = await adminClient.models.InventoryItem.delete({ id });
  throwIfErrors("deleteInventoryItem", (res as any).errors);
  return res.data;
}
