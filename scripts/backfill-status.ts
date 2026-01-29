import { client } from "../lib/data";

async function run() {
  const { data, errors } = await client.models.InventoryItem.list();
  if (errors) throw new Error(JSON.stringify(errors));

  let updated = 0;

  for (const item of data) {
    if (!item.status) {
      await client.models.InventoryItem.update({
        id: item.id,
        status: "available",
      });
      console.log("Backfilled:", item.id);
      updated++;
    }
  }

  console.log(`✅ Done. Updated ${updated} items.`);
}

run().catch((e) => {
  console.error("❌ Backfill failed:", e);
  process.exit(1);
});
