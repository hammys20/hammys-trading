import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "inventoryImages",
  access: (allow) => [
    allow.guest.to(["read"]),
    allow.group("Admin").to(["read", "write", "delete"]),
  ],
});

