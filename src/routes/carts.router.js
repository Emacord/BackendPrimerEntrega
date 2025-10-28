import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cm = new CartManager();


router.post("/", async (_req, res) => {
    const cart = await cm.createCart();
    res.status(201).json(cart);
});


router.get("/:cid", async (req, res) => {
    const cart = await cm.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart.products);
});


router.post("/:cid/product/:pid", async (req, res) => {
    const cart = await cm.addProduct(req.params.cid, req.params.pid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
});

export default router;
