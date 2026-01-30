// lib/data/inventory.ts
import { client } from "@/lib/data";

export type Item = {
  id: string;
  name: string;
  set?: string | null;
  number?: string | null;
  condition?: string | null;
  price?: number | null;
  image?: string | null;
  tags?: string[] | null;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateInput = {
  id?: string;
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

export type UpdateInput = Partial<CreateInput> & { id: string };

// ✅ Public storefront (API key)
export async function listInventoryPublic(): Promise<Item[]> {
  const res = (await (client as any).models.InventoryItem.list({
    authMode: "apiKey",
  })) as any;

  return Array.isArray(res?.data) ? (res.data as Item[]) : [];
}

// ✅ Admin inventory (Cognito User Pool / Admin group enforced by schema)
export async function listInventoryAdmin(): Promise<Item[]> {
  const res = (await (client as any).models.InventoryItem.list({
    authMode: "userPool",
  })) as any;

  return Array.isArray(res?.data) ? (res.data as Item[]) : [];
}

// ⚠️ Amplify Gen2 TS quirk: cast payload to avoid index-signature typing bug
export async function createInventoryItem(input: CreateInput) {
  return (client as any).models.InventoryItem.create(input as any, {
    authMode: "userPool",
  });
}

export async function updateInventoryItem(input: UpdateInput) {
  return (client as any).models.InventoryItem.update(input as any, {
    authMode: "userPool",
  });
}

export async function deleteInventoryItem(id: string) {
  return (client as any).models.InventoryItem.delete({ id } as any, {
    authMode: "userPool",
  });
}
