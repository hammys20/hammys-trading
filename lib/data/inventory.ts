// lib/data/inventory.ts
import { client } from "@/lib/data";

/** Shared item shape used by UI */
export type Item = {
  id: string;
  name: string;
  set?: string;
  number?: string;
  condition?: string;
  price?: number;
  image?: string;
  tags?: string[];
  description?: string;
  status?: string;
};

export type CreateInput = Omit<Item, "id"> & { id?: string };
export type UpdateInput = Partial<CreateInput> & { id: string };

// --- INTERNAL helper (avoids Amplify Gen2 TS model issues)
function model() {
  return (client as any).models.InventoryItem;
}

/** Public storefront list (API key) */
export async function listInventoryPublic(): Promise<Item[]> {
  const res = await model().list({ authMode: "apiKey" });
  return Array.isArray(res?.data) ? (res.data as Item[]) : [];
}

/** Admin list (Cognito user pool) */
export async function listInventoryAdmin(): Promise<Item[]> {
  const res = await model().list({ authMode: "userPool" });
  return Array.isArray(res?.data) ? (res.data as Item[]) : [];
}

/** Public single item fetch */
export async function getInventoryItemPublic(id: string): Promise<Item | null> {
  const res = await model().get({ id }, { authMode: "apiKey" });
  return (res?.data ?? null) as Item | null;
}

/** Admin create */
export async function createInventoryItem(input: CreateInput) {
  return model().create(input as any, { authMode: "userPool" });
}

/** Admin update */
export async function updateInventoryItem(input: UpdateInput) {
  return model().update(input as any, { authMode: "userPool" });
}

/** Admin delete */
export async function deleteInventoryItem(id: string) {
  return model().delete({ id } as any, { authMode: "userPool" });
}
