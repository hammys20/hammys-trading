import { a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  InventoryItem: a
    .model({
      name: a.string().required(),
      set: a.string(),
      number: a.string(),
      condition: a.string(),
      price: a.float(),
      tags: a.string().array(),
      imageKey: a.string(), // S3 key/path
      description: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]), // public storefront read
      allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]), // admin CRUD
    ]),
});

export const data = defineData({
  schema,
});
