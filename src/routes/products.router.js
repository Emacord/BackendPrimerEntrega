import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const pm = new ProductManager();


router.get("/", async (_req, res) => {
    const data = await pm.getAll();
    res.json(data);
});


router.get("/:pid", async (req, res) => {
    const one = await pm.getById(req.params.pid);
    if (!one) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(one);
});


router.post("/", async (req, res) => {
    try {
        const created = await pm.add(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.put("/:pid", async (req, res) => {
    if ("id" in req.body) delete req.body.id;
    const updated = await pm.update(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
});


router.delete("/:pid", async (req, res) => {
    const ok = await pm.remove(req.params.pid);
    if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ status: "ok" });
});

export default router;
