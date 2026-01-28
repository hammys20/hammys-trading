import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "inventoryImages",
  access: (allow) => ({
    "cards/*": [
      allow.guest.to(["read"]),
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
  }),
});




