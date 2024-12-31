import { Router } from "express";
import PreciosRouter from "./precios.api.js";


const apiRouter = Router();

apiRouter.use("/precios",PreciosRouter)


export default apiRouter