import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./src/routes/products.router.js";
import cartsRouter from "./src/routes/carts.router.js";
import viewsRouter from "./src/routes/views.router.js";
import ProductManager from "./src/managers/ProductManager.js";
import { ensureFiles } from "./src/utils/paths.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const pm = new ProductManager();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));


app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);


app.use("/", viewsRouter);


io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");


  const products = await pm.getAll();
  socket.emit("productsUpdated", products);


  socket.on("createProduct", async (data) => {
    try {
      await pm.add(data);
      const updated = await pm.getAll();
      io.emit("productsUpdated", updated);
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });


  socket.on("deleteProduct", async (id) => {
    const ok = await pm.remove(id);
    if (!ok) {
      socket.emit("errorMessage", "Producto no encontrado");
      return;
    }
    const updated = await pm.getAll();
    io.emit("productsUpdated", updated);
  });
});

const PORT = 8080;

(async () => {
  try {
    await ensureFiles();
    httpServer.listen(PORT, () => {
      console.log("Servidor escuchando en http://localhost:" + PORT);
    });
  } catch (err) {
    console.error("Error al iniciar:", err);
    process.exit(1);
  }
})();

