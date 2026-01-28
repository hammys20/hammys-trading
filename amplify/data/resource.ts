import { defineData, a } from "@aws-amplify/backend";

export const data = defineData({
  schema: a.schema({
    InventoryItem: a
      .model({
        name: a.string().required(),
        set: a.string(),
        number: a.string(),
        condition: a.string(),
        price: a.float(),
        tags: a.string().array(),
        imageKey: a.string(),
        description: a.string(),
      })
      .authorization((allow) => [
        allow.guest().to(["read"]),
        allow.groups(["Admin"]),
      ]),
  }),
});


