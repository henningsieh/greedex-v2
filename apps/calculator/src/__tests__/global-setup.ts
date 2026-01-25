import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables from monorepo root BEFORE any tests run
// In Turborepo, the .env file is at the repository root, not in apps/calculator
const envPath = resolve(process.cwd(), "../../.env");

if (!existsSync(envPath)) {
  console.error(`❌ .env file not found at: ${envPath}`);
  process.exit(1);
}

config({ path: envPath });

console.log(`✅ Loaded environment variables from: ${envPath}`);

export default function setup() {
  // Global setup function - runs before all tests
}
