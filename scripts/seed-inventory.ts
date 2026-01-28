import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { gql } from "../lib/appsync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inventoryPath = path.join(__dirname, "../data/inventory.json");
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));

const CREATE_ITEM = /* GraphQL */ `
  mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
    createInventoryItem(input: $input) {
      id
    }
  }
`;

async function seed() {
  for (const item of inventory) {
    console.log("Seeding:", item.name);

    await gql(CREATE_ITEM, {
      input: {
        name: item.name,
        set: item.set,
        number: item.number,
        condition: item.condition,
        price: item.price,
        image: item.image,
        tags: item.tags,
        status: item.status ?? "available",
      },
    });
  }

  console.log("✅ Inventory seeded successfully");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
