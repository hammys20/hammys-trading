import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";

export async function isAdminServer(): Promise<boolean> {
  try {
    const session = await fetchAuthSession({
      cookies,
    });

    const groups =
      session.tokens?.accessToken?.payload["cognito:groups"];

    return Array.isArray(groups) && groups.includes("Admin");
  } catch {
    return false;
  }
}



