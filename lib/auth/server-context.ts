import { cookies } from "next/headers";
import outputs from "@/amplify_outputs.json";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";

const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export async function isAdminServer(): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        // contextSpec contains the required `token` your build error complained about
        return fetchAuthSession(contextSpec);
      },
    });

    const groups = session.tokens?.accessToken?.payload?.["cognito:groups"];
    return Array.isArray(groups) && groups.includes("Admin");
  } catch {
    return false;
  }
}



