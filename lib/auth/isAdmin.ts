import { fetchAuthSession } from "aws-amplify/auth";

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    const groups =
      session.tokens?.accessToken?.payload["cognito:groups"];

    return Array.isArray(groups) && groups.includes("Admin");
  } catch {
    return false;
  }
}
