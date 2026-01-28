import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { HttpRequest } from "@aws-sdk/protocol-http";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import fetch from "node-fetch";

/**
 * Ensure .env.local is loaded when running Node scripts (tsx / ts-node)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

/**
 * Validate required env vars early and loudly
 */
const GRAPHQL_ENDPOINT = process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT;
const REGION = process.env.AWS_REGION || "us-east-1";

if (!GRAPHQL_ENDPOINT) {
  console.error("❌ ENV LOAD FAILED");
  console.error("CWD:", process.cwd());
  console.error(
    "ENV KEYS:",
    Object.keys(process.env).filter(
      (k) => k.includes("AMPLIFY") || k.includes("AWS")
    )
  );
  throw new Error(
    "AMPLIFY_DATA_GRAPHQL_ENDPOINT is undefined. Check .env.local location and contents."
  );
}

const endpoint = new URL(GRAPHQL_ENDPOINT);
const signer = new SignatureV4({
  service: "appsync",
  region: REGION,
  credentials: defaultProvider(),
  sha256: Sha256,
});

/**
 * Signed GraphQL fetch helper (IAM)
 */
export async function gql<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const request = new HttpRequest({
    method: "POST",
    protocol: endpoint.protocol,
    hostname: endpoint.hostname,
    path: endpoint.pathname,
    headers: {
      "content-type": "application/json",
      host: endpoint.hostname,
    },
    body: JSON.stringify({ query, variables }),
  });

  const signed = await signer.sign(request);

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: signed.headers as any,
    body: signed.body,
  });

  const json = await response.json();

  if (json.errors) {
    console.error("❌ AppSync GraphQL Error:", json.errors);
    throw new Error("GraphQL request failed");
  }

  return json.data;
}
