
import { Router } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = Router();


router.get("/", (req, res) => {
  res.redirect("/products");
});


router.get("/products", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    const filter = {};

    
    if (query) {
      if (query === "available") {
        filter.stock = { $gt: 0 };
      } else {
        filter.category = query;
      }
    }

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const skip = (page - 1) * limit;

    const [totalDocs, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const params = new URLSearchParams(req.query);

    const buildLink = (targetPage) => {
      params.set("page", targetPage);
      return `${baseUrl}?${params.toString()}`;
    };

    const prevLink = hasPrevPage ? buildLink(prevPage) : null;
    const nextLink = hasNextPage ? buildLink(nextPage) : null;

    res.render("products", {
      products: docs,
      totalPages,
      page,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      prevLink,
      nextLink,
      query: query || "",
      sort: sort || "",
    });
  } catch (err) {
    console.error("Error en vista /products:", err);
    res.status(500).send("Error al cargar productos");
  }
});


router.get("/realtimeproducts", async (_req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("realTimeProducts", { products });
  } catch (err) {
    console.error("Error en vista /realtimeproducts:", err);
    res.status(500).send("Error al cargar productos en tiempo real");
  }
});


router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", { cart });
  } catch (err) {
    console.error("Error en vista /carts/:cid:", err);
    res.status(500).send("Error al cargar el carrito");
  }
});

export default router;



