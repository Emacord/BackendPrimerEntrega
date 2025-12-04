
import { Router } from "express";
import Cart from "../models/cart.model.js";

const router = Router();


router.post("/", async (_req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    const item = cart.products.find(
      (p) => p.product.toString() === pid
    );

    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== pid
    );

    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});



router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: "error",
        message: "El campo products debe ser un arreglo",
      });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = products;
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});



router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity == null || isNaN(quantity)) {
      return res.status(400).json({
        status: "error",
        message: "Debe enviar una cantidad numérica",
      });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    const item = cart.products.find(
      (p) => p.product.toString() === pid
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado en el carrito",
      });
    }

    item.quantity = Number(quantity);
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;

