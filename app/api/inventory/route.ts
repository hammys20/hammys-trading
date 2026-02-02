import { generateClient } from "aws-amplify/data";
import { NextResponse } from "next/server";
import { configureAmplify } from "@/lib/amplify-server";

configureAmplify();

// 👇 Cast to any so TS knows models exist
const client = generateClient({ authMode: "apiKey" }) as any;

function getPendingUntilMs(value: unknown): number | null {
  if (!value) return null;
  const parsed = new Date(String(value)).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function isPendingExpired(item: any, nowMs: number) {
  const status = (item?.status ?? "available").toString().toLowerCase();
  if (status !== "pending") return false;
  const pendingUntilMs = getPendingUntilMs(item?.pendingUntil);
  if (!pendingUntilMs) return true;
  return pendingUntilMs <= nowMs;
}

export async function GET() {
  try {
    const { data, errors } = await client.models.InventoryItem.list({
      limit: 500,
    });

    if (errors?.length) {
      console.error("❌ Inventory query errors:", errors);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    const nowMs = Date.now();
    const items = Array.isArray(data) ? data : [];
    const expired = items.filter((item) => isPendingExpired(item, nowMs));

    if (expired.length > 0) {
      try {
        await Promise.all(
          expired.map((item) =>
            client.models.InventoryItem.update({
              id: item.id,
              status: "available",
              pendingUntil: null,
            })
          )
        );
      } catch (err) {
        console.error("❌ Pending cleanup failed:", err);
      }
    }

    const normalized = items.map((item) =>
      isPendingExpired(item, nowMs)
        ? { ...item, status: "available", pendingUntil: null }
        : item
    );

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("❌ Inventory API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
