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
      price: a.float(),
      image: a.string(),
      tags: a.string().array(),

      // Keep as string for now (prevents Enum serialization errors from old data)
      status: a.string(),
      pendingUntil: a.datetime(),

      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // ✅ Public storefront read via API key
      allow.publicApiKey().to(["read"]),

      // ✅ Admin group can do full CRUD
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



