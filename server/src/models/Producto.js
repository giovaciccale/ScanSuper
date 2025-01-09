import { model, Schema } from "mongoose";

const collection = "Producto";
const schema = new Schema({
    codigo: { type: String, required: true, unique: true, index: true },
    nombre: { type: String, required: true },
    marca: { type: String, required: true },
    cantidad:  { type: String, required: true },
    imagen: { type: String, required: true },
}, { strict: true });


const Producto = model(collection, schema);

export default Producto;
