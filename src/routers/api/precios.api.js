import { Router } from "express";
import Precios from "../../models/Precio.js";
import axios from "axios";
import Supermercado from "../../models/Supermercado.js";

const PreciosRouter = Router();

PreciosRouter.post("/registrar-precio", async (req, res) => {
    const { codigo, precio, supermercadoId } = req.body; // supermercadoId en lugar de "tiendaId"

    // Validar que los datos necesarios estén presentes
    if (!codigo || !precio || !supermercadoId) {
        return res.status(400).send("Faltan datos necesarios.");
    }

    try {
        // Buscar el supermercado en la base de datos por su ID
        const supermercado = await Supermercado.findById(supermercadoId);
        if (!supermercado) {
            return res.status(404).send("Supermercado no encontrado.");
        }

        // Consultar Open Food Facts antes de registrar
        const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);

        if (response.data.status === 1) {
            const producto = response.data.product;

            // Crear el precio referenciando al supermercado encontrado
            const nuevoPrecio = await Precios.create({
                codigo,
                precio,
                supermercado: supermercado._id, // Cambiado a "supermercado"
                fecha: new Date()
            });

            res.send({
                message: "Precio registrado exitosamente con datos de Open Food Facts.",
                precio: nuevoPrecio,
                producto: {
                    nombre: producto.product_name || "Nombre no disponible",
                    marca: producto.brands || "Marca no disponible"
                }
            });
        } else {
            res.status(404).send("El producto no está en Open Food Facts. No se registró el precio.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al registrar el precio.");
    }
});

PreciosRouter.post("/supermercado", async (req, res) => {
    const { nombre, direccion, lat, lng } = req.body;

    if (!nombre || !direccion || !lat || !lng) {
        return res.status(400).send("Todos los campos son requeridos: nombre, direccion, lat, lng.");
    }

    try {
        const nuevoSupermercado = new Supermercado({
            nombre,
            direccion,
            lat,
            lng,
            location: {
                type: "Point",
                coordinates: [lng, lat] // MongoDB requiere el orden [lng, lat]
            }
        });
        await nuevoSupermercado.save();

        res.status(201).send("Supermercado guardado exitosamente.");
    } catch (error) {
        console.error("Error al guardar el supermercado:", error);
        res.status(500).send("Error al guardar el supermercado.");
    }
});

PreciosRouter.get("/supermercados", async (req, res) => {
    const { lat, lng, distancia = 6

     } = req.query; // Valor predeterminado: 10 kilómetros

    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitud y longitud son requeridas." });
    }

    try {
        const supermercadosCercanos = await Supermercado.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distancia",
                    spherical: true,
                    maxDistance: distancia * 1000 // Convertir a metros
                }
            }
        ]);

        if (supermercadosCercanos.length === 0) {
            return res.status(404).json({ message: "No se encontraron supermercados cercanos." });
        }

        res.json(supermercadosCercanos);
    } catch (error) {
        console.error("Error al buscar supermercados:", error);
        res.status(500).json({ error: "Error al buscar supermercados cercanos." });
    }
});


//Precios de Producto x
PreciosRouter.get("/:codigo", async (req, res) => {
    const { codigo } = req.params;

    try {
        // Obtener los precios desde la base de datos con información del supermercado
        const resultados = await Precios.find({ codigo })
            .sort({ fecha: -1 })
            .populate("supermercado"); // Incluye los detalles del supermercado

        if (resultados.length === 0) {
            return res.status(404).send("No se encontraron precios para este producto.");
        }

        // Consultar Open Food Facts para obtener los datos del producto
        const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
        const producto = response.data.status === 1 ? response.data.product : null;

        res.json({
            producto: {
                nombre: producto?.product_name || "Nombre no disponible",
                marca: producto?.brands || "Marca no disponible",
                imagen: producto?.image_url || "https://via.placeholder.com/150"
            },
            precios: resultados,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al consultar los precios.");
    }
});




// Endpoint para buscar información de un producto en Open Food Facts
PreciosRouter.get("/producto/:codigo", async (req, res) => {
    const { codigo } = req.params;

    try {
        const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);

        if (response.data.status === 1) {
            // Producto encontrado
            const producto = response.data.product;
            res.json({
                nombre: producto.product_name || "Nombre no disponible",
                marca: producto.brands || "Marca no disponible",
                ingredientes: producto.ingredients_text || "Ingredientes no disponibles",
                calorias: producto.nutriments?.energy || "Calorías no disponibles",
                imagen: producto.image_url || "Imagen no disponible"
            });
        } else {
            // Producto no encontrado
            res.status(404).send("Producto no encontrado en Open Food Facts.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al consultar Open Food Facts.");
    }
});





export default PreciosRouter;