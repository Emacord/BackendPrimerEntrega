import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const pm = new ProductManager();


router.get("/", async (_req, res) => {
    const products = await pm.getAll();
    res.render("home", { products });
});


router.get("/realtimeproducts", async (_req, res) => {
    const products = await pm.getAll();
    res.render("realTimeProducts", { products });
});

export default router;
