import { generateClient } from "aws-amplify/data";
import { NextResponse } from "next/server";
import { configureAmplify } from "@/lib/amplify-server";

configureAmplify();

// 👇 Cast to any so TS knows models exist
const client = generateClient({ authMode: "apiKey" }) as any;

export async function GET() {
  try {
    const { data, errors } = await client.models.InventoryItem.list({
      limit: 500,
    });

    if (errors?.length) {
      console.error("❌ Inventory query errors:", errors);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Inventory API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
