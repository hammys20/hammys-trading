import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "aws-amplify/adapter-nextjs";

export async function isAdminServer(): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext(
      {
        nextServerContext: { cookies },
      },
      async () => {
        return await fetchAuthSession();
      }
    );

    const groups =
      session.tokens?.accessToken?.payload?.["cognito:groups"];

    return Array.isArray(groups) && groups.includes("Admin");
  } catch {
    return false;
  }
}




