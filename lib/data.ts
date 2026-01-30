import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";

ensureAmplifyConfigured();

export const client = generateClient<Schema>({
  authMode: "apiKey",
});


