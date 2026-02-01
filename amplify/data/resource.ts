import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

/**
 * Auth strategy:
 * - Public storefront reads: API Key (no identity pool / federated JWT required)
 * - Admin inventory management: Cognito User Pool group "Admin" (full CRUD)
 *
 * After changing this file, run:
 *   npx ampx sandbox
 *   npx ampx generate outputs
 */

const schema = a.schema({
  InventoryItem: a
    .model({
      id: a.id(),
      name: a.string().required(),
      set: a.string(),
      condition: a.string(),
      certificationNumber: a.string(),
      gradingCompany: a.string(),
      grade: a.string(),
      language: a.string(),
      category: a.string(),
      price: a.float(),
      image: a.string(),
      images: a.string().array(),
      tags: a.string().array(),

      // Keep as string for now (prevents Enum serialization errors from old data)
      status: a.string(),
      pendingUntil: a.datetime(),

      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // ✅ Public storefront read via API key
      // ⚠️ TEMPORARY: allow updates via API key for webhook/checkout writes
      allow.publicApiKey().to(["read", "update"]),

      // ✅ Admin group can do full CRUD
      allow.groups(["Admin"]).to(["create", "read", "update", "delete"]),
    ]),
  Order: a
    .model({
      id: a.id(),
      stripeSessionId: a.string(),
      status: a.string(),
      buyerEmail: a.string(),
      buyerName: a.string(),
      shippingAddress: a.string(),
      itemsJson: a.string(),
      total: a.float(),
      currency: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // ⚠️ TEMPORARY: allow create via API key for webhook
      allow.publicApiKey().to(["create"]),
      allow.groups(["Admin"]).to(["create", "read", "update", "delete"]),
    ]),
});

/** ✅ THIS IS THE MISSING PIECE */
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,

  // ✅ Enable API key auth so authMode: "apiKey" works in the app
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
