import { generateClient } from "aws-amplify/data";

// Public reads via API key (matches your backend auth config)
export const client = generateClient({ authMode: "apiKey" as const });
