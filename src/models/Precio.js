import { model, Schema } from "mongoose";

const collection = "precio";

const schema = new Schema(
    {
        codigo: { type: String, required: true },
        precio: { type: Number, required: true },
        supermercado: { type: Schema.Types.ObjectId, ref: "supermercado", required: true }, // Cambiado a "supermercado"
        fecha: { type: Date, default: Date.now }
    },
    { strict: true }
);

const Precios = model(collection, schema);

export default Precios;
