const socket = io();

const productsList = document.getElementById("products-list");
const createForm = document.getElementById("create-form");
const deleteForm = document.getElementById("delete-form");
const message = document.getElementById("message");

socket.on("productsUpdated", (products) => {
    if (!productsList) return;

    productsList.innerHTML = "";

    if (!products.length) {
        const li = document.createElement("li");
        li.textContent = "No hay productos cargados.";
        productsList.appendChild(li);
        return;
    }

    products.forEach((p) => {
        const li = document.createElement("li");
        li.dataset.id = p.id;
        li.innerHTML = `<strong>${p.title}</strong> - $${p.price} (stock: ${p.stock})`;
        productsList.appendChild(li);
    });
});

socket.on("errorMessage", (text) => {
    if (message) {
        message.textContent = text;
    }
});

if (createForm) {
    createForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(createForm);
        const thumbnailsRaw = formData.get("thumbnails") || "";

        const product = {
        title: formData.get("title"),
        description: formData.get("description"),
        code: formData.get("code"),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        category: formData.get("category"),
        status: formData.get("status") === "on",
        thumbnails: thumbnailsRaw
            ? thumbnailsRaw
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        };

        socket.emit("createProduct", product);
        createForm.reset();
    });
}

if (deleteForm) {
    deleteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(deleteForm);
        const id = formData.get("id");
        socket.emit("deleteProduct", id);
        deleteForm.reset();
    });
}
