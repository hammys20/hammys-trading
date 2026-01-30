// amplify/storage/resource.ts
import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "inventoryImages",
  access: (allow) => ({
    // Public can read card images
    "cards/*": [
      allow.guest.to(["read"]),

      // Only Admins can upload/update/delete
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
  }),
});
