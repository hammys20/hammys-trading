import { a, defineData } from "@aws-amplify/backend";

/**
 * Auth strategy:
 * - Public storefront reads: API Key (no identity pool / federated JWT required)
 * - Admin inventory management: Cognito User Pool group "Admin" (full CRUD)
 *
 * After changing this file, run:
 *   npx ampx sandbox
 *   npx ampx generate outputs
 */

export const data = defineData({
  schema: a.schema({
    InventoryItem: a
      .model({
        id: a.id(),
        name: a.string().required(),
        set: a.string(),
        number: a.string(),
        condition: a.string(),
        price: a.float(),
        image: a.string(),
        tags: a.string().array(),
        description: a.string(),

        // Keep as string for now (prevents Enum serialization errors from old data)
        status: a.string(),

        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .authorization((allow) => [
        // ✅ Public storefront read via API key
        allow.publicApiKey().to(["read"]),

        // ✅ Admin group can do full CRUD (including list/get)
        allow.groups(["Admin"]).to(["create", "read", "update", "delete"]),
      ]),
  }),

  // ✅ Enable API key auth so authMode: "apiKey" works in the app
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});





