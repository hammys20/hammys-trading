// lib/data/inventory.ts
import { client } from "@/lib/data";

export type Item = {
  id: string;
  name: string;
  set?: string;
  condition?: string;
  certificationNumber?: string;
  gradingCompany?: string;
  grade?: string;
  language?: string;
  category?: string;
  price?: number;
  image?: string;
  images?: string[];
  tags?: string[];
  status?: string;
  pendingUntil?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInput = {
  id?: string;
  name: string;
  set?: string;
  condition?: string;
  certificationNumber?: string;
  gradingCompany?: string;
  grade?: string;
  language?: string;
  category?: string;
  price?: number;
  image?: string;
  images?: string[];
  tags?: string[];
  status?: string;
  pendingUntil?: string;
};

export type UpdateInput = Partial<CreateInput> & { id: string };

function unwrapList(res: any): Item[] {
  // Amplify Data returns: { data, errors, nextToken, ... }
  const data = res?.data;
  return Array.isArray(data) ? (data as Item[]) : [];
}

function unwrapGet(res: any): Item | null {
  // Amplify Data returns: { data, errors }
  const data = res?.data;
  return data ? (data as Item) : null;
}

// ✅ Public storefront (API key)
export async function listInventoryPublic(): Promise<Item[]> {
  const res = await (client as any).models.InventoryItem.list({ authMode: "apiKey" });
  return unwrapList(res);
}

export async function getInventoryItemPublic(id: string): Promise<Item | null> {
  const res = await (client as any).models.InventoryItem.get({ id }, { authMode: "apiKey" });
  return unwrapGet(res);
}

// ✅ Admin inventory (Cognito User Pool / Admin group enforced by schema)
export async function listInventoryAdmin(): Promise<Item[]> {
  const res = await (client as any).models.InventoryItem.list({ authMode: "userPool" });
  return unwrapList(res);
}

export async function getInventoryItemAdmin(id: string): Promise<Item | null> {
  const res = await (client as any).models.InventoryItem.get({ id }, { authMode: "userPool" });
  return unwrapGet(res);
}

// ⚠️ Amplify Gen2 TS quirk: cast payload to avoid index-signature typing bug
export async function createInventoryItem(input: CreateInput) {
  return (client as any).models.InventoryItem.create(input as any, { authMode: "userPool" });
}

export async function updateInventoryItem(input: UpdateInput) {
  return (client as any).models.InventoryItem.update(input as any, { authMode: "userPool" });
}

export async function deleteInventoryItem(id: string) {
  return (client as any).models.InventoryItem.delete({ id } as any, { authMode: "userPool" });
}
