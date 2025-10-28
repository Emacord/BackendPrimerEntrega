import fs from "fs/promises";
import { randomUUID } from "crypto";
import { CARTS_FILE } from "../utils/paths.js";

export default class CartManager {
    async #readFile() {
        try {
        const raw = await fs.readFile(CARTS_FILE, "utf-8");
        return JSON.parse(raw);
        } catch (err) {
        if (err.code === "ENOENT") {
            await fs.writeFile(CARTS_FILE, JSON.stringify([], null, 2));
            return [];
        }
        throw err;
        }
    }

    async #writeFile(data) {
        await fs.writeFile(CARTS_FILE, JSON.stringify(data, null, 2));
    }

    async createCart() {
        const items = await this.#readFile();
        const newCart = { id: randomUUID(), products: [] };
        items.push(newCart);
        await this.#writeFile(items);
        return newCart;
    }

    async getById(id) {
        const items = await this.#readFile();
        return items.find(c => String(c.id) === String(id)) || null;
    }

    async addProduct(cid, pid) {
        const items = await this.#readFile();
        const idx = items.findIndex(c => String(c.id) === String(cid));
        if (idx === -1) return null;

        const cart = items[idx];
        const item = cart.products.find(p => String(p.product) === String(pid));
        if (item) {
        item.quantity += 1;
        } else {
        cart.products.push({ product: pid, quantity: 1 });
        }

        items[idx] = cart;
        await this.#writeFile(items);
        return cart;
    }
}
