// lib/data.ts
import { generateClient } from "aws-amplify/data";
import { configureAmplify } from "@/lib/amplify-server";

// Ensure Amplify is configured for SSR/build/runtime usage
configureAmplify();

// Use API key by default (public storefront). Admin calls override authMode per operation.
export const client = generateClient({ authMode: "apiKey" as const });

// lib/data.ts
// import { generateClient } from "aws-amplify/data";
// import type { Schema } from "@/amplify/data/resource";

// /**
//  * Client-safe Amplify Data client
//  * - Default auth mode for public storefront reads: API key
//  * - Admin calls should override authMode to "userPool" per call
//  */
// export const client = generateClient<Schema>({
//   authMode: "apiKey",
// });

