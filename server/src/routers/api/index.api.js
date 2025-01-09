import { Router } from "express";
import PreciosRouter from "./precios.api.js";
import ProductoRouter from "./producto.api.js"

const apiRouter = Router();

apiRouter.use("/precios",PreciosRouter)
apiRouter.use("/producto",ProductoRouter )

export default apiRouter