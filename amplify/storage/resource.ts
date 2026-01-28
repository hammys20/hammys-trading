import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "cardImages",
  access: (allow) => ({
    "public/cards/*": [
      allow.guest.to(["read"]),
      allow.groups(["ADMINS"]).to(["read", "write", "delete"]),
    ],
  }),
});
