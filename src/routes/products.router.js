import { Router } from "express";
import Product from "../models/product.model.js";

const router = Router();


router.get("/", async (req, res) => {
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

    res.json({
      status: "success",
      payload: docs,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (err) {
    console.error("Error en GET /api/products:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
    res.json({ status: "success", payload: product });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const created = await Product.create(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});


router.put("/:pid", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true }
    ).lean();

    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }

    res.json({ status: "success", payload: updated });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});


router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid).lean();
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
    res.json({ status: "success", payload: deleted });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;


