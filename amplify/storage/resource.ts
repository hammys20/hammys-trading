// amplify/storage/resource.ts
import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "inventoryImages",
  access: (allow) => ({
    // IMPORTANT: paths must end with /* in Gen2
    "cards/*": [
      // Anyone can view images in the storefront
      allow.guest.to(["read"]),

      // Only Admins can upload/update/delete
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
  }),
});

