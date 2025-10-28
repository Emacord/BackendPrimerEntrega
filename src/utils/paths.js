import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../../");
export const DATA_DIR = path.join(ROOT, "data");
export const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
export const CARTS_FILE = path.join(DATA_DIR, "carts.json");


export async function ensureFiles() {
    try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
    for (const file of [PRODUCTS_FILE, CARTS_FILE]) {
        try {
        await fs.access(file);
        } catch {
        await fs.writeFile(file, JSON.stringify([], null, 2));
        }
    }
}
