import { a, defineData } from "@aws-amplify/backend";

export const data = defineData({
  schema: a.schema({
    InventoryItem: a
      .model({
        name: a.string().required(),
        set: a.string(),
        number: a.string(),
        condition: a.string(),
        price: a.float().required(),
        image: a.string(),
        status: a.string().required(), // available | reserved | sold
        tags: a.string().array(),
      })
      .authorization((allow) => [
        // Public users can READ inventory
        allow.guest().to(["read"]),

        // Signed-in users can READ
        allow.authenticated().to(["read"]),

        // Admin group can manage inventory
        allow.group("Admin").to(["create", "update", "delete"]),
      ]),
  }),
});



