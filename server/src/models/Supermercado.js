import { model, Schema } from "mongoose";

const collection = "supermercado";
const schema = new Schema({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, { strict: true });

// Crear el índice geoespacial
schema.index({ location: "2dsphere" });

const Supermercado = model(collection, schema);

export default Supermercado;


