// lib/data/inventory.ts
import { client } from "@/lib/data";

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
export async function listInventoryPublic() {
  const res = await client.models.InventoryItem.list({ authMode: "apiKey" });
  return (res?.data ?? []) as any[];
}

// ✅ Admin inventory (Cognito User Pool / Admin group enforced by schema)
export async function listInventoryAdmin() {
  const res = await client.models.InventoryItem.list({ authMode: "userPool" });
  return (res?.data ?? []) as any[];
}

// ⚠️ Amplify Gen2 TS quirk: cast payload to avoid index-signature typing bug
export async function createInventoryItem(input: CreateInput) {
  return client.models.InventoryItem.create(input as any, {
    authMode: "userPool",
  });
}

export async function updateInventoryItem(input: UpdateInput) {
  return client.models.InventoryItem.update(input as any, {
    authMode: "userPool",
  });
}

export async function deleteInventoryItem(id: string) {
  return client.models.InventoryItem.delete({ id } as any, {
    authMode: "userPool",
  });
}

// // lib/data/inventory.ts
// import { client } from "@/lib/data";

// // Public storefront (API key)
// export async function listInventoryPublic() {
//   return client.models.InventoryItem.list({ authMode: "apiKey" });
// }

// // Admin inventory (Cognito user pool; Admin group enforced by schema)
// export async function listInventoryAdmin() {
//   return client.models.InventoryItem.list({ authMode: "userPool" });
// }

// type CreateInput = {
//   id?: string;
//   name: string;
//   set?: string;
//   number?: string;
//   condition?: string;
//   price?: number;
//   image?: string;
//   tags?: string[];
//   description?: string;
//   status?: string;
// };

// type UpdateInput = CreateInput & { id: string };

// export async function createInventoryItem(input: CreateInput) {
//   return client.models.InventoryItem.create(input, { authMode: "userPool" });
// }

// export async function updateInventoryItem(input: UpdateInput) {
//   return client.models.InventoryItem.update(input, { authMode: "userPool" });
// }

// export async function deleteInventoryItem(id: string) {
//   return client.models.InventoryItem.delete({ id }, { authMode: "userPool" });
// }

