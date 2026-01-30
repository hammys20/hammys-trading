// lib/appsync.ts
type GraphQLResult<T> = { data?: T; errors?: Array<{ message?: string }> };

export function gql(strings: TemplateStringsArray, ...expr: any[]) {
  return strings.reduce((acc, s, i) => acc + s + (expr[i] ?? ""), "");
}

/**
 * Call AppSync using API key (public read) or JWT (admin).
 * Requires:
 * - NEXT_PUBLIC_AMPLIFY_GRAPHQL_ENDPOINT
 * - NEXT_PUBLIC_AMPLIFY_API_KEY  (for apiKey mode)
 */
export async function graphqlRequest<TData>(
  query: string,
  variables?: Record<string, any>,
  opts?: { authMode?: "apiKey" | "userPool"; token?: string }
): Promise<TData> {
  const endpoint = process.env.NEXT_PUBLIC_AMPLIFY_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error("Missing NEXT_PUBLIC_AMPLIFY_GRAPHQL_ENDPOINT");

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  const authMode = opts?.authMode ?? "apiKey";
  if (authMode === "apiKey") {
    const apiKey = process.env.NEXT_PUBLIC_AMPLIFY_API_KEY;
    if (!apiKey) throw new Error("Missing NEXT_PUBLIC_AMPLIFY_API_KEY");
    headers["x-api-key"] = apiKey;
  } else {
    const token = opts?.token;
    if (!token) throw new Error("Missing userPool token for GraphQL request");
    headers["authorization"] = token;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: variables ?? {} }),
    cache: "no-store",
  });

  const json = (await res.json()) as GraphQLResult<TData>;
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);

  if (json.errors?.length) {
    const msg = json.errors.map((e) => e?.message ?? "Unknown error").join(" | ");
    throw new Error(msg);
  }

  if (!json.data) throw new Error("GraphQL: missing data");
  return json.data;
}
