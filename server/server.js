import "dotenv/config.js";
import dbConnection from "./src/utils/db.js";
import express from "express";
import router from "./src/routers/index.router.js";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import cors from "cors";



// Define __dirname manualmente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.get("/favicon.ico", (req, res) => res.status(204));
const corsOptions = {
  origin: true, // O el puerto donde corre tu cliente
  credentials: true,
};
app.use(cors(corsOptions));
// Configura morgan en modo "dev" para colores
app.use(morgan("dev")); // "dev" ya incluye colores por defecto

app.use(express.json());

// Configurar el directorio "public" como estático
app.use(express.static(path.join(__dirname, "public")));

// Configurar el directorio "scripts" como estático
app.use("/scripts", express.static(path.join(__dirname, "scripts")));

// Ruta principal para servir el archivo HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//endpoints
app.use("/", router);

// Iniciar el servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
    dbConnection();
});