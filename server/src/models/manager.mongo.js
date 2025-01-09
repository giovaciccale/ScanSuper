import Precios from "./Precio.js";
import Supermercado from "./Supermercado.js";
import Producto from "./Producto.js";

class MongoManager {
  constructor(model) {
    this.model = model;
  }
  async create(data) {
    try {
      const one = await this.model.create(data);
      return one._id;
    } catch (error) {
      throw error;
    }
  }
  async read() {
    try {
      const all = await this.model.find();
      if (all.length === 0) {
        const error = new Error("There aren't events");
        error.statusCode = 404;
        throw error;
      }
      return all;
    } catch (error) {
      throw error;
    }
  }
  async  readOne(id) {
    try {
      const one = await this.model.findById(id);
      if (!one) {
        const error = new Error("There isn't event");
        error.statusCode = 404;
        throw error;
      }
      return one;
    } catch (error) {
      throw error;
    }
  }

  async readOneCode(codigo) {
    try {
      const one = await this.model.findOne({ codigo });
      if (!one) {
        const error = new Error("There isn't event");
        error.statusCode = 404;
        throw error;
      }
      return one;
    } catch (error) {
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      const opt = { new: true };
      //este objeto de configuración OPCIONAL devuelve el objeto LUEGO de la modificacion
      const one = await this.model.findByIdAndUpdate(id, data, opt);
      if (!one) {
        const error = new Error("There isn't event");
        error.statusCode = 404;
        throw error;
      }
      return one;
    } catch (error) {
      throw error;
    }
  }
  async destroy(id) {
    try {
      const one = await this.model.findByIdAndDelete(id);
      if (!one) {
        const error = new Error("There isn't event");
        error.statusCode = 404;
        throw error;
      }
      return one;
    } catch (error) {
      throw error;
    }
  }
}

const users = new MongoManager(Precios);
const events = new MongoManager(Supermercado);
const producto = new MongoManager(Producto);
//const orders = 

export { users, events, producto }