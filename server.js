const express = require("express");
const app = express();

app.use(express.json());

let precios = []; // Base de datos temporal

// Registrar un precio
app.post("/registrar-precio", (req, res) => {
    const { codigo, precio, tienda, ubicacion } = req.body;

    if (!codigo || !precio || !tienda) {
        return res.status(400).send("Faltan datos necesarios.");
    }

    precios.push({ codigo, precio, tienda, ubicacion, fecha: new Date() });
    res.send("Precio registrado exitosamente.");
});

// Consultar precios para un producto
app.get("/precios/:codigo", (req, res) => {
    const { codigo } = req.params;
    const resultados = precios.filter((p) => p.codigo === codigo);

    if (resultados.length === 0) {
        return res.status(404).send("No se encontraron precios para este producto.");
    }

    res.json(resultados);
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
