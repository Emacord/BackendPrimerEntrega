import express from "express";
import productsRouter from "./src/routes/products.router.js";
import cartsRouter from "./src/routes/carts.router.js";
import { ensureFiles } from "./src/utils/paths.js";

const app = express();
app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (_req, res) => {
  res.send("API OK");
});

const PORT = 8080;

(async () => {
  try {
    await ensureFiles(); // inicializa data/
    app.listen(PORT, () => {
      console.log("Servidor escuchando en http://localhost:" + PORT);
    });
  } catch (err) {
    console.error("Error al iniciar:", err);
    process.exit(1);
  }
})();
