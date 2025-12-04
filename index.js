
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import productsRouter from "./src/routes/products.router.js";
import cartsRouter from "./src/routes/carts.router.js";
import viewsRouter from "./src/routes/views.router.js";
import Product from "./src/models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "src", "public")));


app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);


app.use("/", viewsRouter);


io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  const products = await Product.find().lean();
  socket.emit("productsUpdated", products);

  socket.on("createProduct", async (data) => {
    try {
      await Product.create(data);
      const updated = await Product.find().lean();
      io.emit("productsUpdated", updated);
    } catch (err) {
      console.error("Error al crear producto por WS:", err.message);
      socket.emit("errorMessage", err.message);
    }
  });

  socket.on("deleteProduct", async (id) => {
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        socket.emit("errorMessage", "Producto no encontrado");
        return;
      }
      const updated = await Product.find().lean();
      io.emit("productsUpdated", updated);
    } catch (err) {
      console.error("Error al eliminar producto por WS:", err.message);
      socket.emit("errorMessage", "Error al eliminar el producto");
    }
  });
});

const PORT = 8080;
const MONGO_URI = "mongodb+srv://coderuser:coder1234@cluster0.94j5za2.mongodb.net/coderBackend?retryWrites=true&w=majority&appName=Cluster0";





(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    httpServer.listen(PORT, () => {
      console.log("Servidor escuchando en http://localhost:" + PORT);
    });
  } catch (err) {
    console.error("Error al iniciar:", err);
    process.exit(1);
  }
})();



