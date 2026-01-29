import { a, defineData } from "@aws-amplify/backend";

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
        status: a.enum(["AVAILABLE", "SOLD", "HIDDEN"]),
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .authorization((allow) => [
        // 🔵 Public can read ONLY
        allow.guest().to(["read"]),
        allow.authenticated().to(["read"]),

        // 🔴 Admins can do everything
        allow.groups(["Admin"]).to([
          "create",
          "update",
          "delete",
          "read",
        ]),
      ]),
  }),
});




