import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "inventoryImages",

  // Path-based authorization (Gen 2 style)
  access: (allow) => ({
    "cards/*": [
      // Public/guest can READ card images
      allow.guest.to(["read"]),

      // Admin group can manage card images
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
  }),
});





