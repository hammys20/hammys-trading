import { generateClient } from "aws-amplify/data";
import type { ClientSchema } from "@/amplify/data/resource";

export const client = generateClient<ClientSchema>();
