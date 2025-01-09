import { Router } from "express";
import { producto } from "../../models/manager.mongo.js";

const ProductoRouter = Router();

ProductoRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data)
    const response = await producto.create(data);
    return res.json({
      statusCode: 201,
      response,
    });
  } catch (error) {
    return next(error);
  }
});


ProductoRouter.get("/:codigo", async (req, res, next) => {
    try {
      const { codigo } = req.params;
      const one = await producto.readOneCode(codigo);
      return res.json({
        statusCode: 200,
        response: one,
      });
    } catch (error) {
      return next(error);
    }
  });

export default ProductoRouter;
