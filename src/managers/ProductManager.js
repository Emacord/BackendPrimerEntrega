import fs from "fs/promises";
import { randomUUID } from "crypto";
import { PRODUCTS_FILE } from "../utils/paths.js";

export default class ProductManager {
    async #readFile() {
        try {
        const raw = await fs.readFile(PRODUCTS_FILE, "utf-8");
        return JSON.parse(raw);
        } catch (err) {
        if (err.code === "ENOENT") {
            await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2));
            return [];
        }
        throw err;
        }
    }

    async #writeFile(data) {
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    }

    async getAll() {
        return await this.#readFile();
    }

    async getById(id) {
        const items = await this.#readFile();
        return items.find(p => String(p.id) === String(id)) || null;
    }

    async add({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        if (!title || !description || !code || price == null || stock == null || !category) {
        throw new Error("Faltan campos obligatorios: title, description, code, price, stock, category");
        }
        const items = await this.#readFile();
        if (items.some(p => p.code === code)) {
        throw new Error("El code debe ser único");
        }
        const newProd = {
        id: randomUUID(),
        title,
        description,
        code,
        price: Number(price),
        status: Boolean(status),
        stock: Number(stock),
        category,
        thumbnails: Array.isArray(thumbnails) ? thumbnails : []
        };
        items.push(newProd);
        await this.#writeFile(items);
        return newProd;
    }

    async update(id, data) {
        const items = await this.#readFile();
        const idx = items.findIndex(p => String(p.id) === String(id));
        if (idx === -1) return null;

        const current = items[idx];
        const updated = { ...current, ...data, id: current.id }; 
        items[idx] = updated;
        await this.#writeFile(items);
        return updated;
    }

    async remove(id) {
        const items = await this.#readFile();
        const newList = items.filter(p => String(p.id) !== String(id));
        if (newList.length === items.length) return false;
        await this.#writeFile(newList);
        return true;
    }
}
