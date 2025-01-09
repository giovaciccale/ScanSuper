import { Router } from "express";
import Precios from "../../models/Precio.js";
import axios from "axios";
import Supermercado from "../../models/Supermercado.js";
import propsPrecios from "../../middleware/propsPrecios.mid.js"

const PreciosRouter = Router();

PreciosRouter.post("/registrar-precio",propsPrecios, async (req, res) => {
    const { codigo, precio, supermercadoId } = req.body; // supermercadoId en lugar de "tiendaId"
    try {
        // Buscar el supermercado en la base de datos por su ID
        const supermercado = await Supermercado.findById(supermercadoId);
        if (!supermercado) {
            return res.status(404).send("Supermercado no encontrado.");
        }

        // Consultar en BBDD antes de registrar
        const response = await axios.get(`http://localhost:3000/api/producto/${codigo}`);
        if (response.data.statusCode === 200 ) {
            const producto = response.data.response;

            // Crear el precio referenciando al supermercado encontrado
            const nuevoPrecio = await Precios.create({
                codigo,
                precio,
                supermercado: supermercado._id, // Cambiado a "supermercado"
                fecha: new Date()
            });

            res.send({
                message: "Precio registrado exitosamente con datos de la BBDD.",
                precio: nuevoPrecio,
                producto: {
                    nombre: producto.nombre || "Nombre no disponible",
                    marca: producto.marca || "Marca no disponible"
                }
            });
        } else {
            res.status(404).send("El producto no está en Base de Datos. No se registró el precio.");
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
                    maxDistance: distancia * 2000 // Convertir a metros
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

// Precios de Producto x
PreciosRouter.get("/:codigo", async (req, res) => {
    const { codigo } = req.params;

    try {
        // Obtener los precios desde la base de datos con información del supermercado
        const resultados = await Precios.find({ codigo })
            .sort({ fecha: -1 })
            .populate("supermercado"); // Incluye los detalles del supermercado
        
        console.log(resultados)

        // Consultar Open Food Facts para obtener los datos del producto
        const response = await axios.get(`http://localhost:3000/api/producto/${codigo}`);
        const producto = response?.data?.statusCode === 200 ? response.data.response : null;


        // Si no hay precios ni información del producto
        if (resultados.length === 0 && !codigo) {
            return res.status(404).json({
                mensaje: "No se encontraron precios ni información del producto.",
                producto: {
                    codigo: producto?.codigo || "No existe Producto en BBDD",
                    nombre: producto?.nombre || "Nombre no disponible",
                    marca: producto?.marca || "Marca no disponible",
                    imagen: producto?.imagen || "https://via.placeholder.com/150"
                },
                precios: []
            });
        }

        // Si no hay precios pero sí hay información del producto
        if (resultados.length === 0) {
            return res.status(200).json({
                mensaje: "Producto sin precios asignados.",
                producto: {
                    codigo: producto?.codigo || "No existe Producto en BBDD",
                    nombre: producto?.nombre || "Nombre no disponible",
                    marca: producto?.marca || "Marca no disponible",
                    imagen: producto?.imagen || "https://via.placeholder.com/150"
                },
                precios: []
            });
        }

        // Si hay precios, devolver información completa
        res.status(200).json({
            producto: {
                codigo: producto?.codigo || "No existe Producto en Food",
                nombre: producto?.nombre || "Nombre no disponible",
                marca: producto?.marca || "Marca no disponible",
                imagen: producto?.imagen || "https://via.placeholder.com/150"
            },
            precios: resultados,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al consultar los precios.");
    }
});
// Endpoint para buscar información de un producto de la BBDD
PreciosRouter.get("/producto/:codigo", async (req, res) => {
    const { codigo } = req.params;

    try {
        const response = await axios.get(`http://localhost:3000/api/producto/${codigo}`);

        if (response.data.statusCode === 200 ) {
            // Producto encontrado
            const producto = response.data.response;
            res.json({
                codigo: producto?.codigo || "No existe Producto en Food",
                nombre: producto.nombre || "Nombre no disponible",
                marca: producto.marca || "Marca no disponible",
                imagen: producto.imagen || "Imagen no disponible"
            });
        } else {
            // Producto no encontrado
            res.status(404).send("Producto no encontrado en Open la BBDD.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al consultar en la BBDD.");
    }
});





export default PreciosRouter;