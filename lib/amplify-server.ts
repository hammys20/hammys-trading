import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  Amplify.configure(outputs, {
    ssr: true, // 👈 CRITICAL for Next.js App Router
  });

  configured = true;
}
